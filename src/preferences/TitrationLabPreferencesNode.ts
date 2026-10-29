/**
 * TitrationLabPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to TitrationLabPreferencesModel Properties (whose initial values come from
 * titrationLabQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import TitrationLabColors from "../TitrationLabColors.js";
import TitrationLabNamespace from "../TitrationLabNamespace.js";
import type { TitrationLabPreferencesModel } from "./TitrationLabPreferencesModel.js";

export class TitrationLabPreferencesNode extends VBox {
  public constructor(preferencesModel: TitrationLabPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // The Preferences dialog is always white, so use the dark "light control surface"
    // colors (readable on white in both default and projector profiles), not textColorProperty
    // (which is near-white in default mode and would be invisible on the white dialog).
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: TitrationLabColors.controlSurfaceTextColorProperty,
    });

    const showReadingCheckbox = new Checkbox(
      preferencesModel.showReadingProperty,
      new Text(prefStrings.showReadingStringProperty, {
        font: new PhetFont(14),
        fill: TitrationLabColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: TitrationLabColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: TitrationLabColors.controlSurfaceColorProperty,
        spacing: 8,
        ...(tandem && { tandem: tandem.createTandem("showReadingCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: 12,
      children: [header, showReadingCheckbox],
    });
  }
}

TitrationLabNamespace.register("TitrationLabPreferencesNode", TitrationLabPreferencesNode);
