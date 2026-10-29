/**
 * IndicatorsScreenSummaryContent.ts
 *
 * Screen summary for the Indicators screen. The current-details paragraph is live: the selected
 * indicator's colour at the chosen pH, and the indicators rated good for the chosen titration.
 */

import { DerivedProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { perceivedColor } from "../../common/model/Indicators.js";
import { analyteNameProperty, colorName, formatPH, indicatorName } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { IndicatorsModel } from "../model/IndicatorsModel.js";

export class IndicatorsScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: IndicatorsModel) {
    const a11y = StringManager.getInstance().getIndicatorsA11yStrings();

    // Lives as long as the screen, which is never disposed.
    const currentDetailsProperty = new DerivedProperty(
      [
        model.pHProperty,
        model.indicatorProperty,
        model.titrationAnalyteProperty,
        model.ratingsProperty,
        localeProperty,
      ],
      (pH, indicator, analyte, ratings) => {
        const good = ratings.filter((rating) => rating.good).map((rating) => indicatorName(rating.indicator));
        return StringUtils.fillIn(a11y.currentDetailsPatternStringProperty.value, {
          pH: formatPH(pH),
          indicator: indicatorName(indicator),
          color: colorName(perceivedColor(indicator, pH).color),
          titration: analyteNameProperty(analyte.id).value,
          good:
            good.length > 0
              ? good.join(a11y.listSeparatorStringProperty.value)
              : a11y.noGoodIndicatorStringProperty.value,
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
