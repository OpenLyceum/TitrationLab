/**
 * CurvesKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Curves screen: the cursor keys (the cursor is a slider, plus
 * K / Shift+K to jump between key points) on the left; combo boxes, buttons and checkboxes on
 * the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import TitrationLabHotkeyData from "../../common/TitrationLabHotkeyData.js";
import { StringManager } from "../../i18n/StringManager.js";

export class CurvesKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const keyboardHelp = StringManager.getInstance().getKeyboardHelpStrings();
    const cursorSection = new KeyboardHelpSection(keyboardHelp.cursorSectionStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData(TitrationLabHotkeyData.NEXT_KEY_POINT),
      KeyboardHelpSectionRow.fromHotkeyData(TitrationLabHotkeyData.PREVIOUS_KEY_POINT),
    ]);
    super(
      [cursorSection, new SliderControlsKeyboardHelpSection()],
      [new ComboBoxKeyboardHelpSection(), new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
