import { describe, expect, it } from "vitest";
import { ACETIC_ACID, PHOSPHORIC_ACID } from "../../src/common/model/Analytes.js";
import { pHAt } from "../../src/common/model/TitrationCurve.js";
import { LabModel } from "../../src/lab/model/LabModel.js";
import { MAX_RECORDED_POINTS } from "../../src/TitrationLabConstants.js";

describe("lab chart axis", () => {
  it("covers an endpoint beyond one burette, and grows as refills carry the titrant past it", () => {
    const model = new LabModel();
    model.sampleProperty.value = ACETIC_ACID;
    model.analyteConcentrationProperty.value = 0.2;
    model.titrantConcentrationProperty.value = 0.05;
    // 25 mL × 0.200 M / 0.050 M = 100 mL to equivalence.
    expect(model.chartMaxVolume()).toBeGreaterThanOrEqual(100);

    model.analyteConcentrationProperty.value = 0.1;
    model.titrantConcentrationProperty.value = 0.1;
    expect(model.chartMaxVolume()).toBe(40);
    model.dispense(45);
    expect(model.chartMaxVolume()).toBe(50);
    model.refill();
    model.dispense(10);
    expect(model.chartMaxVolume()).toBe(100);
  });
});

describe("long titration recording", () => {
  it("continues through refills and two endpoints with bounded history and a current endpoint", () => {
    const model = new LabModel();
    model.sampleProperty.value = PHOSPHORIC_ACID;
    model.analyteConcentrationProperty.value = 0.2;
    model.titrantConcentrationProperty.value = 0.05;
    model.meterInFlaskProperty.value = true;
    model.flowRateProperty.value = 0.66;
    // A real 60 Hz flow; 220 mL crosses the 100 and 200 mL endpoints and multiple buffer compactions.
    for (let i = 0; i < 20000; i++) {
      if (model.buretteReadingProperty.value > 49.9) {
        model.refill();
      }
      model.step(1 / 60);
    }
    expect(model.titrantAddedProperty.value).toBeCloseTo(220, 7);
    expect(model.measuredPoints.length).toBeLessThanOrEqual(MAX_RECORDED_POINTS);
    expect(model.measuredPoints[0]!.x).toBe(0);
    expect(model.measuredPoints.at(-1)!.x).toBeGreaterThan(219.95);
    for (let i = 1; i < model.measuredPoints.length; i++) {
      expect(model.measuredPoints[i]!.x).toBeGreaterThan(model.measuredPoints[i - 1]!.x);
    }
    for (const volume of [100, 200]) {
      const nearest = model.measuredPoints.reduce((a, b) => (Math.abs(a.x - volume) < Math.abs(b.x - volume) ? a : b));
      expect(Math.abs(nearest.x - volume)).toBeLessThan(0.05);
      expect(nearest.y).toBeCloseTo(pHAt(model.setupProperty.value, nearest.x), 10);
    }
    model.newFlask();
    model.dispense(0.011);
    expect(model.measuredPoints.map((point) => point.x)).toEqual([0, 0.011]);
    model.reset();
    model.meterInFlaskProperty.value = true;
    model.dispense(0.011);
    expect(model.measuredPoints.map((point) => point.x)).toEqual([0, 0.011]);
  });
});
