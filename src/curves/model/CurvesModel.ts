/**
 * CurvesModel.ts
 *
 * The calculated titration curve of one analyte (or a custom weak acid HA with a chosen pKa),
 * optionally compared with a second analyte at the same concentrations. A cursor moves along the
 * volume axis; the view reads the pH, region, species and amounts there.
 *
 * The cursor is stored as a fraction of the volume axis, which runs to twice the last
 * equivalence point, so it stays at the same stage of the titration when the setup changes
 * (the equivalence point stays at the middle of the axis).
 */

import { BooleanProperty, DerivedProperty, NumberProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { ACETIC_ACID, ANALYTES, type Analyte, customAcid } from "../../common/model/Analytes.js";
import {
  equivalenceVolumes,
  keyVolumes,
  pHAt,
  type Region,
  regionAt,
  type TitrationSetup,
} from "../../common/model/TitrationCurve.js";
import {
  ANALYTE_CONCENTRATION_RANGE,
  CUSTOM_PKA_RANGE,
  DEFAULT_ANALYTE_VOLUME,
  DEFAULT_CONCENTRATION,
  DEFAULT_CUSTOM_PKA,
  TITRANT_CONCENTRATION_RANGE,
} from "../../TitrationLabConstants.js";
import TitrationLabNamespace from "../../TitrationLabNamespace.js";

/** Stand-in for the custom acid in the analyte menu; its pKa comes from customPKaProperty. */
export const CUSTOM_ACID: Analyte = customAcid(DEFAULT_CUSTOM_PKA);

/** Analytes on the Curves menu. */
export const CURVE_ANALYTES: readonly Analyte[] = [...ANALYTES, CUSTOM_ACID];

/** Cursor resolution when stepping with the keyboard. */
const CURSOR_EPSILON = 1e-6;

export class CurvesModel implements TModel {
  public readonly analyteProperty = new Property<Analyte>(ACETIC_ACID, { validValues: CURVE_ANALYTES });
  public readonly compareProperty = new Property<Analyte | null>(null, { validValues: [null, ...CURVE_ANALYTES] });
  public readonly analyteConcentrationProperty = new NumberProperty(DEFAULT_CONCENTRATION, {
    range: ANALYTE_CONCENTRATION_RANGE,
  });
  public readonly titrantConcentrationProperty = new NumberProperty(DEFAULT_CONCENTRATION, {
    range: TITRANT_CONCENTRATION_RANGE,
  });
  public readonly customPKaProperty = new NumberProperty(DEFAULT_CUSTOM_PKA, { range: CUSTOM_PKA_RANGE });

  /** Cursor position as a fraction (0–1) of the volume axis. */
  public readonly cursorFractionProperty = new NumberProperty(0.25, { range: new Range(0, 1) });

  public readonly showSpeciesProperty = new BooleanProperty(true);
  public readonly showBufferProperty = new BooleanProperty(true);
  public readonly showKeyPointsProperty = new BooleanProperty(true);
  public readonly showEquationsProperty = new BooleanProperty(false);

  public readonly setupProperty: TReadOnlyProperty<TitrationSetup>;
  public readonly compareSetupProperty: TReadOnlyProperty<TitrationSetup | null>;
  /** End of the volume axis (mL). */
  public readonly maxVolumeProperty: TReadOnlyProperty<number>;
  /** Cursor volume (mL). */
  public readonly volumeProperty: TReadOnlyProperty<number>;
  public readonly pHProperty: TReadOnlyProperty<number>;
  public readonly regionProperty: TReadOnlyProperty<Region>;

  public constructor() {
    const resolve = (analyte: Analyte, pKa: number): Analyte => (analyte === CUSTOM_ACID ? customAcid(pKa) : analyte);
    this.setupProperty = new DerivedProperty(
      [
        this.analyteProperty,
        this.customPKaProperty,
        this.analyteConcentrationProperty,
        this.titrantConcentrationProperty,
      ],
      (analyte, pKa, analyteConcentration, titrantConcentration) => ({
        analyte: resolve(analyte, pKa),
        analyteConcentration,
        analyteVolume: DEFAULT_ANALYTE_VOLUME,
        titrantConcentration,
      }),
    );
    this.compareSetupProperty = new DerivedProperty(
      [this.compareProperty, this.setupProperty, this.customPKaProperty],
      (compare, setup, pKa) => (compare ? { ...setup, analyte: resolve(compare, pKa) } : null),
    );
    this.maxVolumeProperty = new DerivedProperty([this.setupProperty, this.compareSetupProperty], (setup, compare) => {
      const last = (s: TitrationSetup): number => equivalenceVolumes(s).at(-1) as number;
      return 2 * Math.max(last(setup), compare ? last(compare) : 0);
    });
    this.volumeProperty = new DerivedProperty(
      [this.cursorFractionProperty, this.maxVolumeProperty],
      (fraction, max) => fraction * max,
    );
    this.pHProperty = new DerivedProperty([this.setupProperty, this.volumeProperty], pHAt);
    this.regionProperty = new DerivedProperty([this.setupProperty, this.volumeProperty], regionAt);
  }

  /** Moves the cursor to the next (direction 1) or previous (−1) key point. */
  public jumpToKeyPoint(direction: 1 | -1): void {
    const max = this.maxVolumeProperty.value;
    const fractions = keyVolumes(this.setupProperty.value)
      .map((volume) => volume / max)
      .filter((fraction) => fraction <= 1);
    const current = this.cursorFractionProperty.value;
    const target =
      direction === 1
        ? fractions.find((fraction) => fraction > current + CURSOR_EPSILON)
        : fractions.reverse().find((fraction) => fraction < current - CURSOR_EPSILON);
    if (target !== undefined) {
      this.cursorFractionProperty.value = target;
    }
  }

  public reset(): void {
    this.analyteProperty.reset();
    this.compareProperty.reset();
    this.analyteConcentrationProperty.reset();
    this.titrantConcentrationProperty.reset();
    this.customPKaProperty.reset();
    this.cursorFractionProperty.reset();
    this.showSpeciesProperty.reset();
    this.showBufferProperty.reset();
    this.showKeyPointsProperty.reset();
    this.showEquationsProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing moves on its own.
  }
}

TitrationLabNamespace.register("CurvesModel", CurvesModel);
