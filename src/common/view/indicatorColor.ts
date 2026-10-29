/**
 * indicatorColor.ts
 *
 * Colour of a solution containing an indicator. Each form's profile colour is treated as its
 * transmission at the reference strength (1), and the forms absorb independently (Beer–Lambert),
 * so per channel T = Π T_form^(α_form · strength). The pink of phenolphthalein therefore deepens
 * gradually past the endpoint instead of switching on, and a two-colour indicator passes through
 * the true mixed colour (yellow + blue → green) mid-transition.
 */

import type { ReadOnlyProperty } from "scenerystack/axon";
import { Color } from "scenerystack/scenery";
import TitrationLabColors from "../../TitrationLabColors.js";
import { type FormColor, type Indicator, indicatorFractions } from "../model/Indicators.js";

/** Lowest transmission per channel, so no form is drawn pure black. */
const MIN_TRANSMISSION = 0.02;

export const FORM_COLOR_PROPERTIES: Record<FormColor, ReadOnlyProperty<Color>> = {
  colorless: TitrationLabColors.indicatorColorlessColorProperty,
  pink: TitrationLabColors.indicatorPinkColorProperty,
  red: TitrationLabColors.indicatorRedColorProperty,
  yellow: TitrationLabColors.indicatorYellowColorProperty,
  blue: TitrationLabColors.indicatorBlueColorProperty,
};

/** Every profile colour the mixed colour depends on, for Multilinks. */
export const SOLUTION_COLOR_DEPENDENCIES: ReadOnlyProperty<Color>[] = [
  TitrationLabColors.solutionColorProperty,
  ...Object.values(FORM_COLOR_PROPERTIES),
];

/** Colour of the solution at `pH` with `indicator` (or none) at relative `strength`. */
export function solutionColor(indicator: Indicator | null, pH: number, strength = 1): Color {
  const base = TitrationLabColors.solutionColorProperty.value;
  if (!indicator) {
    return base;
  }
  const fractions = indicatorFractions(indicator, pH);
  let red = 1;
  let green = 1;
  let blue = 1;
  indicator.forms.forEach((form, i) => {
    const exponent = (fractions[i] as number) * strength;
    const color = FORM_COLOR_PROPERTIES[form].value;
    red *= Math.max(color.red / 255, MIN_TRANSMISSION) ** exponent;
    green *= Math.max(color.green / 255, MIN_TRANSMISSION) ** exponent;
    blue *= Math.max(color.blue / 255, MIN_TRANSMISSION) ** exponent;
  });
  return new Color(base.red * red, base.green * green, base.blue * blue);
}
