/**
 * ChargeBalanceSolver.ts
 *
 * Exact pH of an aqueous mixture from the charge balance, with no piecewise textbook formulas:
 *
 *   [H⁺] + [Na⁺] − [Cl⁻] − Kw/[H⁺] + Σ C · Σⱼ αⱼ (z₀ − j) = 0
 *
 * where each weak system (an acid and its conjugate bases) has total concentration C, pKa values
 * pKa₁ < pKa₂ < …, and charge z₀ on its fully protonated form; αⱼ is the fraction that has lost j
 * protons. Na⁺ and Cl⁻ stand for every spectator cation and anion (from NaOH, HCl, Na₂CO₃, NH₄Cl).
 * The left side falls monotonically as pH rises, so bisection always converges. Ideal solution,
 * 25 °C (see doc/model.md).
 */

import { KW, SOLVER_ITERATIONS, SOLVER_PH_RANGE } from "../../TitrationLabConstants.js";

/** One conjugate acid–base family in solution. */
export type WeakSystem = {
  /** Total concentration of every form together (mol/L). */
  readonly concentration: number;
  /** Stepwise pKa values, ascending. */
  readonly pKas: readonly number[];
  /** Charge of the fully protonated form (0 for CH₃COOH, +1 for NH₄⁺). */
  readonly protonatedCharge: number;
};

/** A solution: weak systems plus spectator ions, all as concentrations (mol/L). */
export type Mixture = {
  readonly systems: readonly WeakSystem[];
  readonly sodium: number;
  readonly chloride: number;
};

export const PURE_WATER: Mixture = { systems: [], sodium: 0, chloride: 0 };

/** Scales every concentration by `factor` (dilution). */
function scale(mixture: Mixture, factor: number): Mixture {
  return {
    systems: mixture.systems.map((system) => ({ ...system, concentration: system.concentration * factor })),
    sodium: mixture.sodium * factor,
    chloride: mixture.chloride * factor,
  };
}

/**
 * Mixes volume `volumeA` of `a` with volume `volumeB` of `b` (any common unit). Systems are kept
 * as separate entries; a system with the same pKa list in both is merged so the species fractions
 * stay meaningful.
 */
export function mix(a: Mixture, volumeA: number, b: Mixture, volumeB: number): Mixture {
  const total = volumeA + volumeB;
  if (total <= 0) {
    return PURE_WATER;
  }
  const scaledA = scale(a, volumeA / total);
  const scaledB = scale(b, volumeB / total);
  const systems: WeakSystem[] = [...scaledA.systems];
  for (const system of scaledB.systems) {
    const index = systems.findIndex(
      (other) =>
        other.protonatedCharge === system.protonatedCharge &&
        other.pKas.length === system.pKas.length &&
        other.pKas.every((pKa, i) => pKa === system.pKas[i]),
    );
    const match = index >= 0 ? systems[index] : undefined;
    if (match) {
      systems[index] = { ...match, concentration: match.concentration + system.concentration };
    } else {
      systems.push(system);
    }
  }
  return {
    systems,
    sodium: scaledA.sodium + scaledB.sodium,
    chloride: scaledA.chloride + scaledB.chloride,
  };
}

/**
 * Fractions α₀ … αₙ of a system with n pKa values at the given pH: αⱼ is the fraction that has
 * lost j protons. Computed in log space so pH 14 with pKa 1 does not underflow.
 */
export function alphaFractions(pH: number, pKas: readonly number[]): number[] {
  const n = pKas.length;
  const logTerms: number[] = [];
  let cumulativePKa = 0;
  for (let j = 0; j <= n; j++) {
    if (j > 0) {
      cumulativePKa += pKas[j - 1] as number;
    }
    // log₁₀ of [H⁺]^(n−j) · K₁…Kⱼ
    logTerms.push(-(n - j) * pH - cumulativePKa);
  }
  const maxTerm = Math.max(...logTerms);
  const terms = logTerms.map((term) => 10 ** (term - maxTerm));
  const sum = terms.reduce((total, term) => total + term, 0);
  return terms.map((term) => term / sum);
}

/** Net charge concentration (mol/L) of everything at the given pH; zero at the true pH. */
export function chargeImbalance(mixture: Mixture, pH: number): number {
  const hydrogen = 10 ** -pH;
  let charge = hydrogen - KW / hydrogen + mixture.sodium - mixture.chloride;
  for (const system of mixture.systems) {
    const alphas = alphaFractions(pH, system.pKas);
    let meanCharge = 0;
    alphas.forEach((alpha, j) => {
      meanCharge += alpha * (system.protonatedCharge - j);
    });
    charge += system.concentration * meanCharge;
  }
  return charge;
}

/** Exact pH of the mixture. */
export function solvePH(mixture: Mixture): number {
  let low = SOLVER_PH_RANGE.min;
  let high = SOLVER_PH_RANGE.max;
  for (let i = 0; i < SOLVER_ITERATIONS; i++) {
    const middle = (low + high) / 2;
    if (chargeImbalance(mixture, middle) > 0) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return (low + high) / 2;
}
