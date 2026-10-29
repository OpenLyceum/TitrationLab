/**
 * Indicators.ts
 *
 * Acid–base indicators. Each one is a weak acid HIn whose forms have different colours; a
 * two-colour indicator such as thymol blue has two pK_In values and three forms. Transition ranges
 * and pK_In values are the usual textbook figures (OpenStax Chemistry 2e Fig. 14.21; CRC
 * Handbook). The indicator is present at a tiny concentration and is left out of the charge
 * balance.
 *
 * Colours live in the view (TitrationLabColors); the model only names each form's colour.
 */

import { Range } from "scenerystack/dot";
import { alphaFractions } from "./ChargeBalanceSolver.js";

export type IndicatorId =
  | "phenolphthalein"
  | "bromothymolBlue"
  | "methylRed"
  | "methylOrange"
  | "bromocresolGreen"
  | "thymolBlue";

/** Colour of one form, as named in strings and mapped to a profile colour in the view. */
export type FormColor = "colorless" | "pink" | "red" | "yellow" | "blue";

export type Indicator = {
  readonly id: IndicatorId;
  /** pK_In of each transition, ascending. */
  readonly pKIns: readonly number[];
  /** Visible colour-change range of each transition, same order. */
  readonly ranges: readonly Range[];
  /** Colour of each form from most protonated to least: pKIns.length + 1 entries. */
  readonly forms: readonly FormColor[];
};

export const PHENOLPHTHALEIN: Indicator = {
  id: "phenolphthalein",
  pKIns: [9.4],
  ranges: [new Range(8.2, 10.0)],
  forms: ["colorless", "pink"],
};

export const BROMOTHYMOL_BLUE: Indicator = {
  id: "bromothymolBlue",
  pKIns: [7.1],
  ranges: [new Range(6.0, 7.6)],
  forms: ["yellow", "blue"],
};

export const METHYL_RED: Indicator = {
  id: "methylRed",
  pKIns: [5.1],
  ranges: [new Range(4.4, 6.2)],
  forms: ["red", "yellow"],
};

export const METHYL_ORANGE: Indicator = {
  id: "methylOrange",
  pKIns: [3.7],
  ranges: [new Range(3.1, 4.4)],
  forms: ["red", "yellow"],
};

export const BROMOCRESOL_GREEN: Indicator = {
  id: "bromocresolGreen",
  pKIns: [4.7],
  ranges: [new Range(3.8, 5.4)],
  forms: ["yellow", "blue"],
};

export const THYMOL_BLUE: Indicator = {
  id: "thymolBlue",
  pKIns: [1.7, 8.9],
  ranges: [new Range(1.2, 2.8), new Range(8.0, 9.6)],
  forms: ["red", "yellow", "blue"],
};

/** Every indicator, ordered by the pH of its (last) transition. */
export const INDICATORS: readonly Indicator[] = [
  METHYL_ORANGE,
  BROMOCRESOL_GREEN,
  METHYL_RED,
  BROMOTHYMOL_BLUE,
  THYMOL_BLUE,
  PHENOLPHTHALEIN,
];

/** Fractions of each form at the given pH. */
export function indicatorFractions(indicator: Indicator, pH: number): number[] {
  return alphaFractions(pH, indicator.pKIns);
}

/**
 * The colour a student would name at this pH, and whether the change is only partway: inside a
 * transition range the solution shows a mix, called "faint" when the new form is still the minor
 * one. For colourless → pink, any visible pink counts.
 */
export function perceivedColor(indicator: Indicator, pH: number): { color: FormColor; partial: boolean } {
  const fractions = indicatorFractions(indicator, pH);
  let dominant = 0;
  fractions.forEach((fraction, i) => {
    if (fraction > (fractions[dominant] as number)) {
      dominant = i;
    }
  });
  const color = indicator.forms[dominant] as FormColor;
  const insideRange = indicator.ranges.findIndex((range) => range.contains(pH));
  if (insideRange < 0) {
    return { color, partial: false };
  }
  const acidForm = indicator.forms[insideRange] as FormColor;
  const baseForm = indicator.forms[insideRange + 1] as FormColor;
  if (acidForm === "colorless") {
    return { color: baseForm, partial: dominant === insideRange };
  }
  return { color, partial: true };
}
