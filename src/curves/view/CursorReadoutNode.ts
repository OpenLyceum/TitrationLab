/**
 * CursorReadoutNode.ts
 *
 * What is in the flask at the cursor: the region, volume and pH, [H₃O⁺] and [OH⁻], and a bar
 * for the amount of each species and spectator ion. With "Show equations" on, the textbook
 * approximation for the region and its value appear, to compare with the exact pH above.
 */

import { Multilink, type ReadOnlyProperty } from "scenerystack/axon";
import { Bounds2 } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { AlignBox, type Color, HBox, Rectangle, RichText, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { analyteAmount, speciesAmounts, spectatorAmounts } from "../../common/model/TitrationCurve.js";
import { CONTROL_FONT, heading, SMALL_FONT } from "../../common/view/ControlFactory.js";
import { disposeChildren } from "../../common/view/disposeChildren.js";
import { fixed, formatPH, formatVolume, methodText, regionName, scientific } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import TitrationLabColors from "../../TitrationLabColors.js";
import { FONT_SIZE, KW } from "../../TitrationLabConstants.js";
import type { CurvesModel } from "../model/CurvesModel.js";
import { SPECIES_COLORS } from "./speciesColors.js";

const LABEL_WIDTH = 66;
const BAR_HEIGHT = 9;

export class CursorReadoutNode extends VBox {
  public constructor(model: CurvesModel, width: number) {
    const common = StringManager.getInstance().getCommonStrings();
    const strings = StringManager.getInstance().getCurvesStrings();
    const regionText = new Text("", {
      font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
      fill: TitrationLabColors.cursorColorProperty,
      maxWidth: width,
    });
    const valuesText = new Text("", {
      font: CONTROL_FONT,
      fill: TitrationLabColors.textColorProperty,
      maxWidth: width,
    });
    const hydroniumText = new RichText("", {
      font: SMALL_FONT,
      fill: TitrationLabColors.textColorProperty,
      maxWidth: width,
    });
    const hydroxideText = new RichText("", {
      font: SMALL_FONT,
      fill: TitrationLabColors.textColorProperty,
      maxWidth: width,
    });
    const methodNode = new RichText("", {
      font: SMALL_FONT,
      fill: TitrationLabColors.mutedTextColorProperty,
      lineWrap: width,
    });
    const approximationText = new Text("", {
      font: SMALL_FONT,
      fill: TitrationLabColors.mutedTextColorProperty,
      maxWidth: width,
    });
    const equations = new VBox({
      align: "left",
      spacing: 2,
      children: [methodNode, approximationText],
      visibleProperty: model.showEquationsProperty,
    });
    const bars = new VBox({ align: "left", spacing: 3 });

    super({
      align: "left",
      spacing: 5,
      children: [
        regionText,
        valuesText,
        hydroniumText,
        hydroxideText,
        equations,
        heading(strings.amountsHeadingStringProperty, width),
        bars,
      ],
    });

    const barWidth = width - LABEL_WIDTH - 62;
    Multilink.multilinkAny(
      [
        model.setupProperty,
        model.volumeProperty,
        model.pHProperty,
        model.regionProperty,
        model.maxVolumeProperty,
        common.millilitresPatternStringProperty,
        common.millimolesPatternStringProperty,
        common.pHPatternStringProperty,
        strings.hydroniumPatternStringProperty,
        strings.hydroxidePatternStringProperty,
        ...Object.values(common.regions),
        ...Object.values(common.methods),
      ],
      () => {
        const setup = model.setupProperty.value;
        const volume = model.volumeProperty.value;
        const pH = model.pHProperty.value;
        const region = model.regionProperty.value;
        regionText.string = regionName(region, setup.analyte);
        valuesText.string = `${StringUtils.fillIn(common.millilitresPatternStringProperty.value, { value: formatVolume(volume) })}   ${StringUtils.fillIn(common.pHPatternStringProperty.value, { value: formatPH(pH) })}`;
        const hydronium = 10 ** -pH;
        hydroniumText.string = StringUtils.fillIn(strings.hydroniumPatternStringProperty.value, {
          value: scientific(hydronium),
        });
        hydroxideText.string = StringUtils.fillIn(strings.hydroxidePatternStringProperty.value, {
          value: scientific(KW / hydronium),
        });
        methodNode.string = methodText(region.method);
        approximationText.string =
          region.approximatePH === null
            ? ""
            : StringUtils.fillIn(common.methods.approximationPatternStringProperty.value, {
                value: formatPH(region.approximatePH),
              });

        // Amounts (mmol), all on one scale: the most any bar reaches over the whole axis.
        const amounts = speciesAmounts(setup, volume);
        const spectators = spectatorAmounts(setup, volume);
        const maxSpectators = spectatorAmounts(setup, model.maxVolumeProperty.value);
        const scale = Math.max(analyteAmount(setup), maxSpectators.sodium, maxSpectators.chloride);
        const rows: { label: string; amount: number; color: ReadOnlyProperty<Color> }[] = [
          ...amounts.map((amount, j) => ({
            label: setup.analyte.species[j] as string,
            amount,
            color: SPECIES_COLORS[j] ?? TitrationLabColors.spectatorColorProperty,
          })),
        ];
        if (maxSpectators.sodium > 0) {
          rows.push({
            label: "Na<sup>+</sup>",
            amount: spectators.sodium,
            color: TitrationLabColors.spectatorColorProperty,
          });
        }
        if (maxSpectators.chloride > 0) {
          rows.push({
            label: "Cl<sup>−</sup>",
            amount: spectators.chloride,
            color: TitrationLabColors.spectatorColorProperty,
          });
        }
        disposeChildren(bars);
        bars.children = rows.map(
          (row) =>
            new HBox({
              spacing: 4,
              children: [
                new AlignBox(
                  new RichText(row.label, {
                    font: SMALL_FONT,
                    fill: TitrationLabColors.textColorProperty,
                    maxWidth: LABEL_WIDTH,
                  }),
                  { alignBounds: new Bounds2(0, 0, LABEL_WIDTH, BAR_HEIGHT + 6), xAlign: "left" },
                ),
                new Rectangle(0, 0, Math.max((barWidth * row.amount) / scale, 0.5), BAR_HEIGHT, { fill: row.color }),
                new Text(
                  StringUtils.fillIn(common.millimolesPatternStringProperty.value, { value: fixed(row.amount, 2) }),
                  {
                    font: SMALL_FONT,
                    fill: TitrationLabColors.mutedTextColorProperty,
                  },
                ),
              ],
            }),
        );
      },
    );
  }
}
