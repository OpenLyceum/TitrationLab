/**
 * CurvesScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createCurvesIcon() in src/common/TitrationLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createCurvesIcon } from "../common/TitrationLabScreenIcons.js";
import TitrationLabColors from "../TitrationLabColors.js";
import { CurvesModel } from "./model/CurvesModel.js";
import { CurvesKeyboardHelpContent } from "./view/CurvesKeyboardHelpContent.js";
import { CurvesScreenView } from "./view/CurvesScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type CurvesScreenOptions = ScreenOptions & { tandem: Tandem };

export class CurvesScreen extends Screen<CurvesModel, CurvesScreenView> {
  public constructor(options: CurvesScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new CurvesModel(),
      // View factory — receives the model instance
      (model) =>
        new CurvesScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<CurvesScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: TitrationLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new CurvesKeyboardHelpContent(),
          homeScreenIcon: createCurvesIcon(),
          navigationBarIcon: createCurvesIcon(),
        },
        options,
      ),
    );
  }
}
