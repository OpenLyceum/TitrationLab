import { LAB_SCREEN_VIEW_SETTINGS } from "../../TitrationLabConstants.js";
/**
 * LabScreenView.ts
 *
 * Lab screen layout: the burette over the flask on the left with the pH meter beside them; the
 * titration chart in the middle with the burette controls and the notebook under it; the sample
 * and indicator controls in the right column.
 *
 * Drops are drawn here: every 0.05 mL delivered becomes one falling drop, and a fast flow is a
 * stream. Colour changes, flashes and notebook entries are announced for screen readers.
 */

import { DerivedProperty, Multilink, PatternStringProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import { LinePlot } from "scenerystack/bamboo";
import { Dimension2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import {
  Circle,
  HBox,
  KeyboardListener,
  Line,
  Node,
  Path,
  PressListener,
  Rectangle,
  RichText,
  Text,
  VBox,
} from "scenerystack/scenery";
import { PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { HSlider, NumberPicker } from "scenerystack/sun";
import { ANALYTES, type Analyte, titrantFormula } from "../../common/model/Analytes.js";
import { INDICATORS, type Indicator, perceivedColor } from "../../common/model/Indicators.js";
import { equivalenceVolumes, sampleCurve } from "../../common/model/TitrationCurve.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/TitrationLabButtonOptions.js";
import { TITRATION_LAB_SLIDER_OPTIONS } from "../../common/TitrationLabControlOptions.js";
import TitrationLabHotkeyData from "../../common/TitrationLabHotkeyData.js";
import { TitrationLabPanel } from "../../common/TitrationLabPanel.js";
import {
  CONTROL_FONT,
  type ComboChoice,
  checkbox,
  comboBox,
  heading,
  label,
  labeled,
  numberControl,
  pushButton,
  radioGroup,
  SMALL_FONT,
} from "../../common/view/ControlFactory.js";
import { disposeChildren } from "../../common/view/disposeChildren.js";
import {
  analyteLabelProperty,
  analyteNameProperty,
  colorName,
  fixed,
  formatVolume,
  indicatorNameProperty,
  volumeAxisTitle,
} from "../../common/view/formatValues.js";
import { TitrationChartNode } from "../../common/view/TitrationChartNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import TitrationLabColors from "../../TitrationLabColors.js";
import {
  ANALYTE_CONCENTRATION_RANGE,
  ANALYTE_VOLUMES,
  ANSWER_RANGE,
  CONCENTRATION_STEP,
  DROP_VOLUME,
  FLOW_RATE_RANGE,
  FONT_SIZE,
  HALF_DROP_VOLUME,
  PANEL_SPACING,
  SCREEN_VIEW_MARGIN,
  SIDE_COLUMN_WIDTH,
  TITRANT_CONCENTRATION_RANGE,
} from "../../TitrationLabConstants.js";
import { type LabModel, type LabSample, UNKNOWN } from "../model/LabModel.js";
import { BuretteNode, TIP_POSITION } from "./BuretteNode.js";
import { FlaskNode } from "./FlaskNode.js";
import { LabScreenSummaryContent } from "./LabScreenSummaryContent.js";
import { PHMeterNode } from "./PHMeterNode.js";

type SelfOptions = {
  /** Print the burette reading as a number (Preferences). */
  showReadingProperty: TReadOnlyProperty<boolean>;
};

export type LabScreenViewOptions = SelfOptions & ScreenViewOptions;

/** Layout (px). */
const BURETTE_X: number = LAB_SCREEN_VIEW_SETTINGS.BURETTE_X;
const BURETTE_Y: number = LAB_SCREEN_VIEW_SETTINGS.BURETTE_Y;
const FLASK_TOP: number = LAB_SCREEN_VIEW_SETTINGS.FLASK_TOP;
const CHART_LEFT: number = LAB_SCREEN_VIEW_SETTINGS.CHART_LEFT;
const CHART_TOP: number = LAB_SCREEN_VIEW_SETTINGS.CHART_TOP;
const CHART_WIDTH: number = LAB_SCREEN_VIEW_SETTINGS.CHART_WIDTH;
const CHART_HEIGHT: number = LAB_SCREEN_VIEW_SETTINGS.CHART_HEIGHT;
const MIDDLE_PANEL_WIDTH: number = LAB_SCREEN_VIEW_SETTINGS.MIDDLE_PANEL_WIDTH;
const MIDDLE_LEFT: number = LAB_SCREEN_VIEW_SETTINGS.MIDDLE_LEFT;
const SIDE_CONTENT_WIDTH = SIDE_COLUMN_WIDTH - 24;
const MIDDLE_CONTENT_WIDTH = MIDDLE_PANEL_WIDTH - 24;

/** Drops fall at this speed (px/s); a flow above STREAM_FLOW (mL/s) is drawn as a stream. */
const DROP_SPEED: number = LAB_SCREEN_VIEW_SETTINGS.DROP_SPEED;
const STREAM_FLOW: number = LAB_SCREEN_VIEW_SETTINGS.STREAM_FLOW;
const MAX_NOTEBOOK_LINES: number = LAB_SCREEN_VIEW_SETTINGS.MAX_NOTEBOOK_LINES;
const MAX_WAITING_DROPS: number = LAB_SCREEN_VIEW_SETTINGS.MAX_WAITING_DROPS;

export class LabScreenView extends ScreenView {
  private readonly model: LabModel;
  private readonly dropLayer = new Node();
  private readonly stream: Line;
  private readonly flask: FlaskNode;
  private pendingDropVolume = 0;

  public constructor(model: LabModel, providedOptions: LabScreenViewOptions) {
    const options = optionize<LabScreenViewOptions, SelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new LabScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);
    this.model = model;

    const common = StringManager.getInstance().getCommonStrings();
    const strings = StringManager.getInstance().getLabStrings();
    const a11y = StringManager.getInstance().getLabA11yStrings();
    const listParent = new Node();

    // ── Glassware ───────────────────────────────────────────────────────────────
    const burette = new BuretteNode(model, options.showReadingProperty);
    burette.x = BURETTE_X;
    burette.y = BURETTE_Y;
    const tipX = BURETTE_X + TIP_POSITION.x;
    const tipY = BURETTE_Y + TIP_POSITION.y;

    this.flask = new FlaskNode(model);
    this.flask.x = tipX;
    this.flask.y = FLASK_TOP;
    const bench = new Rectangle(
      LAB_SCREEN_VIEW_SETTINGS.BENCH_X,
      FLASK_TOP + this.flask.height - 2,
      LAB_SCREEN_VIEW_SETTINGS.BENCH_WIDTH,
      LAB_SCREEN_VIEW_SETTINGS.BENCH_HEIGHT,
      {
        fill: TitrationLabColors.standColorProperty,
      },
    );

    this.stream = new Line(tipX, tipY, tipX, tipY, {
      stroke: TitrationLabColors.solutionColorProperty,
      lineWidth: LAB_SCREEN_VIEW_SETTINGS.STREAM_LINE_WIDTH,
      visible: false,
    });

    // ── pH meter and probe ──────────────────────────────────────────────────────
    const meter = new PHMeterNode(model.pHProperty, model.meterInFlaskProperty);
    meter.left = tipX + LAB_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_LEFT_OFFSET;
    meter.top = FLASK_TOP - LAB_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_TOP_OFFSET;
    const probe = new Node({
      cursor: "pointer",
      children: [
        new Rectangle(
          LAB_SCREEN_VIEW_SETTINGS.PROBE_X,
          0,
          LAB_SCREEN_VIEW_SETTINGS.PROBE_WIDTH,
          LAB_SCREEN_VIEW_SETTINGS.PROBE_HEIGHT,
          LAB_SCREEN_VIEW_SETTINGS.PROBE_CORNER_X,
          LAB_SCREEN_VIEW_SETTINGS.PROBE_CORNER_Y,
          { fill: TitrationLabColors.probeColorProperty },
        ),
        new Circle(LAB_SCREEN_VIEW_SETTINGS.PROBE_RADIUS, {
          fill: TitrationLabColors.probeColorProperty,
          y: LAB_SCREEN_VIEW_SETTINGS.PROBE_Y,
        }),
      ],
    });
    probe.addInputListener(new PressListener({ press: () => model.meterInFlaskProperty.toggle() }));
    const cable = new Path(null, {
      stroke: TitrationLabColors.probeColorProperty,
      lineWidth: LAB_SCREEN_VIEW_SETTINGS.CABLE_LINE_WIDTH,
    });
    model.meterInFlaskProperty.link((inFlask) => {
      if (inFlask) {
        probe.x = tipX + LAB_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_X_OFFSET;
        probe.y = FLASK_TOP - LAB_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_Y_OFFSET;
      } else {
        probe.x = meter.right + 12;
        probe.y = meter.bottom + 4;
      }
      const start = meter.localToParentPoint(meter.cableAnchor as never);
      cable.shape = new Shape()
        .moveTo(start.x, start.y)
        .cubicCurveTo(start.x, start.y + 40, probe.x, probe.y - 40, probe.x, probe.y);
    });
    const meterCheckbox = checkbox(
      model.meterInFlaskProperty,
      strings.pHMeterStringProperty,
      LAB_SCREEN_VIEW_SETTINGS.METER_IN_FLASK_CHECKBOX_MAX_WIDTH,
    );
    meterCheckbox.left = meter.left;
    meterCheckbox.top = meter.bottom + 10;

    // ── Chart ───────────────────────────────────────────────────────────────────
    const xTitleProperty = new DerivedProperty([model.setupProperty, common.volumeAxisPatternStringProperty], (setup) =>
      volumeAxisTitle(setup.analyte),
    );
    const chart = new TitrationChartNode(CHART_WIDTH, CHART_HEIGHT, xTitleProperty, {
      title: common.titrationCurveStringProperty,
    });
    chart.x = CHART_LEFT;
    chart.y = CHART_TOP;
    const calculatedPlot = new LinePlot(chart.chartTransform, [], {
      stroke: TitrationLabColors.theoreticalCurveColorProperty,
      lineWidth: LAB_SCREEN_VIEW_SETTINGS.CALCULATED_PLOT_LINE_WIDTH,
      lineDash: [
        LAB_SCREEN_VIEW_SETTINGS.CALCULATED_PLOT_LINE_DASH_DASH,
        LAB_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_CALCULATED_PLOT_LINE_DASH_DASH,
      ],
    });
    const measuredPlot = new LinePlot(chart.chartTransform, [], {
      stroke: TitrationLabColors.curveColorProperty,
      lineWidth: LAB_SCREEN_VIEW_SETTINGS.MEASURED_PLOT_LINE_WIDTH,
    });
    chart.plotLayer.children = [calculatedPlot, measuredPlot];
    const equivalenceMarkers = new Node();
    chart.overlayLayer.addChild(equivalenceMarkers);
    const hint = new Text(strings.meterHintStringProperty, {
      font: SMALL_FONT,
      fill: TitrationLabColors.mutedTextColorProperty,
      maxWidth: CHART_WIDTH - LAB_SCREEN_VIEW_SETTINGS.HINT_MAX_WIDTH_OFFSET,
    });
    hint.boundsProperty.link(() => {
      hint.center = chart.localToParentPoint(
        chart.chartTransform.modelToViewXY(0, 0).plusXY(CHART_WIDTH / 2, -CHART_HEIGHT / 2),
      );
    });
    const hintVisibleProperty = new DerivedProperty([model.meterInFlaskProperty], (inFlask) => !inFlask);
    hintVisibleProperty.link((visible) => {
      hint.visible = visible && model.measuredPoints.length === 0;
    });

    const updateMeasured = (): void => {
      measuredPlot.setDataSet(model.measuredPoints.slice());
      hint.visible = !model.meterInFlaskProperty.value && model.measuredPoints.length === 0;
    };
    model.measuredPointsChangedEmitter.addListener(updateMeasured);

    // Redrawn when the setup changes, and when refills carry the titrant past the volume axis.
    let chartMaxVolume = 0;
    const updateChart = (): void => {
      const setup = model.setupProperty.value;
      const unknown = model.isUnknown;
      chartMaxVolume = model.chartMaxVolume();
      chart.setMaxVolume(chartMaxVolume);
      calculatedPlot.setDataSet(
        model.showCalculatedCurveProperty.value && !unknown ? sampleCurve(setup, chartMaxVolume, 240) : [],
      );
      disposeChildren(equivalenceMarkers);
      if (model.showEquivalenceProperty.value && !unknown) {
        for (const volume of equivalenceVolumes(setup)) {
          const x = chart.chartTransform.modelToViewX(volume);
          equivalenceMarkers.addChild(
            new Line(x, 0, x, CHART_HEIGHT, {
              stroke: TitrationLabColors.equivalenceColorProperty,
              lineDash: [
                LAB_SCREEN_VIEW_SETTINGS.UPDATE_CHART_LINE_DASH_DASH,
                LAB_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_UPDATE_CHART_LINE_DASH_DASH,
              ],
            }),
          );
        }
      }
      updateMeasured();
    };
    Multilink.multilink(
      [model.setupProperty, model.showCalculatedCurveProperty, model.showEquivalenceProperty, model.sampleProperty],
      updateChart,
    );
    model.titrantAddedProperty.lazyLink(() => {
      if (model.chartMaxVolume() !== chartMaxVolume) {
        updateChart();
      }
    });

    const unknownProperty = new DerivedProperty([model.sampleProperty], (sample) => sample === UNKNOWN);
    const knownProperty = new DerivedProperty([unknownProperty], (unknown) => !unknown);
    const calculatedCheckbox = checkbox(
      model.showCalculatedCurveProperty,
      strings.calculatedCurveStringProperty,
      LAB_SCREEN_VIEW_SETTINGS.SHOW_CALCULATED_CURVE_CHECKBOX_MAX_WIDTH,
    );
    const equivalenceCheckbox = checkbox(
      model.showEquivalenceProperty,
      strings.equivalencePointsStringProperty,
      LAB_SCREEN_VIEW_SETTINGS.SHOW_EQUIVALENCE_CHECKBOX_MAX_WIDTH,
    );
    knownProperty.link((known) => {
      calculatedCheckbox.enabled = known;
      equivalenceCheckbox.enabled = known;
    });
    const chartOptions = new HBox({
      spacing: LAB_SCREEN_VIEW_SETTINGS.CHART_OPTIONS_SPACING,
      children: [calculatedCheckbox, equivalenceCheckbox],
      left: MIDDLE_LEFT,
      top: CHART_TOP + CHART_HEIGHT + LAB_SCREEN_VIEW_SETTINGS.CHART_OPTIONS_TOP_OFFSET,
    });

    // ── Burette controls ────────────────────────────────────────────────────────
    const stopcockSlider = new HSlider(model.flowRateProperty, FLOW_RATE_RANGE, {
      ...TITRATION_LAB_SLIDER_OPTIONS,
      trackSize: new Dimension2(MIDDLE_CONTENT_WIDTH - 24, LAB_SCREEN_VIEW_SETTINGS.STOPCOCK_SLIDER_HEIGHT),
      keyboardStep: LAB_SCREEN_VIEW_SETTINGS.STOPCOCK_SLIDER_KEYBOARD_STEP,
      shiftKeyboardStep: LAB_SCREEN_VIEW_SETTINGS.STOPCOCK_SLIDER_SHIFT_KEYBOARD_STEP,
      pageKeyboardStep: LAB_SCREEN_VIEW_SETTINGS.STOPCOCK_SLIDER_PAGE_KEYBOARD_STEP,
      accessibleName: strings.stopcockStringProperty,
    });
    stopcockSlider.addMajorTick(
      FLOW_RATE_RANGE.min,
      label(strings.closedStringProperty, LAB_SCREEN_VIEW_SETTINGS.CLOSED_LABEL_MAX_WIDTH),
    );
    stopcockSlider.addMajorTick(
      FLOW_RATE_RANGE.max,
      label(strings.openStringProperty, LAB_SCREEN_VIEW_SETTINGS.OPEN_LABEL_MAX_WIDTH),
    );
    const addDropButton = pushButton(strings.addDropStringProperty, () => this.addDrop(DROP_VOLUME));
    const addHalfDropButton = pushButton(strings.addHalfDropStringProperty, () => this.addDrop(HALF_DROP_VOLUME));
    const refillButton = pushButton(strings.refillStringProperty, () => {
      model.refill();
      this.addAccessibleResponse(
        StringUtils.fillIn(a11y.responses.refilledPatternStringProperty.value, {
          value: formatVolume(model.buretteReadingProperty.value),
        }),
      );
    });
    const newFlaskButton = pushButton(strings.newFlaskStringProperty, () => {
      model.newFlask();
      this.addAccessibleResponse(a11y.responses.newFlaskStringProperty.value);
    });
    const emptyText = new Text(strings.buretteEmptyStringProperty, {
      font: SMALL_FONT,
      fill: TitrationLabColors.poorColorProperty,
      maxWidth: MIDDLE_CONTENT_WIDTH,
      visibleProperty: model.buretteEmptyProperty,
    });
    model.buretteEmptyProperty.lazyLink((empty) => {
      if (empty) {
        this.addAccessibleResponse(a11y.responses.buretteEmptyStringProperty.value);
      }
    });
    const burettePanel = new TitrationLabPanel(
      new VBox({
        align: "left",
        spacing: LAB_SCREEN_VIEW_SETTINGS.BURETTE_PANEL_SPACING,
        children: [
          heading(strings.buretteHeadingStringProperty, MIDDLE_CONTENT_WIDTH),
          label(strings.stopcockStringProperty, MIDDLE_CONTENT_WIDTH),
          new Node({ children: [stopcockSlider], x: LAB_SCREEN_VIEW_SETTINGS.BURETTE_PANEL_X }),
          addDropButton,
          addHalfDropButton,
          refillButton,
          newFlaskButton,
          emptyText,
        ],
      }),
      { minWidth: MIDDLE_PANEL_WIDTH, maxWidth: MIDDLE_PANEL_WIDTH },
    );
    burettePanel.left = MIDDLE_LEFT;
    burettePanel.top = chartOptions.bottom + 12;

    // ── Notebook ────────────────────────────────────────────────────────────────
    const recordButton = pushButton(strings.recordReadingStringProperty, () => {
      const reading = model.recordReading();
      this.addAccessibleResponse(
        StringUtils.fillIn(a11y.responses.recordedPatternStringProperty.value, {
          index: model.readings.length,
          value: formatVolume(reading),
        }),
      );
    });
    const readingsBox = new VBox({ align: "left", spacing: LAB_SCREEN_VIEW_SETTINGS.READINGS_BOX_SPACING });
    const updateReadings = (): void => {
      disposeChildren(readingsBox);
      const readings = model.readings;
      const first = Math.max(0, readings.length - MAX_NOTEBOOK_LINES);
      const lines: Node[] =
        readings.length === 0
          ? [
              new Text(strings.noReadingsStringProperty, {
                font: SMALL_FONT,
                fill: TitrationLabColors.mutedTextColorProperty,
                maxWidth: MIDDLE_CONTENT_WIDTH,
              }),
            ]
          : readings.slice(first).map(
              (reading, i) =>
                new Text(
                  StringUtils.fillIn(strings.readingPatternStringProperty.value, {
                    index: first + i + 1,
                    value: formatVolume(reading),
                  }),
                  { font: SMALL_FONT, fill: TitrationLabColors.textColorProperty, maxWidth: MIDDLE_CONTENT_WIDTH },
                ),
            );
      readingsBox.children = lines;
    };
    model.readings.addItemAddedListener(updateReadings);
    model.readings.addItemRemovedListener(updateReadings);
    strings.readingPatternStringProperty.lazyLink(updateReadings);
    updateReadings();

    const answerPicker = new NumberPicker(model.answerProperty, new Property(ANSWER_RANGE), {
      decimalPlaces: LAB_SCREEN_VIEW_SETTINGS.ANSWER_PICKER_DECIMAL_PLACES,
      incrementFunction: (value) =>
        Number(fixed(value + 0.001, LAB_SCREEN_VIEW_SETTINGS.ANSWER_PICKER_DECIMALS).replace("−", "-")),
      decrementFunction: (value) =>
        Number(fixed(value - 0.001, LAB_SCREEN_VIEW_SETTINGS.ANSWER_PICKER_DECIMALS).replace("−", "-")),
      font: new PhetFont(FONT_SIZE.label),
      color: TitrationLabColors.accentColorProperty,
      accessibleName: a11y.controls.answerStringProperty,
    });
    const molarUnit = new Text("M", { font: CONTROL_FONT, fill: TitrationLabColors.textColorProperty });
    const checkButton = pushButton(strings.checkStringProperty, () => {
      model.checkAnswer();
      this.addAccessibleResponse(resultText.string);
    });
    const newUnknownButton = pushButton(strings.newUnknownStringProperty, () => model.newUnknown());
    const resultText = new Text("", { font: SMALL_FONT, maxWidth: MIDDLE_CONTENT_WIDTH });
    Multilink.multilinkAny(
      [
        model.answerResultProperty,
        model.unknownProperty,
        strings.results.correctStringProperty,
        strings.results.tooHighStringProperty,
      ],
      () => {
        const result = model.answerResultProperty.value;
        const results = strings.results;
        const pattern =
          result === "correct"
            ? results.correctStringProperty
            : result === "tooHigh"
              ? results.tooHighStringProperty
              : result === "tooLow"
                ? results.tooLowStringProperty
                : results.noneStringProperty;
        resultText.string = StringUtils.fillIn(pattern.value, {
          value: fixed(
            model.unknownProperty.value.concentration,
            LAB_SCREEN_VIEW_SETTINGS.CONCENTRATION_FIXED_DECIMALS,
          ),
        });
        resultText.fill =
          result === "correct" ? TitrationLabColors.goodColorProperty : TitrationLabColors.poorColorProperty;
      },
    );
    model.answerProperty.lazyLink(() => {
      model.answerResultProperty.value = "none";
    });
    const unknownBox = new VBox({
      align: "left",
      spacing: LAB_SCREEN_VIEW_SETTINGS.UNKNOWN_BOX_SPACING,
      visibleProperty: unknownProperty,
      children: [
        heading(strings.unknownHeadingStringProperty, MIDDLE_CONTENT_WIDTH),
        new HBox({ spacing: LAB_SCREEN_VIEW_SETTINGS.UNKNOWN_BOX_SPACING, children: [answerPicker, molarUnit] }),
        new HBox({ spacing: LAB_SCREEN_VIEW_SETTINGS.UNKNOWN_BOX_SPACING, children: [checkButton, newUnknownButton] }),
        resultText,
      ],
    });
    const notebookPanel = new TitrationLabPanel(
      new VBox({
        align: "left",
        spacing: LAB_SCREEN_VIEW_SETTINGS.NOTEBOOK_PANEL_SPACING,
        children: [
          heading(strings.notebookHeadingStringProperty, MIDDLE_CONTENT_WIDTH),
          recordButton,
          readingsBox,
          unknownBox,
        ],
      }),
      { minWidth: MIDDLE_PANEL_WIDTH, maxWidth: MIDDLE_PANEL_WIDTH },
    );
    notebookPanel.left = burettePanel.right + PANEL_SPACING;
    notebookPanel.top = burettePanel.top;

    // ── Sample and indicator controls ──────────────────────────────────────────
    const sampleChoices: ComboChoice<LabSample>[] = [
      ...ANALYTES.map((analyte: Analyte) => ({
        value: analyte as LabSample,
        label: analyteNameProperty(analyte.id),
        display: analyteLabelProperty(analyte),
      })),
      { value: UNKNOWN, label: analyteNameProperty("unknownAcid") },
    ];
    const sampleCombo = comboBox(
      model.sampleProperty,
      sampleChoices,
      listParent,
      a11y.controls.sampleStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    const indicatorChoices: ComboChoice<Indicator | null>[] = [
      { value: null, label: common.noneStringProperty },
      ...INDICATORS.map((indicator) => ({
        value: indicator as Indicator | null,
        label: indicatorNameProperty(indicator.id),
      })),
    ];
    const indicatorCombo = comboBox(
      model.indicatorProperty,
      indicatorChoices,
      listParent,
      a11y.controls.indicatorStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    const molarPattern = common.molarPatternStringProperty;
    const concentrationControl = numberControl(
      common.analyteConcentrationStringProperty,
      model.analyteConcentrationProperty,
      ANALYTE_CONCENTRATION_RANGE,
      {
        delta: CONCENTRATION_STEP,
        decimalPlaces: LAB_SCREEN_VIEW_SETTINGS.CONCENTRATION_CONTROL_DECIMAL_PLACES,
        valuePattern: molarPattern,
      },
      SIDE_CONTENT_WIDTH,
    );
    knownProperty.link((known) => {
      concentrationControl.visible = known;
    });
    const titrantConcentrationControl = numberControl(
      common.titrantConcentrationStringProperty,
      model.titrantConcentrationProperty,
      TITRANT_CONCENTRATION_RANGE,
      {
        delta: CONCENTRATION_STEP,
        decimalPlaces: LAB_SCREEN_VIEW_SETTINGS.TITRANT_CONCENTRATION_CONTROL_DECIMAL_PLACES,
        valuePattern: molarPattern,
      },
      SIDE_CONTENT_WIDTH,
    );
    const volumeRadio = radioGroup(
      model.analyteVolumeProperty,
      ANALYTE_VOLUMES.map((volume) => ({
        value: volume as number,
        label: new PatternStringProperty(common.millilitresPatternStringProperty, { value: formatVolume(volume) }),
      })),
      a11y.controls.analyteVolumeStringProperty,
      LAB_SCREEN_VIEW_SETTINGS.ANALYTE_VOLUME_RADIO_GROUP_MAX_WIDTH,
      "horizontal",
    );
    const titrantText = new RichText("", {
      font: CONTROL_FONT,
      fill: TitrationLabColors.textColorProperty,
      maxWidth: SIDE_CONTENT_WIDTH,
    });
    Multilink.multilink([model.setupProperty, common.titrantPatternStringProperty], (setup, pattern) => {
      titrantText.string = StringUtils.fillIn(pattern, { formula: titrantFormula(setup.analyte.titrant) });
    });
    const sidePanel = new TitrationLabPanel(
      new VBox({
        align: "left",
        spacing: LAB_SCREEN_VIEW_SETTINGS.SIDE_PANEL_SPACING,
        children: [
          heading(strings.flaskHeadingStringProperty, SIDE_CONTENT_WIDTH),
          labeled(common.analyteStringProperty, sampleCombo, SIDE_CONTENT_WIDTH),
          concentrationControl,
          labeled(strings.analyteVolumeStringProperty, volumeRadio, SIDE_CONTENT_WIDTH),
          labeled(common.indicatorStringProperty, indicatorCombo, SIDE_CONTENT_WIDTH),
          heading(strings.buretteHeadingStringProperty, SIDE_CONTENT_WIDTH),
          titrantText,
          titrantConcentrationControl,
        ],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );
    sidePanel.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    sidePanel.top = SCREEN_VIEW_MARGIN;

    // ── Reset All ──────────────────────────────────────────────────────────────
    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });

    // ── Announcements ──────────────────────────────────────────────────────────
    let lastColorKey = "";
    Multilink.multilink([model.pHProperty, model.indicatorProperty], (pH, indicator) => {
      const key = indicator ? JSON.stringify(perceivedColor(indicator, pH)) : "";
      if (indicator && key !== lastColorKey && lastColorKey !== "" && model.titrantAddedProperty.value > 0) {
        const perceived = perceivedColor(indicator, pH);
        const pattern = perceived.partial
          ? a11y.responses.faintColorPatternStringProperty
          : a11y.responses.colorPatternStringProperty;
        this.addAccessibleResponse(StringUtils.fillIn(pattern.value, { color: colorName(perceived.color) }));
      }
      lastColorKey = key;
    });

    // ── Keyboard: D adds a drop, Shift+D half a drop ───────────────────────────
    KeyboardListener.createGlobal(this, {
      keyStringProperties: [
        ...TitrationLabHotkeyData.ADD_DROP.keyStringProperties,
        ...TitrationLabHotkeyData.ADD_HALF_DROP.keyStringProperties,
      ],
      fire: (_event, keysPressed) => this.addDrop(keysPressed.startsWith("shift") ? HALF_DROP_VOLUME : DROP_VOLUME),
    });

    // Lives as long as the screen.
    model.titrantAddedProperty.lazyLink((added, previous) => {
      if (added > previous) {
        this.pendingDropVolume += added - previous;
      }
    });

    this.children = [
      bench,
      cable,
      burette,
      this.stream,
      this.dropLayer,
      this.flask,
      probe,
      meter,
      meterCheckbox,
      chart,
      hint,
      chartOptions,
      burettePanel,
      notebookPanel,
      sidePanel,
      resetAllButton,
      listParent,
    ];
    this.pdomPlayAreaNode.pdomOrder = [
      stopcockSlider,
      addDropButton,
      addHalfDropButton,
      refillButton,
      newFlaskButton,
      meterCheckbox,
      recordButton,
      unknownBox,
    ];
    this.pdomControlAreaNode.pdomOrder = [sidePanel, chartOptions, resetAllButton];
  }

  /** Adds a drop or half drop and announces a flash that will fade. */
  private addDrop(volume: number): void {
    const model = this.model;
    model.flowRateProperty.value = 0;
    if (model.dispense(volume) === 0) {
      return;
    }
    const indicator = model.indicatorProperty.value;
    if (!indicator) {
      return;
    }
    const local = perceivedColor(indicator, model.localPHProperty.value);
    const bulk = perceivedColor(indicator, model.pHProperty.value);
    if (local.color !== bulk.color) {
      const a11y = StringManager.getInstance().getLabA11yStrings();
      this.addAccessibleResponse(
        StringUtils.fillIn(a11y.responses.flashPatternStringProperty.value, { color: colorName(local.color) }),
      );
    }
  }

  public reset(): void {
    this.pendingDropVolume = 0;
    disposeChildren(this.dropLayer);
  }

  public override step(dt: number): void {
    const tipX = BURETTE_X + TIP_POSITION.x;
    const tipY = BURETTE_Y + TIP_POSITION.y;
    const surfaceY = this.flask.y + this.flask.liquidTopY;
    const streaming = this.model.flowRateProperty.value >= STREAM_FLOW;
    this.stream.visible = streaming;
    if (streaming) {
      this.stream.setLine(tipX, tipY, tipX, surfaceY);
      this.pendingDropVolume = 0;
    } else {
      // At most one drop leaves the tip per frame, and no more than a few wait: a run of drops
      // added at once falls as a short train rather than a column.
      this.pendingDropVolume = Math.min(this.pendingDropVolume, MAX_WAITING_DROPS * DROP_VOLUME);
      if (this.pendingDropVolume > 1e-9) {
        const size = Math.min(this.pendingDropVolume, DROP_VOLUME);
        this.pendingDropVolume -= size;
        this.dropLayer.addChild(
          new Circle(size >= DROP_VOLUME - 1e-9 ? 3 : 2, {
            fill: TitrationLabColors.solutionColorProperty,
            stroke: TitrationLabColors.glassColorProperty,
            lineWidth: LAB_SCREEN_VIEW_SETTINGS.STEP_LINE_WIDTH,
            x: tipX,
            y: tipY + 2,
          }),
        );
      }
    }
    for (const drop of this.dropLayer.children.slice()) {
      drop.y += DROP_SPEED * dt;
      if (drop.y >= surfaceY) {
        this.dropLayer.removeChild(drop);
        drop.dispose();
      }
    }
  }
}
