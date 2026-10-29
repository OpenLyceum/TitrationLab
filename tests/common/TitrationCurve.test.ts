import { describe, expect, it } from "vitest";
import {
  ACETIC_ACID,
  AMMONIA,
  ANALYTES,
  type Analyte,
  HYDROCHLORIC_ACID,
  HYPOCHLOROUS_ACID,
  isTitratedWithBase,
  PHOSPHORIC_ACID,
  SODIUM_CARBONATE,
} from "../../src/common/model/Analytes.js";
import { METHYL_ORANGE, PHENOLPHTHALEIN } from "../../src/common/model/Indicators.js";
import {
  bestEndpoint,
  equivalenceVolumes,
  halfEquivalenceVolumes,
  pHAt,
  regionAt,
  sampleCurve,
  speciesAmounts,
  type TitrationSetup,
  volumeAtPH,
} from "../../src/common/model/TitrationCurve.js";

const setup = (analyte: Analyte, analyteConcentration = 0.1): TitrationSetup => ({
  analyte,
  analyteConcentration,
  analyteVolume: 25,
  titrantConcentration: 0.1,
});

describe("textbook values (25.00 mL of 0.100 M, 0.100 M titrant)", () => {
  it("acetic acid with NaOH", () => {
    const s = setup(ACETIC_ACID);
    expect(pHAt(s, 0)).toBeCloseTo(2.87, 1);
    expect(pHAt(s, 12.5)).toBeCloseTo(4.74, 1);
    expect(pHAt(s, 25)).toBeCloseTo(8.72, 2);
    expect(pHAt(s, 30)).toBeCloseTo(11.96, 2);
  });

  it("HCl with NaOH is neutral at equivalence", () => {
    const s = setup(HYDROCHLORIC_ACID);
    expect(pHAt(s, 0)).toBeCloseTo(1, 3);
    expect(pHAt(s, 25)).toBeCloseTo(7, 4);
  });

  it("ammonia with HCl is acidic at equivalence", () => {
    expect(pHAt(setup(AMMONIA), 25)).toBeCloseTo(5.28, 2);
  });

  it("sodium carbonate with HCl has two endpoints", () => {
    const s = setup(SODIUM_CARBONATE, 0.05);
    const [first, second] = equivalenceVolumes(s);
    expect(first).toBeCloseTo(12.5, 10);
    expect(second).toBeCloseTo(25, 10);
    expect(pHAt(s, first as number)).toBeCloseTo(8.35, 1);
    expect(pHAt(s, second as number)).toBeCloseTo(3.99, 1);
  });

  it("phosphoric acid: second half-equivalence sits at pKa₂", () => {
    const s = setup(PHOSPHORIC_ACID, 0.05);
    expect(pHAt(s, halfEquivalenceVolumes(s)[1] as number)).toBeCloseTo(PHOSPHORIC_ACID.pKas[1] as number, 1);
  });
});

describe("curve shape", () => {
  it("is monotonic in volume for every analyte", () => {
    for (const analyte of ANALYTES) {
      const points = sampleCurve(setup(analyte, analyte.equivalencePoints > 1 ? 0.05 : 0.1), 50, 200);
      const sign = isTitratedWithBase(analyte) ? 1 : -1;
      for (let i = 1; i < points.length; i++) {
        expect(sign * ((points[i]?.y as number) - (points[i - 1]?.y as number))).toBeGreaterThanOrEqual(-1e-9);
      }
    }
  });

  it("inverts pH back to volume", () => {
    const s = setup(ACETIC_ACID);
    const volume = volumeAtPH(s, 6, 0, 50) as number;
    expect(pHAt(s, volume)).toBeCloseTo(6, 6);
    expect(volumeAtPH(s, 1, 0, 50)).toBeNull();
  });

  it("conserves the analyte across its forms", () => {
    const amounts = speciesAmounts(setup(PHOSPHORIC_ACID, 0.05), 17);
    expect(amounts.reduce((a, b) => a + b, 0)).toBeCloseTo(1.25, 10);
  });
});

describe("regions", () => {
  it("labels the key points of a weak acid", () => {
    const s = setup(ACETIC_ACID);
    expect(regionAt(s, 0).kind).toBe("initial");
    expect(regionAt(s, 5).kind).toBe("buffer");
    expect(regionAt(s, 12.5).kind).toBe("halfEquivalence");
    expect(regionAt(s, 25).kind).toBe("equivalence");
    expect(regionAt(s, 30).kind).toBe("excess");
  });

  it("approximations agree with the exact pH where Gen Chem uses them", () => {
    const s = setup(ACETIC_ACID);
    for (const volume of [0, 5, 12.5, 20, 25, 30]) {
      expect(regionAt(s, volume).approximatePH as number).toBeCloseTo(pHAt(s, volume), 1);
    }
  });

  it("uses the amphiprotic average at an intermediate equivalence point", () => {
    const region = regionAt(setup(SODIUM_CARBONATE, 0.05), 12.5);
    expect(region.method).toBe("amphiprotic");
    expect(region.approximatePH).toBeCloseTo(
      ((SODIUM_CARBONATE.pKas[0] as number) + (SODIUM_CARBONATE.pKas[1] as number)) / 2,
      10,
    );
  });

  it("titrates a base downward through its buffer", () => {
    const s = setup(AMMONIA);
    expect(regionAt(s, 12.5).kind).toBe("halfEquivalence");
    expect(regionAt(s, 12.5).approximatePH).toBeCloseTo(AMMONIA.pKas[0] as number, 10);
    expect(regionAt(s, 30).method).toBe("excessAcid");
  });
});

describe("indicator endpoints", () => {
  it("phenolphthalein suits a weak acid, methyl orange does not", () => {
    const s = setup(ACETIC_ACID);
    expect(Math.abs(bestEndpoint(s, PHENOLPHTHALEIN, 50)?.error as number)).toBeLessThan(0.05);
    expect(Math.abs(bestEndpoint(s, METHYL_ORANGE, 50)?.error as number)).toBeGreaterThan(5);
  });

  it("no indicator gives a sharp endpoint for very weak HClO", () => {
    const endpoint = bestEndpoint(setup(HYPOCHLOROUS_ACID), PHENOLPHTHALEIN, 50);
    expect(endpoint?.span as number).toBeGreaterThan(1);
  });
});
