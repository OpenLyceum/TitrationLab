/**
 * CurvesScreenView.ts
 *
 * Curves screen layout: the calculated titration curve on the left with the volume cursor under
 * it, the species fractions below on the same volume axis, and the display options at the
 * bottom. The right column holds the analyte controls and the readout at the cursor.
 *
 * On the curve: shaded buffer regions (where the conjugate-pair ratio is between 1:9 and 9:1, the
 * range Henderson–Hasselbalch is taught for), half-equivalence points with their pKa, equivalence
 * points, and an optional second curve for comparison.
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { LinePlot } from "scenerystack/bamboo";
import { Dimension2 } from "scenerystack/dot";
import { optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, HBox, KeyboardListener, Line, Node, Rectangle, RichText, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { HSlider } from "scenerystack/sun";
import { type Analyte, isStrong } from "../../common/model/Analytes.js";
import { equivalenceVolumes, halfEquivalenceVolumes, pHAt, sampleCurve } from "../../common/model/TitrationCurve.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/TitrationLabButtonOptions.js";
import { TITRATION_LAB_SLIDER_OPTIONS } from "../../common/TitrationLabControlOptions.js";
import TitrationLabHotkeyData from "../../common/TitrationLabHotkeyData.js";
import { TitrationLabPanel } from "../../common/TitrationLabPanel.js";
import {
  type ComboChoice,
  checkbox,
  comboBox,
  labeled,
  numberControl,
  pushButton,
  SMALL_FONT,
} from "../../common/view/ControlFactory.js";
import { disposeChildren } from "../../common/view/disposeChildren.js";
import {
  analyteLabelProperty,
  analyteNameProperty,
  formatPH,
  formatVolume,
  regionName,
  volumeAxisTitle,
} from "../../common/view/formatValues.js";
import { TitrationChartNode } from "../../common/view/TitrationChartNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import TitrationLabColors from "../../TitrationLabColors.js";
import {
  ANALYTE_CONCENTRATION_RANGE,
  CONCENTRATION_STEP,
  CUSTOM_PKA_RANGE,
  PANEL_SPACING,
  SCREEN_VIEW_MARGIN,
  SIDE_COLUMN_WIDTH,
} from "../../TitrationLabConstants.js";
import { CURVE_ANALYTES, CUSTOM_ACID, type CurvesModel } from "../model/CurvesModel.js";
import { CursorReadoutNode } from "./CursorReadoutNode.js";
import { CurvesScreenSummaryContent } from "./CurvesScreenSummaryContent.js";
import { SpeciesChartNode } from "./SpeciesChartNode.js";

export type CurvesScreenViewOptions = ScreenViewOptions;

/** Layout (px). */
const CHART_LEFT = 70;
const CHART_TOP = 40;
const CHART_WIDTH = 610;
const CHART_HEIGHT = 210;
const SPECIES_TOP = 352;
const SPECIES_HEIGHT = 140;
const SIDE_CONTENT_WIDTH = SIDE_COLUMN_WIDTH - 24;

/** Fraction of a step (in equivalents) shaded as buffer on each side: ratio 1:9 to 9:1. */
const BUFFER_EDGE = 0.1;
const MARKER_RADIUS = 4.5;

export class CurvesScreenView extends ScreenView {
  public constructor(model: CurvesModel, providedOptions?: CurvesScreenViewOptions) {
    const options = optionize<CurvesScreenViewOptions, object, ScreenViewOptions>()(
      { screenSummaryContent: new CurvesScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const common = StringManager.getInstance().getCommonStrings();
    const strings = StringManager.getInstance().getCurvesStrings();
    const a11y = StringManager.getInstance().getCurvesA11yStrings();
    const listParent = new Node();

    // ── Titration curve ─────────────────────────────────────────────────────────
    const xTitleProperty = new DerivedProperty([model.setupProperty, common.volumeAxisPatternStringProperty], (setup) =>
      volumeAxisTitle(setup.analyte),
    );
    const chart = new TitrationChartNode(CHART_WIDTH, CHART_HEIGHT, xTitleProperty, {
      title: common.titrationCurveStringProperty,
    });
    chart.x = CHART_LEFT;
    chart.y = CHART_TOP;
    const transform = chart.chartTransform;
    const bufferLayer = new Node({ visibleProperty: model.showBufferProperty });
    chart.underlayLayer.addChild(bufferLayer);
    const comparePlot = new LinePlot(transform, [], {
      stroke: TitrationLabColors.compareCurveColorProperty,
      lineWidth: 2,
      lineDash: [6, 4],
    });
    const curvePlot = new LinePlot(transform, [], { stroke: TitrationLabColors.curveColorProperty, lineWidth: 2.5 });
    chart.plotLayer.children = [comparePlot, curvePlot];
    const markerLayer = new Node({ visibleProperty: model.showKeyPointsProperty });
    const cursorLine = new Line(0, 0, 0, CHART_HEIGHT, {
      stroke: TitrationLabColors.cursorColorProperty,
      lineWidth: 1.5,
    });
    const cursorDot = new Circle(5, { fill: TitrationLabColors.cursorColorProperty });
    chart.overlayLayer.children = [markerLayer, cursorLine, cursorDot];
    const legend = new HBox({ spacing: 12 });

    const legendEntry = (analyte: Analyte, color: typeof TitrationLabColors.curveColorProperty, dash: number[]): Node =>
      new HBox({
        spacing: 4,
        children: [
          new Line(0, 0, 18, 0, { stroke: color, lineWidth: 2.5, lineDash: dash }),
          new RichText(analyte.formula, { font: SMALL_FONT, fill: TitrationLabColors.textColorProperty }),
        ],
      });

    Multilink.multilink(
      [model.setupProperty, model.compareSetupProperty, model.maxVolumeProperty],
      (setup, compare, maxVolume) => {
        chart.setMaxVolume(maxVolume);
        curvePlot.setDataSet(sampleCurve(setup, maxVolume));
        comparePlot.setDataSet(compare ? sampleCurve(compare, maxVolume) : []);

        // Buffer regions.
        disposeChildren(bufferLayer);
        const equivalences = equivalenceVolumes(setup);
        const step = equivalences[0] as number;
        if (!isStrong(setup.analyte)) {
          equivalences.forEach((_, k) => {
            const left = transform.modelToViewX((k + BUFFER_EDGE) * step);
            const right = transform.modelToViewX((k + 1 - BUFFER_EDGE) * step);
            bufferLayer.addChild(
              new Rectangle(left, 0, right - left, CHART_HEIGHT, {
                fill: TitrationLabColors.bufferRegionColorProperty,
              }),
            );
          });
        }

        // Key points.
        disposeChildren(markerLayer);
        for (const volume of halfEquivalenceVolumes(setup)) {
          const point = transform.modelToViewXY(volume, pHAt(setup, volume));
          markerLayer.addChild(
            new Line(0, point.y, point.x, point.y, {
              stroke: TitrationLabColors.halfEquivalenceColorProperty,
              lineDash: [3, 3],
            }),
          );
          markerLayer.addChild(
            new Circle(MARKER_RADIUS, { fill: TitrationLabColors.halfEquivalenceColorProperty, center: point }),
          );
        }
        for (const volume of equivalences) {
          const point = transform.modelToViewXY(volume, pHAt(setup, volume));
          markerLayer.addChild(
            new Line(point.x, point.y, point.x, CHART_HEIGHT, {
              stroke: TitrationLabColors.equivalenceColorProperty,
              lineDash: [3, 3],
            }),
          );
          markerLayer.addChild(
            new Circle(MARKER_RADIUS, { fill: TitrationLabColors.equivalenceColorProperty, center: point }),
          );
        }

        disposeChildren(legend);
        legend.children = compare
          ? [
              legendEntry(setup.analyte, TitrationLabColors.curveColorProperty, []),
              legendEntry(compare.analyte, TitrationLabColors.compareCurveColorProperty, [6, 4]),
            ]
          : [];
        legend.right = CHART_LEFT + CHART_WIDTH;
        legend.bottom = CHART_TOP - 8;
      },
    );
    Multilink.multilink([model.volumeProperty, model.pHProperty, model.maxVolumeProperty], (volume, pH) => {
      const point = transform.modelToViewXY(volume, pH);
      cursorLine.setLine(point.x, 0, point.x, CHART_HEIGHT);
      cursorDot.center = point;
    });

    // ── Cursor slider ───────────────────────────────────────────────────────────
    const cursorSlider = new HSlider(model.cursorFractionProperty, model.cursorFractionProperty.range, {
      ...TITRATION_LAB_SLIDER_OPTIONS,
      trackSize: new Dimension2(CHART_WIDTH, 3),
      keyboardStep: 0.01,
      shiftKeyboardStep: 0.002,
      pageKeyboardStep: 0.1,
      accessibleName: a11y.controls.cursorStringProperty,
      pdomCreateAriaValueText: () =>
        StringUtils.fillIn(a11y.cursorValuePatternStringProperty.value, {
          volume: formatVolume(model.volumeProperty.value),
          pH: formatPH(model.pHProperty.value),
          region: regionName(model.regionProperty.value, model.setupProperty.value.analyte),
        }),
      pdomDependencies: [
        model.maxVolumeProperty,
        model.setupProperty,
        a11y.cursorValuePatternStringProperty,
        ...Object.values(common.regions),
      ],
    });
    cursorSlider.left = CHART_LEFT - TITRATION_LAB_SLIDER_OPTIONS.thumbSize.width / 2;
    cursorSlider.top = CHART_TOP + CHART_HEIGHT + 38;

    // ── Species ─────────────────────────────────────────────────────────────────
    const species = new SpeciesChartNode(model, CHART_WIDTH, SPECIES_HEIGHT, xTitleProperty);
    species.x = CHART_LEFT;
    species.y = SPECIES_TOP;
    species.visibleProperty = model.showSpeciesProperty;

    // ── Options row ────────────────────────────────────────────────────────────
    const previousButton = pushButton(strings.previousKeyPointStringProperty, () => model.jumpToKeyPoint(-1));
    const nextButton = pushButton(strings.nextKeyPointStringProperty, () => model.jumpToKeyPoint(1));
    const optionsRow = new HBox({
      spacing: 14,
      children: [
        previousButton,
        nextButton,
        checkbox(model.showSpeciesProperty, strings.speciesFractionsStringProperty, 140),
        checkbox(model.showBufferProperty, strings.bufferRegionStringProperty, 120),
        checkbox(model.showKeyPointsProperty, strings.keyPointsStringProperty, 110),
      ],
      left: CHART_LEFT - 40,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });

    // ── Setup panel ─────────────────────────────────────────────────────────────
    const analyteChoices: ComboChoice<Analyte>[] = CURVE_ANALYTES.map((analyte) => ({
      value: analyte,
      label: analyteNameProperty(analyte.id),
      display: analyteLabelProperty(analyte),
    }));
    const analyteCombo = comboBox(
      model.analyteProperty,
      analyteChoices,
      listParent,
      a11y.controls.analyteStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    const compareChoices: ComboChoice<Analyte | null>[] = [
      { value: null, label: common.noneStringProperty },
      ...analyteChoices.map((choice) => ({ ...choice, value: choice.value as Analyte | null })),
    ];
    const compareCombo = comboBox(
      model.compareProperty,
      compareChoices,
      listParent,
      a11y.controls.compareStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    const pKaControl = numberControl(
      strings.customPKaStringProperty,
      model.customPKaProperty,
      CUSTOM_PKA_RANGE,
      { delta: 0.1, decimalPlaces: 1 },
      SIDE_CONTENT_WIDTH,
    );
    // The custom pKa applies to the custom acid whether it is the analyte or the comparison.
    Multilink.multilink([model.analyteProperty, model.compareProperty], (analyte, compare) => {
      pKaControl.visible = analyte === CUSTOM_ACID || compare === CUSTOM_ACID;
    });
    const concentrationControl = numberControl(
      common.analyteConcentrationStringProperty,
      model.analyteConcentrationProperty,
      ANALYTE_CONCENTRATION_RANGE,
      { delta: CONCENTRATION_STEP, decimalPlaces: 3, valuePattern: common.molarPatternStringProperty },
      SIDE_CONTENT_WIDTH,
    );
    const setupPanel = new TitrationLabPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          labeled(common.analyteStringProperty, analyteCombo, SIDE_CONTENT_WIDTH),
          pKaControl,
          concentrationControl,
          labeled(strings.compareWithStringProperty, compareCombo, SIDE_CONTENT_WIDTH),
          checkbox(model.showEquationsProperty, strings.showEquationsStringProperty, SIDE_CONTENT_WIDTH - 30),
        ],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );
    setupPanel.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    setupPanel.top = SCREEN_VIEW_MARGIN;

    // ── Readout ────────────────────────────────────────────────────────────────
    const readoutPanel = new TitrationLabPanel(new CursorReadoutNode(model, SIDE_CONTENT_WIDTH), {
      minWidth: SIDE_COLUMN_WIDTH,
      maxWidth: SIDE_COLUMN_WIDTH,
    });
    readoutPanel.right = setupPanel.right;
    setupPanel.boundsProperty.link(() => {
      readoutPanel.top = setupPanel.bottom + PANEL_SPACING;
    });

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });

    // ── Keyboard: K / Shift+K jump between key points ───────────────────────────
    KeyboardListener.createGlobal(this, {
      keyStringProperties: [
        ...TitrationLabHotkeyData.NEXT_KEY_POINT.keyStringProperties,
        ...TitrationLabHotkeyData.PREVIOUS_KEY_POINT.keyStringProperties,
      ],
      fire: (_event, keysPressed) => model.jumpToKeyPoint(keysPressed.startsWith("shift") ? -1 : 1),
    });

    this.children = [
      chart,
      legend,
      cursorSlider,
      species,
      optionsRow,
      setupPanel,
      readoutPanel,
      resetAllButton,
      listParent,
    ];
    this.pdomPlayAreaNode.pdomOrder = [cursorSlider, previousButton, nextButton, readoutPanel];
    this.pdomControlAreaNode.pdomOrder = [setupPanel, optionsRow, resetAllButton];
  }
}
