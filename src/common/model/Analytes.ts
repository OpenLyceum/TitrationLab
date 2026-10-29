/**
 * Analytes.ts
 *
 * The solutions in the flask and the titrant each one is titrated with. Ka and Kb values are
 * those of OpenStax Chemistry 2e, Appendices H and I (25 °C), so answers match the textbook
 * problems students do; pKa = −log₁₀ Ka. The conjugate acid of a base gets pKa = pKw − pKb.
 *
 * An analyte is described for the charge balance (see ChargeBalanceSolver.ts): its weak system
 * (pKa values and the charge of the fully protonated form) and the spectator ions one formula
 * unit brings. A strong acid or base has no weak system, only spectators. `startIndex` is the
 * number of protons the added form has already lost (NH₃ is NH₄⁺ minus one; CO₃²⁻ is H₂CO₃
 * minus two), which fixes where the titration starts along the species.
 */

import { DEFAULT_CONCENTRATION, DEFAULT_POLYPROTIC_CONCENTRATION } from "../../TitrationLabConstants.js";
import type { Mixture } from "./ChargeBalanceSolver.js";

/** The titrant in the burette. */
export type Titrant = "sodiumHydroxide" | "hydrochloricAcid";

export type AnalyteId =
  | "hydrochloricAcid"
  | "aceticAcid"
  | "hydrofluoricAcid"
  | "hypochlorousAcid"
  | "oxalicAcid"
  | "phosphoricAcid"
  | "sodiumHydroxide"
  | "ammonia"
  | "sodiumCarbonate"
  | "customAcid";

export type Analyte = {
  readonly id: AnalyteId;
  /** RichText markup, e.g. CH<sub>3</sub>COOH. Formulas are not translated. */
  readonly formula: string;
  readonly titrant: Titrant;
  /** Stepwise pKa values of the weak system, ascending; empty for a strong acid or base. */
  readonly pKas: readonly number[];
  /** Charge of the fully protonated form of the weak system. */
  readonly protonatedCharge: number;
  /** Protons the added form has already lost, counted from the fully protonated form. */
  readonly startIndex: number;
  /** Na⁺ per formula unit. */
  readonly sodiumPerUnit: number;
  /** Cl⁻ per formula unit. */
  readonly chloridePerUnit: number;
  /** Equivalence points a burette of titrant can reach and show (H₃PO₄'s third is not seen). */
  readonly equivalencePoints: number;
  /** RichText formula of each form, from fully protonated (index 0) to fully deprotonated. */
  readonly species: readonly string[];
};

const pKa = (ka: number): number => -Math.log10(ka);

/** pKa of the conjugate acid of a base with the given Kb. */
const pKaFromKb = (kb: number): number => 14 + Math.log10(kb);

export const HYDROCHLORIC_ACID: Analyte = {
  id: "hydrochloricAcid",
  formula: "HCl",
  titrant: "sodiumHydroxide",
  pKas: [],
  protonatedCharge: 0,
  startIndex: 0,
  sodiumPerUnit: 0,
  chloridePerUnit: 1,
  equivalencePoints: 1,
  species: [],
};

export const ACETIC_ACID: Analyte = {
  id: "aceticAcid",
  formula: "CH<sub>3</sub>COOH",
  titrant: "sodiumHydroxide",
  pKas: [pKa(1.8e-5)],
  protonatedCharge: 0,
  startIndex: 0,
  sodiumPerUnit: 0,
  chloridePerUnit: 0,
  equivalencePoints: 1,
  species: ["CH<sub>3</sub>COOH", "CH<sub>3</sub>COO<sup>−</sup>"],
};

export const HYDROFLUORIC_ACID: Analyte = {
  id: "hydrofluoricAcid",
  formula: "HF",
  titrant: "sodiumHydroxide",
  pKas: [pKa(6.4e-4)],
  protonatedCharge: 0,
  startIndex: 0,
  sodiumPerUnit: 0,
  chloridePerUnit: 0,
  equivalencePoints: 1,
  species: ["HF", "F<sup>−</sup>"],
};

export const HYPOCHLOROUS_ACID: Analyte = {
  id: "hypochlorousAcid",
  formula: "HClO",
  titrant: "sodiumHydroxide",
  pKas: [pKa(2.9e-8)],
  protonatedCharge: 0,
  startIndex: 0,
  sodiumPerUnit: 0,
  chloridePerUnit: 0,
  equivalencePoints: 1,
  species: ["HClO", "ClO<sup>−</sup>"],
};

export const OXALIC_ACID: Analyte = {
  id: "oxalicAcid",
  formula: "H<sub>2</sub>C<sub>2</sub>O<sub>4</sub>",
  titrant: "sodiumHydroxide",
  pKas: [pKa(6.0e-2), pKa(6.1e-5)],
  protonatedCharge: 0,
  startIndex: 0,
  sodiumPerUnit: 0,
  chloridePerUnit: 0,
  equivalencePoints: 2,
  species: [
    "H<sub>2</sub>C<sub>2</sub>O<sub>4</sub>",
    "HC<sub>2</sub>O<sub>4</sub><sup>−</sup>",
    "C<sub>2</sub>O<sub>4</sub><sup>2−</sup>",
  ],
};

export const PHOSPHORIC_ACID: Analyte = {
  id: "phosphoricAcid",
  formula: "H<sub>3</sub>PO<sub>4</sub>",
  titrant: "sodiumHydroxide",
  pKas: [pKa(7.5e-3), pKa(6.2e-8), pKa(4.2e-13)],
  protonatedCharge: 0,
  startIndex: 0,
  sodiumPerUnit: 0,
  chloridePerUnit: 0,
  equivalencePoints: 2,
  species: [
    "H<sub>3</sub>PO<sub>4</sub>",
    "H<sub>2</sub>PO<sub>4</sub><sup>−</sup>",
    "HPO<sub>4</sub><sup>2−</sup>",
    "PO<sub>4</sub><sup>3−</sup>",
  ],
};

export const SODIUM_HYDROXIDE: Analyte = {
  id: "sodiumHydroxide",
  formula: "NaOH",
  titrant: "hydrochloricAcid",
  pKas: [],
  protonatedCharge: 0,
  startIndex: 0,
  sodiumPerUnit: 1,
  chloridePerUnit: 0,
  equivalencePoints: 1,
  species: [],
};

export const AMMONIA: Analyte = {
  id: "ammonia",
  formula: "NH<sub>3</sub>",
  titrant: "hydrochloricAcid",
  pKas: [pKaFromKb(1.8e-5)],
  protonatedCharge: 1,
  startIndex: 1,
  sodiumPerUnit: 0,
  chloridePerUnit: 0,
  equivalencePoints: 1,
  species: ["NH<sub>4</sub><sup>+</sup>", "NH<sub>3</sub>"],
};

export const SODIUM_CARBONATE: Analyte = {
  id: "sodiumCarbonate",
  formula: "Na<sub>2</sub>CO<sub>3</sub>",
  titrant: "hydrochloricAcid",
  pKas: [pKa(4.3e-7), pKa(4.7e-11)],
  protonatedCharge: 0,
  startIndex: 2,
  sodiumPerUnit: 2,
  chloridePerUnit: 0,
  equivalencePoints: 2,
  species: ["H<sub>2</sub>CO<sub>3</sub>", "HCO<sub>3</sub><sup>−</sup>", "CO<sub>3</sub><sup>2−</sup>"],
};

/** Every analyte offered in the Lab and on the Indicators screen, in menu order. */
export const ANALYTES: readonly Analyte[] = [
  HYDROCHLORIC_ACID,
  ACETIC_ACID,
  HYDROFLUORIC_ACID,
  HYPOCHLOROUS_ACID,
  OXALIC_ACID,
  PHOSPHORIC_ACID,
  SODIUM_HYDROXIDE,
  AMMONIA,
  SODIUM_CARBONATE,
];

/** Analytes an unknown sample is drawn from (one equivalence point, titrated with NaOH). */
export const UNKNOWN_CANDIDATES: readonly Analyte[] = [HYDROCHLORIC_ACID, ACETIC_ACID, HYDROFLUORIC_ACID];

/** A monoprotic weak acid HA with the given pKa (Curves screen). */
export function customAcid(customPKa: number): Analyte {
  return {
    id: "customAcid",
    formula: "HA",
    titrant: "sodiumHydroxide",
    pKas: [customPKa],
    protonatedCharge: 0,
    startIndex: 0,
    sodiumPerUnit: 0,
    chloridePerUnit: 0,
    equivalencePoints: 1,
    species: ["HA", "A<sup>−</sup>"],
  };
}

/** True when the titrant is a base, so pH rises as it is added. */
export function isTitratedWithBase(analyte: Analyte): boolean {
  return analyte.titrant === "sodiumHydroxide";
}

/** True for HCl and NaOH, which have no weak system. */
export function isStrong(analyte: Analyte): boolean {
  return analyte.pKas.length === 0;
}

/** The analyte solution at concentration `concentration` (mol/L). */
export function analyteMixture(analyte: Analyte, concentration: number): Mixture {
  return {
    systems: isStrong(analyte)
      ? []
      : [{ concentration, pKas: analyte.pKas, protonatedCharge: analyte.protonatedCharge }],
    sodium: analyte.sodiumPerUnit * concentration,
    chloride: analyte.chloridePerUnit * concentration,
  };
}

/** The titrant solution at concentration `concentration` (mol/L). */
export function titrantMixture(titrant: Titrant, concentration: number): Mixture {
  return titrant === "sodiumHydroxide"
    ? { systems: [], sodium: concentration, chloride: 0 }
    : { systems: [], sodium: 0, chloride: concentration };
}

/** RichText formula of the titrant. */
export function titrantFormula(titrant: Titrant): string {
  return titrant === "sodiumHydroxide" ? "NaOH" : "HCl";
}

/** Default concentration for an analyte: polyprotic ones are halved so the last endpoint fits. */
export function defaultConcentration(analyte: Analyte): number {
  return analyte.equivalencePoints > 1 ? DEFAULT_POLYPROTIC_CONCENTRATION : DEFAULT_CONCENTRATION;
}
