/**
 * TitrationCurve.ts
 *
 * pH of a titration as a function of titrant volume, built on the exact solver, plus the key
 * volumes (equivalence and half-equivalence points), the region a volume falls in, the Gen Chem
 * approximation for that region, and indicator endpoints.
 *
 * Volumes are in mL and concentrations in mol/L; amounts are returned in mmol (mL × mol/L).
 */

import { Vector2 } from "scenerystack/dot";
import { KEY_POINT_TOLERANCE, PKW } from "../../TitrationLabConstants.js";
import { type Analyte, analyteMixture, isStrong, isTitratedWithBase, titrantMixture } from "./Analytes.js";
import { alphaFractions, type Mixture, mix, solvePH } from "./ChargeBalanceSolver.js";
import type { Indicator } from "./Indicators.js";

export type TitrationSetup = {
  readonly analyte: Analyte;
  /** mol/L */
  readonly analyteConcentration: number;
  /** mL */
  readonly analyteVolume: number;
  /** mol/L */
  readonly titrantConcentration: number;
};

/** Amount of analyte (mmol). */
export function analyteAmount(setup: TitrationSetup): number {
  return setup.analyteConcentration * setup.analyteVolume;
}

/** The flask contents after `titrantVolume` mL of titrant. */
export function flaskMixture(setup: TitrationSetup, titrantVolume: number): Mixture {
  return mix(
    analyteMixture(setup.analyte, setup.analyteConcentration),
    setup.analyteVolume,
    titrantMixture(setup.analyte.titrant, setup.titrantConcentration),
    titrantVolume,
  );
}

/** Exact pH after `titrantVolume` mL of titrant. */
export function pHAt(setup: TitrationSetup, titrantVolume: number): number {
  return solvePH(flaskMixture(setup, titrantVolume));
}

/** Volume (mL) of each equivalence point the analyte shows. */
export function equivalenceVolumes(setup: TitrationSetup): number[] {
  const perEquivalent = analyteAmount(setup) / setup.titrantConcentration;
  const volumes: number[] = [];
  for (let k = 1; k <= setup.analyte.equivalencePoints; k++) {
    volumes.push(k * perEquivalent);
  }
  return volumes;
}

/** Volumes (mL) where pH = pKa of a buffer pair the titration passes through (weak analytes only). */
export function halfEquivalenceVolumes(setup: TitrationSetup): number[] {
  if (isStrong(setup.analyte)) {
    return [];
  }
  const perEquivalent = analyteAmount(setup) / setup.titrantConcentration;
  const volumes: number[] = [];
  for (let k = 1; k <= setup.analyte.equivalencePoints; k++) {
    volumes.push((k - 0.5) * perEquivalent);
  }
  return volumes;
}

/**
 * Curve sampled from 0 to `maxVolume`: evenly spaced points plus a dense cluster around each
 * equivalence point, where the pH changes fastest.
 */
export function sampleCurve(setup: TitrationSetup, maxVolume: number, count = 300): Vector2[] {
  const volumes = new Set<number>();
  for (let i = 0; i <= count; i++) {
    volumes.add((maxVolume * i) / count);
  }
  for (const equivalence of equivalenceVolumes(setup)) {
    const halfWidth = 0.04 * equivalence;
    for (let i = -40; i <= 40; i++) {
      const volume = equivalence + (halfWidth * i) / 40;
      if (volume >= 0 && volume <= maxVolume) {
        volumes.add(volume);
      }
    }
  }
  return [...volumes].sort((a, b) => a - b).map((volume) => new Vector2(volume, pHAt(setup, volume)));
}

/**
 * Volume (mL) in [minVolume, maxVolume] where the pH reaches `targetPH`, or null if it does not.
 * pH is monotonic in titrant volume (rising for a base titrant, falling for an acid one).
 */
export function volumeAtPH(
  setup: TitrationSetup,
  targetPH: number,
  minVolume: number,
  maxVolume: number,
): number | null {
  const rising = isTitratedWithBase(setup.analyte);
  const above = (volume: number): boolean =>
    rising ? pHAt(setup, volume) >= targetPH : pHAt(setup, volume) <= targetPH;
  if (above(minVolume) || !above(maxVolume)) {
    return null;
  }
  let low = minVolume;
  let high = maxVolume;
  for (let i = 0; i < 50; i++) {
    const middle = (low + high) / 2;
    if (above(middle)) {
      high = middle;
    } else {
      low = middle;
    }
  }
  return (low + high) / 2;
}

/** Amount (mmol) of each form of the weak system, from most protonated to least. */
export function speciesAmounts(setup: TitrationSetup, titrantVolume: number): number[] {
  if (isStrong(setup.analyte)) {
    return [];
  }
  const pH = pHAt(setup, titrantVolume);
  const amount = analyteAmount(setup);
  return alphaFractions(pH, setup.analyte.pKas).map((alpha) => alpha * amount);
}

/** Spectator ions (mmol) in the flask: Na⁺ and Cl⁻. */
export function spectatorAmounts(setup: TitrationSetup, titrantVolume: number): { sodium: number; chloride: number } {
  const titrant = setup.titrantConcentration * titrantVolume;
  const amount = analyteAmount(setup);
  const fromBase = setup.analyte.titrant === "sodiumHydroxide" ? titrant : 0;
  const fromAcid = setup.analyte.titrant === "hydrochloricAcid" ? titrant : 0;
  return {
    sodium: setup.analyte.sodiumPerUnit * amount + fromBase,
    chloride: setup.analyte.chloridePerUnit * amount + fromAcid,
  };
}

// ── Regions and textbook approximations ─────────────────────────────────────

export type RegionKind = "initial" | "beforeEquivalence" | "buffer" | "halfEquivalence" | "equivalence" | "excess";

export type Region = {
  readonly kind: RegionKind;
  /** Which equivalence point (1-based) or buffer the region belongs to. */
  readonly index: number;
  /** Gen Chem approximation of the pH here, or null where none is taught. */
  readonly approximatePH: number | null;
  /** The approximation used, for the equations display. */
  readonly method: ApproximationMethod;
};

export type ApproximationMethod =
  | "strongAcid"
  | "strongBase"
  | "neutral"
  | "weakAcid"
  | "weakBase"
  | "hendersonHasselbalch"
  | "amphiprotic"
  | "excessBase"
  | "excessAcid";

/** Region of a strong acid or strong base titration (no weak system). */
function strongRegion(
  progress: number,
  atEquivalence: boolean,
  atStart: boolean,
  base: boolean,
  amount: number,
  totalVolume: number,
): Region {
  if (atEquivalence) {
    return { kind: "equivalence", index: 1, approximatePH: PKW / 2, method: "neutral" };
  }
  // Before equivalence the analyte is in excess; after, the titrant.
  const excess = (Math.abs(1 - progress) * amount) / totalVolume;
  const acidic = progress < 1 === base;
  const kind: RegionKind = atStart ? "initial" : progress < 1 ? "beforeEquivalence" : "excess";
  const method: ApproximationMethod =
    kind === "excess" ? (acidic ? "excessAcid" : "excessBase") : acidic ? "strongAcid" : "strongBase";
  return { kind, index: 1, approximatePH: acidic ? -Math.log10(excess) : PKW + Math.log10(excess), method };
}

/**
 * Region where one form j dominates (the start, or an equivalence point): the weak acid, the weak
 * base, or an amphiprotic form between two pKa values. `formal` is the analyte's total
 * concentration (mol/L).
 */
function singleFormRegion(analyte: Analyte, j: number, whole: number, formal: number): Region {
  const n = analyte.pKas.length;
  const pKaOf = (i: number): number => analyte.pKas[i] as number;
  const kind: RegionKind = whole === 0 ? "initial" : "equivalence";
  if (j === 0) {
    // Only the fully protonated acid: [H⁺] ≈ √(Ka C).
    return { kind, index: whole, approximatePH: 0.5 * (pKaOf(0) - Math.log10(formal)), method: "weakAcid" };
  }
  if (j === n) {
    // Only the fully deprotonated base: [OH⁻] ≈ √(Kb C) with pKb = pKw − pKaₙ.
    const pKb = PKW - pKaOf(n - 1);
    return { kind, index: whole, approximatePH: PKW - 0.5 * (pKb - Math.log10(formal)), method: "weakBase" };
  }
  return { kind, index: whole, approximatePH: 0.5 * (pKaOf(j - 1) + pKaOf(j)), method: "amphiprotic" };
}

/**
 * Region of the titration at `titrantVolume` and the approximation a Gen Chem student would use.
 * Progress e = volume / V_eq,1 counts equivalents of titrant added; within KEY_POINT_TOLERANCE of a
 * whole or half number the volume is "at" that key point.
 */
export function regionAt(setup: TitrationSetup, titrantVolume: number): Region {
  const analyte = setup.analyte;
  const amount = analyteAmount(setup);
  const totalVolume = setup.analyteVolume + titrantVolume;
  const progress = (setup.titrantConcentration * titrantVolume) / amount;
  const base = isTitratedWithBase(analyte);
  const whole = Math.round(progress);
  const atWhole = Math.abs(progress - whole) <= KEY_POINT_TOLERANCE;

  if (isStrong(analyte)) {
    return strongRegion(progress, atWhole && whole === 1, atWhole && whole === 0, base, amount, totalVolume);
  }

  const n = analyte.pKas.length;
  const pKaOf = (i: number): number => analyte.pKas[i] as number;
  // Protons lost by the dominant form: rises with a base titrant, falls with an acid titrant.
  const position = analyte.startIndex + (base ? progress : -progress);

  const j = analyte.startIndex + (base ? whole : -whole);
  if (atWhole && j >= 0 && j <= n) {
    return singleFormRegion(analyte, j, whole, amount / totalVolume);
  }

  if (position > n || position < 0) {
    const excess = ((base ? position - n : -position) * amount) / totalVolume;
    return {
      kind: "excess",
      index: analyte.equivalencePoints,
      approximatePH: base ? PKW + Math.log10(excess) : -Math.log10(excess),
      method: base ? "excessBase" : "excessAcid",
    };
  }

  // Between forms k and k + 1: a buffer of that conjugate pair, f = fraction of the k + 1 form.
  const k = Math.min(Math.floor(position), n - 1);
  const fraction = position - k;
  return {
    kind: Math.abs(fraction - 0.5) <= KEY_POINT_TOLERANCE ? "halfEquivalence" : "buffer",
    index: Math.ceil(progress),
    approximatePH: pKaOf(k) + Math.log10(fraction / (1 - fraction)),
    method: "hendersonHasselbalch",
  };
}

/**
 * Sorted key volumes (mL) a cursor can jump between: start, half-equivalence and equivalence
 * points.
 */
export function keyVolumes(setup: TitrationSetup): number[] {
  return [0, ...halfEquivalenceVolumes(setup), ...equivalenceVolumes(setup)].sort((a, b) => a - b);
}

// ── Indicator endpoints ────────────────────────────────────────────────────

export type EndpointResult = {
  /** Endpoint volume (mL): where the colour change first shows. */
  readonly volume: number;
  /** 1-based equivalence point it is closest to. */
  readonly equivalenceIndex: number;
  /** Endpoint − equivalence (mL). */
  readonly error: number;
  /** Volume (mL) across the whole visible colour change. */
  readonly span: number;
};

/**
 * Best endpoint the indicator gives in this titration, over every transition and equivalence
 * point: the endpoint is where the pH first enters the transition range (the low edge when the pH
 * rises, the high edge when it falls). Null if no transition is crossed before `maxVolume`.
 */
export function bestEndpoint(setup: TitrationSetup, indicator: Indicator, maxVolume: number): EndpointResult | null {
  const rising = isTitratedWithBase(setup.analyte);
  const equivalences = equivalenceVolumes(setup);
  let best: EndpointResult | null = null;
  for (const range of indicator.ranges) {
    const start = volumeAtPH(setup, rising ? range.min : range.max, 0, maxVolume);
    if (start === null) {
      continue;
    }
    const end = volumeAtPH(setup, rising ? range.max : range.min, 0, maxVolume) ?? maxVolume;
    equivalences.forEach((equivalence, i) => {
      const error = start - equivalence;
      if (best === null || Math.abs(error) < Math.abs(best.error)) {
        best = { volume: start, equivalenceIndex: i + 1, error, span: end - start };
      }
    });
  }
  return best;
}
