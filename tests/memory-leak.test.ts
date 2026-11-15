/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 *
 * Models, screen views and their panels live for the whole sim. What is created and thrown away
 * at runtime is chart content: every rebuild disposes the old nodes, which link to profile colours
 * and, for TitrationChartNode, to a ChartTransform and a locale-dependent axis title.
 *
 * Beyond that:
 *  - the three screen models are plain object graphs and must be collectible as a unit, however
 *    they were driven (titration runs, refills, resets, indicator and analyte changes);
 *  - FlaskNode, SpeciesChartNode and ColorRangesNode link model and colour Properties in
 *    Multilinks that are never torn down (they live as long as their screen, and do not implement
 *    dispose()), so they are not in the disposal list. Instead, repeated model changes must not
 *    pile listeners onto the long-lived Properties they observe.
 */

import { StringProperty } from "scenerystack/axon";
import { describe, expect, it } from "vitest";
import { ACETIC_ACID, ANALYTES } from "../src/common/model/Analytes.js";
import { INDICATORS } from "../src/common/model/Indicators.js";
import { SOLUTION_COLOR_DEPENDENCIES } from "../src/common/view/indicatorColor.js";
import { TitrationChartNode } from "../src/common/view/TitrationChartNode.js";
import { CURVE_ANALYTES, CurvesModel } from "../src/curves/model/CurvesModel.js";
import { SpeciesChartNode } from "../src/curves/view/SpeciesChartNode.js";
import { StringManager } from "../src/i18n/StringManager.js";
import { IndicatorsModel } from "../src/indicators/model/IndicatorsModel.js";
import { ColorRangesNode } from "../src/indicators/view/ColorRangesNode.js";
import { LabModel, UNKNOWN } from "../src/lab/model/LabModel.js";
import { FlaskNode } from "../src/lab/view/FlaskNode.js";
import { TitrationLabPreferencesModel } from "../src/preferences/TitrationLabPreferencesModel.js";
import TitrationLabColors from "../src/TitrationLabColors.js";
import { describeDisposalLeaks, forceGC } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  {
    name: "TitrationChartNode",
    create: () => new TitrationChartNode(300, 200, new StringProperty("Volume (mL)")),
    idempotentDispose: true,
  },
]);

/** Listener count of a Property (public at runtime, private in the type declarations). */
const listenerCount = (property: object): number =>
  (property as unknown as { getListenerCount(): number }).getListenerCount();

/** Drives a LabModel through the actions a student takes. */
function driveLab(model: LabModel): void {
  model.meterInFlaskProperty.value = true;
  model.flowRateProperty.value = 2;
  for (let i = 0; i < 120; i++) {
    model.step(1 / 60);
  }
  model.dispense(5);
  model.recordReading();
  model.refill();
  model.sampleProperty.value = UNKNOWN;
  model.newUnknown();
  model.answerProperty.value = 0.2;
  model.checkAnswer();
  model.sampleProperty.value = ANALYTES[1] ?? ACETIC_ACID;
  model.indicatorProperty.value = INDICATORS[1] ?? null;
  model.reset();
}

function driveCurves(model: CurvesModel): void {
  model.analyteProperty.value = CURVE_ANALYTES[2] ?? ACETIC_ACID;
  model.compareProperty.value = ACETIC_ACID;
  model.customPKaProperty.value = 7;
  model.cursorFractionProperty.value = 0.5;
  model.jumpToKeyPoint(1);
  model.jumpToKeyPoint(-1);
  model.reset();
}

function driveIndicators(model: IndicatorsModel): void {
  model.pHProperty.value = 3;
  model.indicatorProperty.value = INDICATORS[2] ?? model.indicatorProperty.value;
  model.titrationAnalyteProperty.value = ANALYTES[1] ?? ACETIC_ACID;
  model.reset();
}

const createAndDropLabModel = (): WeakRef<object> => {
  const model = new LabModel();
  driveLab(model);
  return new WeakRef<object>(model);
};

const createAndDropCurvesModel = (): WeakRef<object> => {
  const model = new CurvesModel();
  driveCurves(model);
  return new WeakRef<object>(model);
};

const createAndDropIndicatorsModel = (): WeakRef<object> => {
  const model = new IndicatorsModel();
  driveIndicators(model);
  return new WeakRef<object>(model);
};

const createAndDropPreferences = (): WeakRef<object> => {
  const preferences = new TitrationLabPreferencesModel();
  preferences.showReadingProperty.value = !preferences.showReadingProperty.value;
  preferences.reset();
  return new WeakRef<object>(preferences);
};

/** A chart built on a long-lived axis title, as every real chart is; disposing must release it. */
const createAndDisposeChartOnSharedTitle = (title: StringProperty): WeakRef<object> => {
  const chart = new TitrationChartNode(300, 200, title);
  chart.setMaxVolume(25);
  chart.setMaxVolume(100);
  const ref = new WeakRef<object>(chart);
  chart.dispose();
  return ref;
};

describe("screen models are collected after drop", () => {
  const cases: readonly (readonly [string, () => WeakRef<object>])[] = [
    ["LabModel", createAndDropLabModel],
    ["CurvesModel", createAndDropCurvesModel],
    ["IndicatorsModel", createAndDropIndicatorsModel],
    ["TitrationLabPreferencesModel", createAndDropPreferences],
  ];

  for (const [name, createAndDrop] of cases) {
    it(`${name} is collected after drop`, async () => {
      const ref = createAndDrop();
      await forceGC(ref);
      expect(ref.deref()).toBeUndefined();
    });

    it(`${name}: repeated create/drop cycles leave no survivors`, async () => {
      const refs: WeakRef<object>[] = [];
      for (let i = 0; i < 10; i++) {
        refs.push(createAndDrop());
      }
      await forceGC(refs);
      expect(refs.filter((r) => r.deref() !== undefined).length).toBe(0);
    });
  }
});

describe("TitrationChartNode on a long-lived axis title", () => {
  it("is collected after dispose and leaves no listeners on the title", async () => {
    const title = new StringProperty("Volume (mL)");
    const before = listenerCount(title);
    const refs = Array.from({ length: 10 }, () => createAndDisposeChartOnSharedTitle(title));
    await forceGC(refs);
    expect(refs.filter((r) => r.deref() !== undefined).length).toBe(0);
    expect(listenerCount(title)).toBe(before);
  });

  it("changing the volume axis leaves the colour profile listeners unchanged", () => {
    const chart = new TitrationChartNode(300, 200, new StringProperty("Volume (mL)"));
    const colors = [
      TitrationLabColors.textColorProperty,
      TitrationLabColors.chartGridColorProperty,
      TitrationLabColors.chartAxisColorProperty,
    ];
    const before = colors.map(listenerCount);
    for (let i = 0; i < 20; i++) {
      chart.setMaxVolume(10 + 5 * i);
    }
    expect(colors.map(listenerCount)).toEqual(before);
    chart.dispose();
  });
});

describe("screen views do not accumulate listeners while their models change", () => {
  const common = StringManager.getInstance().getCommonStrings();

  it("FlaskNode: titrating, refilling and resetting leaves model and colour listeners unchanged", () => {
    const model = new LabModel();
    new FlaskNode(model);
    const properties = [
      model.pHProperty,
      model.indicatorProperty,
      model.titrantAddedProperty,
      model.setupProperty,
      model.localPHProperty,
      model.localExcessProperty,
      ...SOLUTION_COLOR_DEPENDENCIES,
    ];
    const before = properties.map(listenerCount);
    for (let i = 0; i < 5; i++) {
      driveLab(model);
    }
    expect(properties.map(listenerCount)).toEqual(before);
  });

  it("FlaskNode adds a fixed set of listeners per flask, none while the model runs", () => {
    const model = new LabModel();
    const base = listenerCount(model.pHProperty);
    new FlaskNode(model);
    const perFlask = listenerCount(model.pHProperty) - base;
    expect(perFlask).toBeGreaterThan(0);
    driveLab(model);
    expect(listenerCount(model.pHProperty)).toBe(base + perFlask);
  });

  it("SpeciesChartNode: changing analyte, compare and cursor leaves model and colour listeners unchanged", () => {
    const model = new CurvesModel();
    new SpeciesChartNode(model, 300, 200, new StringProperty("Volume (mL)"));
    const properties = [
      model.setupProperty,
      model.maxVolumeProperty,
      model.volumeProperty,
      TitrationLabColors.textColorProperty,
      TitrationLabColors.curveColorProperty,
      TitrationLabColors.cursorColorProperty,
      common.fractionAxisStringProperty,
    ];
    const before = properties.map(listenerCount);
    for (let i = 0; i < 5; i++) {
      for (const analyte of CURVE_ANALYTES) {
        model.analyteProperty.value = analyte;
        model.cursorFractionProperty.value = (i + 1) / 6;
      }
      driveCurves(model);
    }
    expect(properties.map(listenerCount)).toEqual(before);
  });

  it("ColorRangesNode: changing pH and indicator leaves model and colour listeners unchanged", () => {
    const model = new IndicatorsModel();
    new ColorRangesNode(model.pHProperty, model.indicatorProperty, 400);
    const properties = [model.pHProperty, model.indicatorProperty, ...SOLUTION_COLOR_DEPENDENCIES];
    const before = properties.map(listenerCount);
    for (let i = 0; i < 5; i++) {
      for (const indicator of INDICATORS) {
        model.indicatorProperty.value = indicator;
        model.pHProperty.value = 1 + i;
      }
      driveIndicators(model);
    }
    expect(properties.map(listenerCount)).toEqual(before);
  });
});
