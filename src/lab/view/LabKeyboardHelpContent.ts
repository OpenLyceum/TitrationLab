/**
 * LabKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Lab screen: the drop keys on the left with the slider keys (for
 * the stopcock and the concentrations); combo boxes, buttons and checkboxes on the right.
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

export class LabKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const keyboardHelp = StringManager.getInstance().getKeyboardHelpStrings();
    const buretteSection = new KeyboardHelpSection(keyboardHelp.buretteSectionStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData(TitrationLabHotkeyData.ADD_DROP),
      KeyboardHelpSectionRow.fromHotkeyData(TitrationLabHotkeyData.ADD_HALF_DROP),
    ]);
    super(
      [buretteSection, new SliderControlsKeyboardHelpSection()],
      [new ComboBoxKeyboardHelpSection(), new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
