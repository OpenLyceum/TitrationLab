/**
 * TitrationLabHotkeyData.ts
 *
 * Sim-specific keys: adding drops on the Lab screen and jumping between key points on the Curves
 * screen. The KeyboardListeners use these keys, and the keyboard-help dialogs label them.
 */

import { HotkeyData } from "scenerystack/scenery";
import { StringManager } from "../i18n/StringManager.js";

const REPO_NAME = "titration-lab";
const keyboardHelp = StringManager.getInstance().getKeyboardHelpStrings();

const TitrationLabHotkeyData = {
  ADD_DROP: new HotkeyData({
    keys: ["d"],
    repoName: REPO_NAME,
    global: true,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.addDropStringProperty,
  }),
  ADD_HALF_DROP: new HotkeyData({
    keys: ["shift+d"],
    repoName: REPO_NAME,
    global: true,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.addHalfDropStringProperty,
  }),
  NEXT_KEY_POINT: new HotkeyData({
    keys: ["k"],
    repoName: REPO_NAME,
    global: true,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.jumpKeyPointStringProperty,
  }),
  PREVIOUS_KEY_POINT: new HotkeyData({
    keys: ["shift+k"],
    repoName: REPO_NAME,
    global: true,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.jumpKeyPointBackStringProperty,
  }),
};

export default TitrationLabHotkeyData;
