/**
 * IndicatorsKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Indicators screen: the pH slider on the left; the indicator and
 * titration menus and Reset All on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class IndicatorsKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new SliderControlsKeyboardHelpSection()],
      [new ComboBoxKeyboardHelpSection(), new BasicActionsKeyboardHelpSection()],
    );
  }
}
