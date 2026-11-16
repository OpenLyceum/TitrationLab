import { INDICATORS_SCREEN_VIEW_SETTINGS } from "../../TitrationLabConstants.js";
/**
 * IndicatorsScreenView.ts
 *
 * Indicators screen layout. Left: a pH slider, the tube rack (every indicator at that pH), the
 * colour strips of every indicator across pH 0–14, and the selected indicator's forms. Right:
 * choosing an indicator for a titration, with the curve, the selected indicator's band and the
 * table of endpoint errors.
 */

import { DerivedProperty } from "scenerystack/axon";
import { Dimension2 } from "scenerystack/dot";
import { optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { HSlider } from "scenerystack/sun";
import { ANALYTES, type Analyte } from "../../common/model/Analytes.js";
import { INDICATORS, type Indicator } from "../../common/model/Indicators.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/TitrationLabButtonOptions.js";
import { TITRATION_LAB_SLIDER_OPTIONS } from "../../common/TitrationLabControlOptions.js";
import { TitrationLabPanel } from "../../common/TitrationLabPanel.js";
import { type ComboChoice, comboBox, heading, labeled, SMALL_FONT } from "../../common/view/ControlFactory.js";
import {
  analyteLabelProperty,
  analyteNameProperty,
  formatPH,
  indicatorNameProperty,
} from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import TitrationLabColors from "../../TitrationLabColors.js";
import { FONT_SIZE, PH_RANGE, SCREEN_VIEW_MARGIN } from "../../TitrationLabConstants.js";
import type { IndicatorsModel } from "../model/IndicatorsModel.js";
import { ChooseIndicatorNode } from "./ChooseIndicatorNode.js";
import { ColorRangesNode } from "./ColorRangesNode.js";
import { IndicatorBreakdownNode } from "./IndicatorBreakdownNode.js";
import { IndicatorsScreenSummaryContent } from "./IndicatorsScreenSummaryContent.js";
import { TubeRackNode } from "./TubeRackNode.js";

export type IndicatorsScreenViewOptions = ScreenViewOptions;

/** Layout (px). */
const LEFT_WIDTH: number = INDICATORS_SCREEN_VIEW_SETTINGS.LEFT_WIDTH;
const RIGHT_PANEL_WIDTH: number = INDICATORS_SCREEN_VIEW_SETTINGS.RIGHT_PANEL_WIDTH;
const RIGHT_CONTENT_WIDTH = RIGHT_PANEL_WIDTH - 24;
const BREAKDOWN_WIDTH: number = INDICATORS_SCREEN_VIEW_SETTINGS.BREAKDOWN_WIDTH;

export class IndicatorsScreenView extends ScreenView {
  public constructor(model: IndicatorsModel, providedOptions?: IndicatorsScreenViewOptions) {
    const options = optionize<IndicatorsScreenViewOptions, object, ScreenViewOptions>()(
      { screenSummaryContent: new IndicatorsScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const common = StringManager.getInstance().getCommonStrings();
    const strings = StringManager.getInstance().getIndicatorsStrings();
    const a11y = StringManager.getInstance().getIndicatorsA11yStrings();
    const listParent = new Node();
    const left = SCREEN_VIEW_MARGIN + 20;

    // ── pH slider ───────────────────────────────────────────────────────────────
    const pHReadout = new Text(
      new DerivedProperty([model.pHProperty, common.pHPatternStringProperty], (pH, pattern) =>
        StringUtils.fillIn(pattern, { value: formatPH(pH) }),
      ),
      { font: new PhetFont({ size: FONT_SIZE.readout, weight: "bold" }), fill: TitrationLabColors.cursorColorProperty },
    );
    const pHSlider = new HSlider(model.pHProperty, PH_RANGE, {
      ...TITRATION_LAB_SLIDER_OPTIONS,
      trackSize: new Dimension2(LEFT_WIDTH - 140, INDICATORS_SCREEN_VIEW_SETTINGS.PH_SLIDER_HEIGHT),
      keyboardStep: INDICATORS_SCREEN_VIEW_SETTINGS.PH_SLIDER_KEYBOARD_STEP,
      shiftKeyboardStep: INDICATORS_SCREEN_VIEW_SETTINGS.PH_SLIDER_SHIFT_KEYBOARD_STEP,
      pageKeyboardStep: INDICATORS_SCREEN_VIEW_SETTINGS.PH_SLIDER_PAGE_KEYBOARD_STEP,
      constrainValue: (value: number) => Math.round(value * 20) / 20,
      accessibleName: strings.solutionPHStringProperty,
    });
    for (let pH = PH_RANGE.min; pH <= PH_RANGE.max; pH += 2) {
      pHSlider.addMajorTick(pH, new Text(String(pH), { font: SMALL_FONT, fill: TitrationLabColors.textColorProperty }));
    }
    const sliderRow = new VBox({
      align: "left",
      spacing: INDICATORS_SCREEN_VIEW_SETTINGS.SLIDER_ROW_SPACING,
      children: [
        new HBox({
          spacing: INDICATORS_SCREEN_VIEW_SETTINGS.SLIDER_ROW_ITEM_1_SPACING,
          children: [
            heading(strings.solutionPHStringProperty, INDICATORS_SCREEN_VIEW_SETTINGS.SOLUTION_PH_HEADING_MAX_WIDTH),
            pHReadout,
          ],
        }),
        pHSlider,
      ],
      left,
      top: SCREEN_VIEW_MARGIN,
    });

    // ── Tubes and colour strips ─────────────────────────────────────────────────
    const tubesHeading = heading(strings.tubesHeadingStringProperty, LEFT_WIDTH);
    tubesHeading.left = left;
    tubesHeading.top = sliderRow.bottom + INDICATORS_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_TOP_OFFSET;
    const rack = new TubeRackNode(model.pHProperty, model.indicatorProperty, LEFT_WIDTH);
    rack.left = left;
    rack.top = tubesHeading.bottom + INDICATORS_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_TOP_OFFSET;
    const ranges = new ColorRangesNode(model.pHProperty, model.indicatorProperty, LEFT_WIDTH);
    ranges.left = left;
    ranges.top = rack.bottom + 10;

    // ── Selected indicator ─────────────────────────────────────────────────────
    const indicatorChoices: ComboChoice<Indicator>[] = INDICATORS.map((indicator) => ({
      value: indicator,
      label: indicatorNameProperty(indicator.id),
    }));
    const indicatorCombo = comboBox(
      model.indicatorProperty,
      indicatorChoices,
      listParent,
      a11y.controls.indicatorStringProperty,
      INDICATORS_SCREEN_VIEW_SETTINGS.INDICATOR_COMBO_BOX_MAX_WIDTH,
    );
    const breakdownPanel = new TitrationLabPanel(
      new IndicatorBreakdownNode(
        model.pHProperty,
        model.indicatorProperty,
        BREAKDOWN_WIDTH,
        labeled(common.indicatorStringProperty, indicatorCombo, BREAKDOWN_WIDTH),
      ),
    );
    breakdownPanel.left = left - INDICATORS_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_LEFT_OFFSET;
    breakdownPanel.top = ranges.bottom + 10;

    // ── Choosing an indicator ───────────────────────────────────────────────────
    const titrationChoices: ComboChoice<Analyte>[] = ANALYTES.map((analyte) => ({
      value: analyte,
      label: analyteNameProperty(analyte.id),
      display: analyteLabelProperty(analyte),
    }));
    const titrationCombo = comboBox(
      model.titrationAnalyteProperty,
      titrationChoices,
      listParent,
      a11y.controls.titrationStringProperty,
      INDICATORS_SCREEN_VIEW_SETTINGS.TITRATION_ANALYTE_COMBO_BOX_MAX_WIDTH,
    );
    const choose = new ChooseIndicatorNode(model, model.indicatorProperty, RIGHT_CONTENT_WIDTH - 40, 170);
    const hint = new Text(strings.chooseHintStringProperty, {
      font: SMALL_FONT,
      fill: TitrationLabColors.mutedTextColorProperty,
      maxWidth: RIGHT_CONTENT_WIDTH,
    });
    const choosePanel = new TitrationLabPanel(
      new VBox({
        align: "left",
        spacing: INDICATORS_SCREEN_VIEW_SETTINGS.CHOOSE_PANEL_SPACING,
        children: [
          heading(strings.chooseHeadingStringProperty, RIGHT_CONTENT_WIDTH),
          labeled(strings.titrationStringProperty, titrationCombo, RIGHT_CONTENT_WIDTH),
          new Node({ children: [choose], x: INDICATORS_SCREEN_VIEW_SETTINGS.CHOOSE_PANEL_X }),
          hint,
        ],
      }),
      { minWidth: RIGHT_PANEL_WIDTH, maxWidth: RIGHT_PANEL_WIDTH },
    );
    choosePanel.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    choosePanel.top = SCREEN_VIEW_MARGIN;

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [sliderRow, tubesHeading, rack, ranges, breakdownPanel, choosePanel, resetAllButton, listParent];
    this.pdomPlayAreaNode.pdomOrder = [pHSlider, rack, ranges, breakdownPanel];
    this.pdomControlAreaNode.pdomOrder = [choosePanel, resetAllButton];
  }
}
