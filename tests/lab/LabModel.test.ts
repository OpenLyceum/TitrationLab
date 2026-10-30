import { describe, expect, it } from "vitest";
import { ACETIC_ACID } from "../../src/common/model/Analytes.js";
import { LabModel } from "../../src/lab/model/LabModel.js";

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
