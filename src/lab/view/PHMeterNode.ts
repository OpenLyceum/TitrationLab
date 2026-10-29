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

const WIDTH = 92;
const HEIGHT = 56;

export class PHMeterNode extends Node {
  /** Where the cable leaves the case (local coordinates). */
  public readonly cableAnchor = { x: 14, y: HEIGHT };

  public constructor(pHProperty: TReadOnlyProperty<number>, meterInProperty: TReadOnlyProperty<boolean>) {
    super();
    const common = StringManager.getInstance().getCommonStrings();
    const reading = new DerivedProperty(
      [pHProperty, meterInProperty, common.noReadingStringProperty],
      (pH, inFlask, noReading) => (inFlask ? formatPH(pH) : noReading),
    );
    const screen = new Rectangle(8, 18, WIDTH - 16, HEIGHT - 26, 3, 3, {
      fill: TitrationLabColors.meterScreenColorProperty,
    });
    const value = new Text(reading, {
      font: new PhetFont({ size: 20, weight: "bold", family: "monospace" }),
      fill: TitrationLabColors.meterTextColorProperty,
      maxWidth: WIDTH - 24,
    });
    value.boundsProperty.link(() => {
      value.center = screen.center;
    });
    this.children = [
      new Rectangle(0, 0, WIDTH, HEIGHT, 6, 6, {
        fill: TitrationLabColors.meterBodyColorProperty,
        stroke: TitrationLabColors.glassColorProperty,
      }),
      new Text("pH", {
        font: new PhetFont({ size: FONT_SIZE.small, weight: "bold" }),
        fill: TitrationLabColors.textColorProperty,
        left: 8,
        top: 2,
      }),
      screen,
      value,
    ];
  }
}
