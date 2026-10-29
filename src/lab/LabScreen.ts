/**
 * LabScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createLabIcon() in src/common/TitrationLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createLabIcon } from "../common/TitrationLabScreenIcons.js";
import TitrationLabColors from "../TitrationLabColors.js";
import { LabModel } from "./model/LabModel.js";
import { LabKeyboardHelpContent } from "./view/LabKeyboardHelpContent.js";
import { LabScreenView } from "./view/LabScreenView.js";

type SelfOptions = {
  /** Print the burette reading as a number (Preferences). */
  showReadingProperty: TReadOnlyProperty<boolean>;
};

// Require tandem to be explicit — accidental omission would break PhET-iO.
type LabScreenOptions = SelfOptions & ScreenOptions & { tandem: Tandem };

export class LabScreen extends Screen<LabModel, LabScreenView> {
  public constructor(options: LabScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new LabModel(),
      // View factory — receives the model instance
      (model) =>
        new LabScreenView(model, {
          showReadingProperty: options.showReadingProperty,
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<LabScreenOptions, SelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: TitrationLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new LabKeyboardHelpContent(),
          homeScreenIcon: createLabIcon(),
          navigationBarIcon: createLabIcon(),
        },
        options,
      ),
    );
  }
}
