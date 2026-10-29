/**
 * CurvesScreenSummaryContent.ts
 *
 * Screen summary for the Curves screen. The current-details paragraph is live: the analyte, the
 * cursor volume, the region there and the pH.
 */

import { DerivedProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { analyteNameProperty, formatPH, formatVolume, regionName } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { CurvesModel } from "../model/CurvesModel.js";

export class CurvesScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: CurvesModel) {
    const a11y = StringManager.getInstance().getCurvesA11yStrings();

    // Lives as long as the screen, which is never disposed.
    const currentDetailsProperty = new DerivedProperty(
      [model.setupProperty, model.volumeProperty, model.pHProperty, model.regionProperty, localeProperty],
      (setup, volume, pH, region) =>
        StringUtils.fillIn(a11y.currentDetailsPatternStringProperty.value, {
          analyte: analyteNameProperty(setup.analyte.id).value,
          volume: formatVolume(volume),
          region: regionName(region, setup.analyte),
          pH: formatPH(pH),
        }),
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
