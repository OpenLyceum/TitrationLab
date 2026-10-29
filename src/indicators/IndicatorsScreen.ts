/**
 * IndicatorsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createIndicatorsIcon() in src/common/TitrationLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createIndicatorsIcon } from "../common/TitrationLabScreenIcons.js";
import TitrationLabColors from "../TitrationLabColors.js";
import { IndicatorsModel } from "./model/IndicatorsModel.js";
import { IndicatorsKeyboardHelpContent } from "./view/IndicatorsKeyboardHelpContent.js";
import { IndicatorsScreenView } from "./view/IndicatorsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type IndicatorsScreenOptions = ScreenOptions & { tandem: Tandem };

export class IndicatorsScreen extends Screen<IndicatorsModel, IndicatorsScreenView> {
  public constructor(options: IndicatorsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new IndicatorsModel(),
      // View factory — receives the model instance
      (model) =>
        new IndicatorsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<IndicatorsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: TitrationLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new IndicatorsKeyboardHelpContent(),
          homeScreenIcon: createIndicatorsIcon(),
          navigationBarIcon: createIndicatorsIcon(),
        },
        options,
      ),
    );
  }
}
