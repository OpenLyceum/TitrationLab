import { describe, expect, it } from "vitest";
import {
  alphaFractions,
  chargeImbalance,
  mix,
  PURE_WATER,
  solvePH,
} from "../../src/common/model/ChargeBalanceSolver.js";

describe("alphaFractions", () => {
  it("sums to 1 and puts half in each form at pH = pKa", () => {
    const alphas = alphaFractions(4.74, [4.74]);
    expect(alphas[0]).toBeCloseTo(0.5, 10);
    expect(alphas[1]).toBeCloseTo(0.5, 10);
    for (const pH of [-1, 0, 3.3, 7, 14, 15]) {
      const sum = alphaFractions(pH, [2.12, 7.21, 12.38]).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 12);
    }
  });

  it("does not underflow far from the pKa values", () => {
    const alphas = alphaFractions(14, [1]);
    expect(alphas.every(Number.isFinite)).toBe(true);
    expect(alphas[1]).toBeCloseTo(1, 10);
  });

  it("returns a single fraction for no pKa", () => {
    expect(alphaFractions(7, [])).toEqual([1]);
  });
});

describe("solvePH", () => {
  it("gives 7 for pure water", () => {
    expect(solvePH(PURE_WATER)).toBeCloseTo(7, 6);
  });

  it("solves strong acid and base, including dilute ones", () => {
    expect(solvePH({ systems: [], sodium: 0, chloride: 0.01 })).toBeCloseTo(2, 4);
    expect(solvePH({ systems: [], sodium: 0.01, chloride: 0 })).toBeCloseTo(12, 4);
    // 1e-8 M HCl is slightly acidic, not pH 8.
    const dilute = solvePH({ systems: [], sodium: 0, chloride: 1e-8 });
    expect(dilute).toBeGreaterThan(6.9);
    expect(dilute).toBeLessThan(7);
  });

  it("zeroes the charge balance", () => {
    const mixture = { systems: [{ concentration: 0.1, pKas: [4.74], protonatedCharge: 0 }], sodium: 0.03, chloride: 0 };
    expect(Math.abs(chargeImbalance(mixture, solvePH(mixture)))).toBeLessThan(1e-12);
  });
});

describe("mix", () => {
  it("dilutes and merges identical systems", () => {
    const acid = { systems: [{ concentration: 0.2, pKas: [4.74], protonatedCharge: 0 }], sodium: 0, chloride: 0 };
    const mixed = mix(acid, 10, acid, 30);
    expect(mixed.systems).toHaveLength(1);
    expect(mixed.systems[0]?.concentration).toBeCloseTo(0.2, 12);
    const diluted = mix(acid, 10, PURE_WATER, 10);
    expect(diluted.systems[0]?.concentration).toBeCloseTo(0.1, 12);
  });
});
