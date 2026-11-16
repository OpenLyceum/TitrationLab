import { TITRATION_LAB_PREFERENCES_NODE_SETTINGS } from "../TitrationLabConstants.js";
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
      font: new PhetFont({ size: TITRATION_LAB_PREFERENCES_NODE_SETTINGS.HEADER_FONT_SIZE, weight: "bold" }),
      fill: TitrationLabColors.controlSurfaceTextColorProperty,
    });

    const showReadingCheckbox = new Checkbox(
      preferencesModel.showReadingProperty,
      new Text(prefStrings.showReadingStringProperty, {
        font: new PhetFont(TITRATION_LAB_PREFERENCES_NODE_SETTINGS.SHOW_READING_CHECKBOX_FONT_SIZE),
        fill: TitrationLabColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: TitrationLabColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: TitrationLabColors.controlSurfaceColorProperty,
        spacing: TITRATION_LAB_PREFERENCES_NODE_SETTINGS.SHOW_READING_CHECKBOX_SPACING,
        ...(tandem && { tandem: tandem.createTandem("showReadingCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: TITRATION_LAB_PREFERENCES_NODE_SETTINGS.CONSTRUCTOR_SPACING,
      children: [header, showReadingCheckbox],
    });
  }
}

TitrationLabNamespace.register("TitrationLabPreferencesNode", TitrationLabPreferencesNode);
