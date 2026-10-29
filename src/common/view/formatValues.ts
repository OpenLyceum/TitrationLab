/**
 * formatValues.ts
 *
 * Names and number formats shared by the screens. Readouts that also serve screen-reader
 * descriptions are plain text; RichText markup is used only where noted (formulas).
 */

import { PatternStringProperty, type ReadOnlyProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { StringManager } from "../../i18n/StringManager.js";
import { type Analyte, type AnalyteId, titrantFormula } from "../model/Analytes.js";
import type { FormColor, Indicator, IndicatorId } from "../model/Indicators.js";
import type { ApproximationMethod, Region } from "../model/TitrationCurve.js";

const MINUS = "−";
const SUPERSCRIPTS: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

/** Typed lookup in a getNestedStringProperties group (keys are suffixed "StringProperty"). */
function lookup<K extends string>(group: object, key: K): ReadOnlyProperty<string> {
  return (group as Record<string, ReadOnlyProperty<string>>)[`${key}StringProperty`] as ReadOnlyProperty<string>;
}

/** Fixed decimals with a true minus sign. */
export function fixed(value: number, decimals: number): string {
  return toFixed(value, decimals).replace("-", MINUS);
}

export function formatPH(pH: number): string {
  return fixed(pH, 2);
}

export function formatVolume(volume: number): string {
  return fixed(volume, 2);
}

/** Scientific notation with Unicode superscripts, e.g. "1.3 × 10⁻³" (plain text, speakable). */
export function scientific(value: number, significant = 2): string {
  if (value === 0) {
    return "0";
  }
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / 10 ** exponent;
  const superscript = String(exponent)
    .split("")
    .map((c) => SUPERSCRIPTS[c] ?? c)
    .join("");
  return `${fixed(mantissa, significant - 1)} × 10${superscript}`;
}

export function analyteNameProperty(id: AnalyteId | "unknownAcid"): ReadOnlyProperty<string> {
  return lookup(StringManager.getInstance().getAnalyteNames(), id);
}

/** "Acetic acid, CH<sub>3</sub>COOH" (RichText), following the locale. */
export function analyteLabelProperty(analyte: Analyte): TReadOnlyProperty<string> {
  return new PatternStringProperty(
    StringManager.getInstance().getCommonStrings().analyteWithFormulaPatternStringProperty,
    {
      name: analyteNameProperty(analyte.id),
      formula: analyte.formula,
    },
  );
}

export function indicatorNameProperty(id: IndicatorId): ReadOnlyProperty<string> {
  return lookup(StringManager.getInstance().getIndicatorNames(), id);
}

/** Indicator name, or "None". */
export function indicatorName(indicator: Indicator | null): string {
  return indicator
    ? indicatorNameProperty(indicator.id).value
    : StringManager.getInstance().getCommonStrings().noneStringProperty.value;
}

export function colorName(color: FormColor): string {
  return lookup(StringManager.getInstance().getColorNames(), color).value;
}

/** Name of a region; numbered when the analyte has more than one equivalence point. */
export function regionName(region: Region, analyte: Analyte): string {
  const regions = StringManager.getInstance().getCommonStrings().regions;
  const numbered = analyte.equivalencePoints > 1;
  const fill = (pattern: TReadOnlyProperty<string>): string =>
    StringUtils.fillIn(pattern.value, { index: region.index });
  switch (region.kind) {
    case "initial":
      return regions.initialStringProperty.value;
    case "beforeEquivalence":
      return regions.beforeEquivalenceStringProperty.value;
    case "buffer":
      return numbered ? fill(regions.bufferNumberedPatternStringProperty) : regions.bufferStringProperty.value;
    case "halfEquivalence":
      return numbered
        ? fill(regions.halfEquivalenceNumberedPatternStringProperty)
        : regions.halfEquivalenceStringProperty.value;
    case "equivalence":
      return numbered
        ? fill(regions.equivalenceNumberedPatternStringProperty)
        : regions.equivalenceStringProperty.value;
    default:
      return regions.excessStringProperty.value;
  }
}

/** RichText statement of a textbook approximation. */
export function methodText(method: ApproximationMethod): string {
  return lookup(StringManager.getInstance().getCommonStrings().methods, method).value;
}

/** "Volume of NaOH added (mL)" for the analyte's titrant. */
export function volumeAxisTitle(analyte: Analyte): string {
  return StringUtils.fillIn(StringManager.getInstance().getCommonStrings().volumeAxisPatternStringProperty.value, {
    titrant: titrantFormula(analyte.titrant),
  });
}
