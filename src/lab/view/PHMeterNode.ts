import { PH_METER_NODE_SETTINGS } from "../../TitrationLabConstants.js";
/**
 * PHMeterNode.ts
 *
 * A bench pH meter: a case with a display that reads the flask pH to 0.01 while the probe is in
 * the flask, and "—" otherwise. The probe itself is drawn by the screen view, which knows where
 * the flask is.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { formatPH } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import TitrationLabColors from "../../TitrationLabColors.js";
import { FONT_SIZE } from "../../TitrationLabConstants.js";

const WIDTH: number = PH_METER_NODE_SETTINGS.WIDTH;
const HEIGHT: number = PH_METER_NODE_SETTINGS.HEIGHT;

export class PHMeterNode extends Node {
  /** Where the cable leaves the case (local coordinates). */
  public readonly cableAnchor = { x: PH_METER_NODE_SETTINGS.CABLE_ANCHOR_X, y: HEIGHT };

  public constructor(pHProperty: TReadOnlyProperty<number>, meterInProperty: TReadOnlyProperty<boolean>) {
    super();
    const common = StringManager.getInstance().getCommonStrings();
    const readingProperty = new DerivedProperty(
      [pHProperty, meterInProperty, common.noReadingStringProperty],
      (pH, inFlask, noReading) => (inFlask ? formatPH(pH) : noReading),
    );
    const screen = new Rectangle(
      PH_METER_NODE_SETTINGS.SCREEN_X,
      PH_METER_NODE_SETTINGS.SCREEN_Y,
      WIDTH - 16,
      HEIGHT - 26,
      PH_METER_NODE_SETTINGS.SCREEN_CORNER_X,
      PH_METER_NODE_SETTINGS.SCREEN_CORNER_Y,
      {
        fill: TitrationLabColors.meterScreenColorProperty,
      },
    );
    const value = new Text(readingProperty, {
      font: new PhetFont({ size: PH_METER_NODE_SETTINGS.VALUE_FONT_SIZE, weight: "bold", family: "monospace" }),
      fill: TitrationLabColors.meterTextColorProperty,
      maxWidth: WIDTH - PH_METER_NODE_SETTINGS.VALUE_MAX_WIDTH_OFFSET,
    });
    value.boundsProperty.link(() => {
      value.center = screen.center;
    });
    this.children = [
      new Rectangle(
        0,
        0,
        WIDTH,
        HEIGHT,
        PH_METER_NODE_SETTINGS.CHILDREN_CORNER_X,
        PH_METER_NODE_SETTINGS.CHILDREN_CORNER_Y,
        {
          fill: TitrationLabColors.meterBodyColorProperty,
          stroke: TitrationLabColors.glassColorProperty,
        },
      ),
      new Text("pH", {
        font: new PhetFont({ size: FONT_SIZE.small, weight: "bold" }),
        fill: TitrationLabColors.textColorProperty,
        left: PH_METER_NODE_SETTINGS.CHILDREN_LEFT,
        top: PH_METER_NODE_SETTINGS.CHILDREN_TOP,
      }),
      screen,
      value,
    ];
  }
}
