/**
 * IndicatorBreakdownNode.ts
 *
 * The selected indicator as a weak acid: its equilibrium, pK_In and the colours on either side of
 * each transition in one column; a stacked bar of the fraction of each form at the chosen pH in
 * the other.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, Rectangle, RichText, Text, VBox } from "scenerystack/scenery";
import { type Indicator, indicatorFractions } from "../../common/model/Indicators.js";
import { CONTROL_FONT, SMALL_FONT } from "../../common/view/ControlFactory.js";
import { disposeChildren } from "../../common/view/disposeChildren.js";
import { colorName, fixed } from "../../common/view/formatValues.js";
import { FORM_COLOR_PROPERTIES } from "../../common/view/indicatorColor.js";
import { StringManager } from "../../i18n/StringManager.js";
import TitrationLabColors from "../../TitrationLabColors.js";

const BAR_HEIGHT = 20;

/** Capitalizes the first letter (colour names are stored lower case for use mid-sentence). */
function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

export class IndicatorBreakdownNode extends HBox {
  /**
   * @param width - width of the fraction bar; the text column beside it is as wide
   * @param header - shown above the text column (the indicator menu)
   */
  public constructor(
    pHProperty: TReadOnlyProperty<number>,
    indicatorProperty: TReadOnlyProperty<Indicator>,
    width: number,
    header: Node,
  ) {
    const strings = StringManager.getInstance().getIndicatorsStrings();
    const equilibrium = new RichText(strings.equilibriumStringProperty, {
      font: CONTROL_FONT,
      fill: TitrationLabColors.textColorProperty,
      maxWidth: width,
    });
    const pKText = new RichText("", {
      font: CONTROL_FONT,
      fill: TitrationLabColors.textColorProperty,
      maxWidth: width,
    });
    const rangeLines = new VBox({ align: "left", spacing: 2 });
    const bar = new Node();
    const formLines = new VBox({ align: "left", spacing: 2 });

    super({
      spacing: 20,
      align: "top",
      children: [
        new VBox({ align: "left", spacing: 6, children: [header, equilibrium, pKText, rangeLines] }),
        new VBox({ align: "left", spacing: 6, children: [bar, formLines] }),
      ],
    });

    Multilink.multilinkAny(
      [
        pHProperty,
        indicatorProperty,
        strings.rangePatternStringProperty,
        strings.formPatternStringProperty,
        ...Object.values(FORM_COLOR_PROPERTIES),
      ],
      () => {
        const indicator = indicatorProperty.value;
        const pH = pHProperty.value;
        pKText.string = indicator.pKIns
          .map((pK) => StringUtils.fillIn(strings.pKInPatternStringProperty.value, { value: fixed(pK, 1) }))
          .join("   ");
        disposeChildren(rangeLines);
        rangeLines.children = indicator.ranges.map(
          (range, i) =>
            new Text(
              capitalize(
                StringUtils.fillIn(strings.rangePatternStringProperty.value, {
                  acidColor: colorName(indicator.forms[i] ?? "colorless"),
                  baseColor: colorName(indicator.forms[i + 1] ?? "colorless"),
                  low: fixed(range.min, 1),
                  high: fixed(range.max, 1),
                }),
              ),
              { font: SMALL_FONT, fill: TitrationLabColors.mutedTextColorProperty, maxWidth: width },
            ),
        );

        const fractions = indicatorFractions(indicator, pH);
        disposeChildren(bar);
        let x = 0;
        const segments: Node[] = [];
        fractions.forEach((fraction, i) => {
          const segmentWidth = fraction * width;
          segments.push(
            new Rectangle(x, 0, segmentWidth, BAR_HEIGHT, {
              fill: FORM_COLOR_PROPERTIES[indicator.forms[i] ?? "colorless"],
            }),
          );
          x += segmentWidth;
        });
        segments.push(new Rectangle(0, 0, width, BAR_HEIGHT, { stroke: TitrationLabColors.glassColorProperty }));
        bar.children = segments;

        disposeChildren(formLines);
        formLines.children = fractions.map(
          (fraction, i) =>
            new HBox({
              spacing: 6,
              children: [
                new Rectangle(0, 0, 10, 10, {
                  fill: FORM_COLOR_PROPERTIES[indicator.forms[i] ?? "colorless"],
                  stroke: TitrationLabColors.glassColorProperty,
                }),
                new Text(
                  capitalize(
                    StringUtils.fillIn(strings.formPatternStringProperty.value, {
                      color: colorName(indicator.forms[i] ?? "colorless"),
                      percent: fixed(100 * fraction, fraction < 0.001 && fraction > 0 ? 2 : 1),
                    }),
                  ),
                  { font: SMALL_FONT, fill: TitrationLabColors.textColorProperty, maxWidth: width - 20 },
                ),
              ],
            }),
        );
      },
    );
  }
}
