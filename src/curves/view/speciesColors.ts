/**
 * speciesColors.ts
 *
 * Colour of each form of a weak system, from most protonated to least, shared by the species
 * chart and the amounts bars.
 */

import type { ReadOnlyProperty } from "scenerystack/axon";
import type { Color } from "scenerystack/scenery";
import TitrationLabColors from "../../TitrationLabColors.js";

export const SPECIES_COLORS: readonly ReadOnlyProperty<Color>[] = [
  TitrationLabColors.species0ColorProperty,
  TitrationLabColors.species1ColorProperty,
  TitrationLabColors.species2ColorProperty,
  TitrationLabColors.species3ColorProperty,
];
