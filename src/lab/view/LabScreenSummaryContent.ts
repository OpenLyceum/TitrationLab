/**
 * LabScreenSummaryContent.ts
 *
 * Screen summary for the Lab screen. The current-details paragraph is live: the sample and
 * indicator, the titrant added, the colour of the solution and, with the meter in, its pH.
 */

import { DerivedProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { perceivedColor } from "../../common/model/Indicators.js";
import {
  analyteNameProperty,
  colorName,
  formatPH,
  formatVolume,
  indicatorName,
} from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import { type LabModel, UNKNOWN } from "../model/LabModel.js";

export class LabScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: LabModel) {
    const a11y = StringManager.getInstance().getLabA11yStrings();

    // Lives as long as the screen, which is never disposed.
    const currentDetailsProperty = new DerivedProperty(
      [
        model.sampleProperty,
        model.indicatorProperty,
        model.titrantAddedProperty,
        model.pHProperty,
        model.meterInFlaskProperty,
        localeProperty,
      ],
      (sample, indicator, added, pH, meterIn) => {
        const name = sample === UNKNOWN ? a11y.unknownSampleStringProperty.value : analyteNameProperty(sample.id).value;
        const color = indicator ? colorName(perceivedColor(indicator, pH).color) : colorName("colorless");
        return StringUtils.fillIn(a11y.currentDetailsPatternStringProperty.value, {
          sample: name,
          indicator: indicatorName(indicator),
          added: formatVolume(added),
          color,
          meter: meterIn ? StringUtils.fillIn(a11y.meterPatternStringProperty.value, { value: formatPH(pH) }) : "",
        });
      },
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
