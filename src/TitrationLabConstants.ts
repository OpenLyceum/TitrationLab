/**
 * TitrationLabConstants.ts
 *
 * Every named numeric constant of the sim. Chemistry quantities use the units a student reads in
 * the lab rather than SI: volumes in mL, concentrations in mol/L (M), amounts in mol. Layout and
 * chrome values are in screen pixels. Colours live in TitrationLabColors.ts.
 */

import { Range } from "scenerystack/dot";
import TitrationLabNamespace from "./TitrationLabNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Vertical gap between stacked panels. */
export const PANEL_SPACING = 10;

/** Width of the right-hand control column on every screen. */
export const SIDE_COLUMN_WIDTH = 236;

/** Font sizes (px). */
export const FONT_SIZE = {
  tiny: 11,
  small: 12,
  control: 13,
  label: 14,
  readout: 16,
} as const;

// ── Water ─────────────────────────────────────────────────────────────────────

/** Ion product of water at 25 °C. */
export const KW = 1.0e-14;

/** pKw at 25 °C. */
export const PKW = 14;

/** pH bracket searched by the charge-balance solver (wide enough for 1 M strong acid or base). */
export const SOLVER_PH_RANGE = new Range(-2, 16);

/** Bisection steps of the solver: 18 pH units / 2⁵⁰ is far below any displayed digit. */
export const SOLVER_ITERATIONS = 50;

/** pH axis shown on every chart. */
export const PH_RANGE = new Range(0, 14);

// ── Glassware (mL) ────────────────────────────────────────────────────────────

/** Burette capacity: graduated from 0.00 (top) to 50.00 mL. */
export const BURETTE_CAPACITY = 50;

/** A filled burette starts somewhere in this range, so the volume is always a difference. */
export const START_READING_RANGE = new Range(0, 1.5);

/** Volume of one drop from the burette tip. */
export const DROP_VOLUME = 0.05;

/** A half drop, touched off the tip with the wash bottle. */
export const HALF_DROP_VOLUME = 0.025;

/** Stopcock range: fully open delivers this many mL per second. */
export const FLOW_RATE_RANGE = new Range(0, 1);

/** Readings are taken to 0.01 mL. */
export const READING_DECIMALS = 2;

/** Pipette volumes for the analyte. */
export const ANALYTE_VOLUMES = [10, 20, 25] as const;

/** Default analyte volume. */
export const DEFAULT_ANALYTE_VOLUME = 25;

// ── Concentrations (mol/L) ────────────────────────────────────────────────────

/** Default analyte and titrant concentration. */
export const DEFAULT_CONCENTRATION = 0.1;

/** Default analyte concentration of polyprotic analytes, so the second endpoint fits in one burette. */
export const DEFAULT_POLYPROTIC_CONCENTRATION = 0.05;

/** Analyte concentration control range. */
export const ANALYTE_CONCENTRATION_RANGE = new Range(0.001, 0.2);

/** Titrant concentration control range. */
export const TITRANT_CONCENTRATION_RANGE = new Range(0.05, 0.2);

/** Step of both concentration controls. */
export const CONCENTRATION_STEP = 0.001;

/** An unknown sample's concentration is drawn uniformly from this range. */
export const UNKNOWN_CONCENTRATION_RANGE = new Range(0.05, 0.15);

/** Range of the answer a student enters for the unknown. */
export const ANSWER_RANGE = new Range(0.01, 0.3);

/** An answer within this relative error of the true value is accepted. */
export const ANSWER_TOLERANCE = 0.015;

/** Custom weak acid pKa range (Curves screen). */
export const CUSTOM_PKA_RANGE = new Range(1, 12);

/** Default custom pKa. */
export const DEFAULT_CUSTOM_PKA = 5;

// ── Mixing and indicators ─────────────────────────────────────────────────────

/** Time constant (s) for freshly added titrant to mix into the flask. */
export const MIXING_TIME_CONSTANT = 0.8;

/** Volume (mL) of the region around the falling drop whose colour flashes. */
export const LOCAL_MIXING_VOLUME = 2;

/** Excess (mL) below which the local flash is no longer drawn. */
export const FLASH_THRESHOLD = 0.0005;

/** Indicator colour strength in the freshly pipetted flask (1 = the profile colour's own depth). */
export const INDICATOR_STRENGTH = 1.6;

/** Flask volume (mL) that fills the flask body to its shoulder. */
export const FLASK_BODY_VOLUME = 110;

/** Recorded pH points closer together than this (mL) are merged. */
export const RECORD_SPACING = 0.01;

/** Upper bound on recorded points per titration. */
export const MAX_RECORDED_POINTS = 6000;

/** Fraction of one equivalent used to label a half-equivalence point; never selects an endpoint equation. */
export const KEY_POINT_TOLERANCE = 0.01;

/** Roundoff tolerance (equivalents) for exact stoichiometric points in equation selection. */
export const STOICHIOMETRIC_TOLERANCE = 1e-10;

/** Indicator endpoint error (relative to V_eq) rated as good. */
export const GOOD_ENDPOINT_ERROR = 0.005;

/** Volume spanned by the colour change (relative to V_eq) rated as sharp. */
export const SHARP_CHANGE_SPAN = 0.03;

/** Settings for common/TitrationLabControlOptions.ts. */
export const TITRATION_LAB_CONTROL_OPTIONS_SETTINGS = {
  /** Slider thumb size width (px). */
  SLIDER_THUMB_SIZE_WIDTH: 12,
  /** Slider thumb size height (px). */
  SLIDER_THUMB_SIZE_HEIGHT: 22,
  /** Standalone slider track size width (px). */
  STANDALONE_SLIDER_TRACK_SIZE_WIDTH: 150,
  /** Standalone slider track size height (px). */
  STANDALONE_SLIDER_TRACK_SIZE_HEIGHT: 3,
  /** Number control slider track size width (px). */
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_WIDTH: 110,
  /** Number control slider track size height (px). */
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_HEIGHT: 3,
  /** Checkbox box width (px). */
  CHECKBOX_BOX_WIDTH: 16,
  /** Titration lab number control options scale (dimensionless). */
  TITRATION_LAB_NUMBER_CONTROL_OPTIONS_SCALE: 0.75,
  /** Titration lab number control options slider padding (px). */
  TITRATION_LAB_NUMBER_CONTROL_OPTIONS_SLIDER_PADDING: 4,
  /** Titration lab number control options arrow button spacing (px). */
  TITRATION_LAB_NUMBER_CONTROL_OPTIONS_ARROW_BUTTON_SPACING: 3,
  /** Titration lab number control options vertical spacing (px). */
  TITRATION_LAB_NUMBER_CONTROL_OPTIONS_VERTICAL_SPACING: 4,
  /** Titration lab checkbox options spacing (px). */
  TITRATION_LAB_CHECKBOX_OPTIONS_SPACING: 4,
} as const;

/** Settings for common/TitrationLabPanel.ts. */
export const TITRATION_LAB_PANEL_SETTINGS = {
  /** Options x margin (px). */
  OPTIONS_X_MARGIN: 12,
  /** Options y margin (px). */
  OPTIONS_Y_MARGIN: 10,
} as const;

/** Settings for common/TitrationLabScreenIcons.ts. */
export const TITRATION_LAB_SCREEN_ICONS_SETTINGS = {
  FLASK_SHAPE_Y_SEGMENT_2: 215, // px
  FLASK_SHAPE_Y_SEGMENT_3: 345, // px
  FLASK_SHAPE_Y_SEGMENT_4: 215, // px
  LIQUID_SHAPE_Y_SEGMENT_2: 342, // px
  CREATE_LAB_ICON_Y_SEGMENT_2: 118, // px
  CREATE_LAB_ICON_WIDTH_SEGMENT_2: 80, // px
  CREATE_LAB_ICON_HEIGHT_SEGMENT_2: 14, // px
  CREATE_LAB_ICON_Y_SEGMENT_3: 160, // px
  CREATE_CURVES_ICON_ITEM_3_LINE_WIDTH: 12, // px

  /** Glass line width (px). */
  GLASS_LINE_WIDTH: 6,
  /** Flask shape y (px). */
  FLASK_SHAPE_Y: 170,
  /** Liquid shape y (px). */
  LIQUID_SHAPE_Y: 290,
  /** Create lab icon y (px). */
  CREATE_LAB_ICON_Y: 10,
  /** Create lab icon width (px). */
  CREATE_LAB_ICON_WIDTH: 28,
  /** Create lab icon height (px). */
  CREATE_LAB_ICON_HEIGHT: 110,
  /** Create lab icon corner x (px). */
  CREATE_LAB_ICON_CORNER_X: 7,
  /** Create lab icon corner y (px). */
  CREATE_LAB_ICON_CORNER_Y: 7,
  /** Create lab icon radius (px). */
  CREATE_LAB_ICON_RADIUS: 9,
  /** Left (px). */
  LEFT: 70,
  /** Top (px). */
  TOP: 40,
  /** Create curves icon line width (px). */
  CREATE_CURVES_ICON_LINE_WIDTH: 5,
  /** Create curves icon radius (px). */
  CREATE_CURVES_ICON_RADIUS: 16,
  /** Tube width (px). */
  TUBE_WIDTH: 70,
  /** Tube y (px). */
  TUBE_Y: 300,
  /** Tube center y (px). */
  TUBE_CENTER_Y: 300,
  /** Create indicators icon line width (px). */
  CREATE_INDICATORS_ICON_LINE_WIDTH: 6,
} as const;

/** Settings for common/model/TitrationCurve.ts. */
export const TITRATION_CURVE_SETTINGS = {
  /** Extra sampling span on either side of an equivalence point, relative to its volume (dimensionless). */
  EQUIVALENCE_SAMPLING_HALF_WIDTH: 0.04,
  /** Additional samples on each side of equivalence (count). */
  EQUIVALENCE_SAMPLES_PER_SIDE: 40,
  /** Bisection iterations used to invert a titration curve (count). */
  PH_SEARCH_ITERATIONS: 50,
  /** Default count (count). */
  DEFAULT_COUNT: 300,
} as const;

/** Settings for common/view/ControlFactory.ts. */
export const CONTROL_FACTORY_SETTINGS = {
  ITEMS_MAX_WIDTH_OFFSET: 40, // px
  RADIO_GROUP_SPACING: 4, // px
  NUMBER_CONTROL_MAX_WIDTH_OFFSET: 70, // px

  /** Control font size (px). */
  CONTROL_FONT_SIZE: 13,
  /** Small font size (px). */
  SMALL_FONT_SIZE: 12,
  /** Heading font size (px). */
  HEADING_FONT_SIZE: 14,
  /** Combo box x margin (px). */
  COMBO_BOX_X_MARGIN: 8,
  /** Combo box y margin (px). */
  COMBO_BOX_Y_MARGIN: 3,
  /** Combo box corner radius (px). */
  COMBO_BOX_CORNER_RADIUS: 4,
  /** Labeled spacing (px). */
  LABELED_SPACING: 3,
  /** Push button x margin (px). */
  PUSH_BUTTON_X_MARGIN: 8,
  /** Push button y margin (px). */
  PUSH_BUTTON_Y_MARGIN: 4,
  /** Radio group radius (px). */
  RADIO_GROUP_RADIUS: 6,
} as const;

/** Settings for common/view/TitrationChartNode.ts. */
export const TITRATION_CHART_NODE_SETTINGS = {
  CONSTRUCTOR_TOP_OFFSET: 18, // px

  /** Ph tick (px). */
  PH_TICK: 2,
  /** Chart transform range max (control/model units). */
  CHART_TRANSFORM_RANGE_MAX: 50,
  /** Right right (px). */
  RIGHT_RIGHT: -28,
  /** Title bottom (px). */
  TITLE_BOTTOM: -8,
  /** Bottom bottom (px). */
  BOTTOM_BOTTOM: -8,
} as const;

/** Settings for common/view/indicatorColor.ts. */
export const INDICATOR_COLOR_SETTINGS = {
  /** Lowest transmission per channel, so no form is drawn pure black. */
  MIN_TRANSMISSION: 0.02,
} as const;

/** Settings for curves/model/CurvesModel.ts. */
export const CURVES_MODEL_SETTINGS = {
  /** Cursor resolution when stepping with the keyboard. */
  CURSOR_EPSILON: 1e-6,
  /** Cursor fraction default (dimensionless). */
  CURSOR_FRACTION_DEFAULT: 0.25,
} as const;

/** Settings for curves/view/CursorReadoutNode.ts. */
export const CURSOR_READOUT_NODE_SETTINGS = {
  BARS_DECIMALS: 2, // digits

  /** Label width (px). */
  LABEL_WIDTH: 66,
  /** Bar height (px). */
  BAR_HEIGHT: 9,
  /** Equations spacing (px). */
  EQUATIONS_SPACING: 2,
  /** Bars spacing (px). */
  BARS_SPACING: 3,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 5,
  /** Children spacing (px). */
  CHILDREN_SPACING: 4,
} as const;

/** Settings for curves/view/CurvesScreenView.ts. */
export const CURVES_SCREEN_VIEW_SETTINGS = {
  COMPARE_PLOT_LINE_DASH_DASH: 6, // px
  CONSTRUCTOR_COMPARE_PLOT_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_LINE_DASH_DASH: 3, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 8, // px
  CONSTRUCTOR_TOP_OFFSET: 38, // px
  OPTIONS_ROW_LEFT_OFFSET: 40, // px

  SHOW_SPECIES_CHECKBOX_MAX_WIDTH: 140, // px
  SHOW_BUFFER_CHECKBOX_MAX_WIDTH: 120, // px
  SHOW_KEY_POINTS_CHECKBOX_MAX_WIDTH: 110, // px

  /** Layout (px). */
  CHART_LEFT: 70,
  /** Chart top (px). */
  CHART_TOP: 40,
  /** Chart width (px). */
  CHART_WIDTH: 610,
  /** Chart height (px). */
  CHART_HEIGHT: 210,
  /** Species top (px). */
  SPECIES_TOP: 352,
  /** Species height (px). */
  SPECIES_HEIGHT: 140,
  /** Fraction of a step (in equivalents) shaded as buffer on each side: ratio 1:9 to 9:1. */
  BUFFER_EDGE: 0.1,
  /** Marker radius (px). */
  MARKER_RADIUS: 4.5,
  /** Compare plot line width (px). */
  COMPARE_PLOT_LINE_WIDTH: 2,
  /** Curve plot line width (px). */
  CURVE_PLOT_LINE_WIDTH: 2.5,
  /** Cursor line line width (px). */
  CURSOR_LINE_LINE_WIDTH: 1.5,
  /** Cursor dot radius (px). */
  CURSOR_DOT_RADIUS: 5,
  /** Legend spacing (px). */
  LEGEND_SPACING: 12,
  /** Legend entry spacing (px). */
  LEGEND_ENTRY_SPACING: 4,
  /** Legend entry end x (px). */
  LEGEND_ENTRY_END_X: 18,
  /** Legend entry line width (px). */
  LEGEND_ENTRY_LINE_WIDTH: 2.5,
  /** Cursor slider height (px). */
  CURSOR_SLIDER_HEIGHT: 3,
  /** Cursor slider keyboard step (control/model units). */
  CURSOR_SLIDER_KEYBOARD_STEP: 0.01,
  /** Cursor slider shift keyboard step (control/model units). */
  CURSOR_SLIDER_SHIFT_KEYBOARD_STEP: 0.002,
  /** Cursor slider page keyboard step (control/model units). */
  CURSOR_SLIDER_PAGE_KEYBOARD_STEP: 0.1,
  /** Options row spacing (px). */
  OPTIONS_ROW_SPACING: 14,
  /** P ka control delta (control/model units). */
  P_KA_CONTROL_DELTA: 0.1,
  /** Concentration control decimal places (digits). */
  CONCENTRATION_CONTROL_DECIMAL_PLACES: 3,
  /** Setup panel spacing (px). */
  SETUP_PANEL_SPACING: 8,
} as const;

/** Settings for curves/view/SpeciesChartNode.ts. */
export const SPECIES_CHART_NODE_SETTINGS = {
  NOTE_MAX_WIDTH_OFFSET: 20, // px

  /** Samples (count). */
  SAMPLES: 240,
  /** Plots line width (px). */
  PLOTS_LINE_WIDTH: 2,
  /** Cursor line width (px). */
  CURSOR_LINE_WIDTH: 1.5,
  /** Legend spacing (px). */
  LEGEND_SPACING: 12,
  /** Children spacing (px). */
  CHILDREN_SPACING: 4,
  /** Children end x (px). */
  CHILDREN_END_X: 14,
  /** Children line width (px). */
  CHILDREN_LINE_WIDTH: 3,
  /** Bottom bottom (px). */
  BOTTOM_BOTTOM: -6,
} as const;

/** Settings for indicators/model/IndicatorsModel.ts. */
export const INDICATORS_MODEL_SETTINGS = {
  /** Maximum volume relative to the last equivalence point (dimensionless). */
  AXIS_EQUIVALENCE_MULTIPLIER: 1.6,
  /** P h default (dimensionless). */
  P_H_DEFAULT: 7,
} as const;

/** Settings for indicators/view/ChooseIndicatorNode.ts. */
export const CHOOSE_INDICATOR_NODE_SETTINGS = {
  CELL_MAX_WIDTH_OFFSET: 6, // px
  NODES_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_NODES_LINE_DASH_DASH: 3, // px

  ROW_DECIMALS: 2, // digits
  FIXED_DECIMALS: 2, // digits

  /** Row height (px). */
  ROW_HEIGHT: 17,
  /** Band opacity (dimensionless). */
  BAND_OPACITY: 0.35,
  /** Curve line width (px). */
  CURVE_LINE_WIDTH: 2.5,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 34,
  /** Constructor radius (px). */
  CONSTRUCTOR_RADIUS: 5,
} as const;

/** Settings for indicators/view/ColorRangesNode.ts. */
export const COLOR_RANGES_NODE_SETTINGS = {
  NAME_MAX_WIDTH_OFFSET: 8, // px
  CONSTRUCTOR_TOP_OFFSET: 5, // px
  CONSTRUCTOR_RIGHT_OFFSET: 8, // px

  /** Name width (px). */
  NAME_WIDTH: 120,
  /** Row height (px). */
  ROW_HEIGHT: 13,
  /** Row spacing (px). */
  ROW_SPACING: 5,
  /** Ph step (px). */
  PH_STEP: 0.25,
  /** Top (px). */
  TOP: 22,
  /** Strip line width (px). */
  STRIP_LINE_WIDTH: 0.5,
  /** Cursor line width (px). */
  CURSOR_LINE_WIDTH: 2,
} as const;

/** Settings for indicators/view/IndicatorBreakdownNode.ts. */
export const INDICATOR_BREAKDOWN_NODE_SETTINGS = {
  CONSTRUCTOR_MAX_WIDTH_OFFSET: 20, // px

  ITEM_1_SPACING: 6, // px
  ITEM_2_SPACING: 6, // px

  /** Bar height (px). */
  BAR_HEIGHT: 20,
  /** Range lines spacing (px). */
  RANGE_LINES_SPACING: 2,
  /** Form lines spacing (px). */
  FORM_LINES_SPACING: 2,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 20,
  /** Children spacing (px). */
  CHILDREN_SPACING: 6,
  /** Children width (px). */
  CHILDREN_WIDTH: 10,
  /** Children height (px). */
  CHILDREN_HEIGHT: 10,
} as const;

/** Settings for indicators/view/IndicatorsScreenView.ts. */
export const INDICATORS_SCREEN_VIEW_SETTINGS = {
  CONSTRUCTOR_TOP_OFFSET: 8, // px
  CONSTRUCTOR_LEFT_OFFSET: 20, // px

  SLIDER_ROW_ITEM_1_SPACING: 12, // px
  SOLUTION_PH_HEADING_MAX_WIDTH: 200, // px
  INDICATOR_COMBO_BOX_MAX_WIDTH: 190, // px
  TITRATION_ANALYTE_COMBO_BOX_MAX_WIDTH: 240, // px

  /** Layout (px). */
  LEFT_WIDTH: 500,
  /** Right panel width (px). */
  RIGHT_PANEL_WIDTH: 420,
  /** Breakdown width (px). */
  BREAKDOWN_WIDTH: 220,
  /** P h slider height (px). */
  P_H_SLIDER_HEIGHT: 3,
  /** P h slider keyboard step (control/model units). */
  P_H_SLIDER_KEYBOARD_STEP: 0.5,
  /** P h slider shift keyboard step (control/model units). */
  P_H_SLIDER_SHIFT_KEYBOARD_STEP: 0.05,
  /** P h slider page keyboard step (control/model units). */
  P_H_SLIDER_PAGE_KEYBOARD_STEP: 2,
  /** Slider row spacing (px). */
  SLIDER_ROW_SPACING: 6,
  /** Choose panel spacing (px). */
  CHOOSE_PANEL_SPACING: 10,
  /** Choose panel x (px). */
  CHOOSE_PANEL_X: 40,
} as const;

/** Settings for indicators/view/TubeRackNode.ts. */
export const TUBE_RACK_NODE_SETTINGS = {
  OUTLINE_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_OUTLINE_LINE_DASH_DASH: 3, // px
  NAME_MAX_WIDTH_OFFSET: 6, // px
  CONSTRUCTOR_TOP_OFFSET: 6, // px

  /** Tube width (px). */
  TUBE_WIDTH: 30,
  /** Tube height (px). */
  TUBE_HEIGHT: 84,
  /** Liquid top (px). */
  LIQUID_TOP: 24,
  /** Glass line width (px). */
  GLASS_LINE_WIDTH: 1.5,
  /** Outline line width (px). */
  OUTLINE_LINE_WIDTH: 3,
} as const;

/** Settings for lab/view/BuretteNode.ts. */
export const BURETTE_NODE_SETTINGS = {
  CONSTRUCTOR_LINE_WIDTH: 0.6, // px
  CONSTRUCTOR_LEFT_OFFSET: 3, // px
  LENS_LEADER_LINE_DASH_DASH: 3, // px
  CONSTRUCTOR_DRAW_LENS_LINE_WIDTH: 1.5, // px
  DRAW_LENS_LEFT_OFFSET: 4, // px
  DRAW_LENS_CENTER_Y_FACTOR: 10, // dimensionless
  CONSTRUCTOR_TOP_OFFSET: 4, // px

  STAND_HEIGHT_SEGMENT_2: 6, // px
  STAND_Y_SEGMENT_2: 300, // px

  /** Tube scale and size (px). */
  PX_PER_ML: 7,
  /** Tube width (px). */
  TUBE_WIDTH: 14,
  /** Tube top (px). */
  TUBE_TOP: -14,
  /** Tip length (px). */
  TIP_LENGTH: 26,
  /** Magnifier geometry. */
  LENS_RADIUS: 44,
  /** Lens center x (px). */
  LENS_CENTER_X: -64,
  /** Zoom (px). */
  ZOOM: 9,
  /** Stand width (px). */
  STAND_WIDTH: 6,
  /** Stand height (px). */
  STAND_HEIGHT: 620,
  /** Stand y (px). */
  STAND_Y: 40,
  /** Meniscus line width (px). */
  MENISCUS_LINE_WIDTH: 1.2,
  /** Tube line width (px). */
  TUBE_LINE_WIDTH: 1.5,
  /** Tip shape x (px). */
  TIP_SHAPE_X: 2,
  /** Tip line width (px). */
  TIP_LINE_WIDTH: 1.2,
  /** Stem x (px). */
  STEM_X: 2,
  /** Barrel radius (px). */
  BARREL_RADIUS: 7,
  /** Barrel line width (px). */
  BARREL_LINE_WIDTH: 1.5,
  /** Handle x (px). */
  HANDLE_X: -22,
  /** Handle y (px). */
  HANDLE_Y: -3.5,
  /** Handle width (px). */
  HANDLE_WIDTH: 44,
  /** Handle height (px). */
  HANDLE_HEIGHT: 7,
  /** Handle corner x (px). */
  HANDLE_CORNER_X: 3,
  /** Handle corner y (px). */
  HANDLE_CORNER_Y: 3,
  /** Lens line width (px). */
  LENS_LINE_WIDTH: 3,
  /** Draw lens y (px). */
  DRAW_LENS_Y: -8,
  /** Draw lens control y (px). */
  DRAW_LENS_CONTROL_Y: 8,
  /** Draw lens end y (px). */
  DRAW_LENS_END_Y: -8,
  /** Draw lens line width (px). */
  DRAW_LENS_LINE_WIDTH: 2,
} as const;

/** Settings for lab/view/FlaskNode.ts. */
export const FLASK_NODE_SETTINGS = {
  CONSTRUCTOR_CENTER_Y_OFFSET: 8, // px

  /** Neck half width (px). */
  NECK_HALF_WIDTH: 17,
  /** Neck height (px). */
  NECK_HEIGHT: 28,
  /** Body height (px). */
  BODY_HEIGHT: 112,
  /** Base half width (px). */
  BASE_HALF_WIDTH: 74,
  /** Excess (mL) at which the flash is fully opaque. */
  FULL_FLASH_EXCESS: 0.03,
  /** Glass line width (px). */
  GLASS_LINE_WIDTH: 2,
  /** Flash radius x (px). */
  FLASH_RADIUS_X: 18,
  /** Flash radius y (px). */
  FLASH_RADIUS_Y: 6,
} as const;

/** Settings for lab/view/LabScreenView.ts. */
export const LAB_SCREEN_VIEW_SETTINGS = {
  CONSTRUCTOR_LEFT_OFFSET: 92, // px
  CONSTRUCTOR_TOP_OFFSET: 20, // px
  CONSTRUCTOR_X_OFFSET: 26, // px
  CONSTRUCTOR_Y_OFFSET: 34, // px
  CALCULATED_PLOT_LINE_DASH_DASH: 5, // px
  CONSTRUCTOR_CALCULATED_PLOT_LINE_DASH_DASH: 4, // px
  HINT_MAX_WIDTH_OFFSET: 20, // px
  UPDATE_CHART_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_UPDATE_CHART_LINE_DASH_DASH: 3, // px
  CHART_OPTIONS_TOP_OFFSET: 40, // px

  METER_IN_FLASK_CHECKBOX_MAX_WIDTH: 110, // px
  SHOW_CALCULATED_CURVE_CHECKBOX_MAX_WIDTH: 125, // px
  SHOW_EQUIVALENCE_CHECKBOX_MAX_WIDTH: 135, // px
  CLOSED_LABEL_MAX_WIDTH: 60, // px
  OPEN_LABEL_MAX_WIDTH: 60, // px
  ANSWER_PICKER_DECIMALS: 3, // digits
  CONCENTRATION_FIXED_DECIMALS: 4, // digits
  ANALYTE_VOLUME_RADIO_GROUP_MAX_WIDTH: 70, // px

  /** Layout (px). */
  BURETTE_X: 168,
  /** Burette y (px). */
  BURETTE_Y: 44,
  /** Flask top (px). */
  FLASK_TOP: 442,
  /** Chart left (px). */
  CHART_LEFT: 448,
  /** Chart top (px). */
  CHART_TOP: 44,
  /** Chart width (px). */
  CHART_WIDTH: 304,
  /** Chart height (px). */
  CHART_HEIGHT: 196,
  /** Middle panel width (px). */
  MIDDLE_PANEL_WIDTH: 172,
  /** Middle left (px). */
  MIDDLE_LEFT: 414,
  /** Drops fall at this speed (px/s); a flow above STREAM_FLOW (mL/s) is drawn as a stream. */
  DROP_SPEED: 420,
  /** Stream flow (px). */
  STREAM_FLOW: 0.35,
  /** Max notebook lines (px). */
  MAX_NOTEBOOK_LINES: 5,
  /** Max waiting drops (px). */
  MAX_WAITING_DROPS: 3,
  /** Bench x (px). */
  BENCH_X: 20,
  /** Bench width (px). */
  BENCH_WIDTH: 330,
  /** Bench height (px). */
  BENCH_HEIGHT: 6,
  /** Stream line width (px). */
  STREAM_LINE_WIDTH: 2.5,
  /** Probe x (px). */
  PROBE_X: -3,
  /** Probe width (px). */
  PROBE_WIDTH: 6,
  /** Probe height (px). */
  PROBE_HEIGHT: 92,
  /** Probe corner x (px). */
  PROBE_CORNER_X: 3,
  /** Probe corner y (px). */
  PROBE_CORNER_Y: 3,
  /** Probe radius (px). */
  PROBE_RADIUS: 5,
  /** Probe y (px). */
  PROBE_Y: 92,
  /** Cable line width (px). */
  CABLE_LINE_WIDTH: 2,
  /** Calculated plot line width (px). */
  CALCULATED_PLOT_LINE_WIDTH: 1.5,
  /** Measured plot line width (px). */
  MEASURED_PLOT_LINE_WIDTH: 2.5,
  /** Chart options spacing (px). */
  CHART_OPTIONS_SPACING: 12,
  /** Stopcock slider height (px). */
  STOPCOCK_SLIDER_HEIGHT: 3,
  /** Stopcock slider keyboard step (control/model units). */
  STOPCOCK_SLIDER_KEYBOARD_STEP: 0.1,
  /** Stopcock slider shift keyboard step (control/model units). */
  STOPCOCK_SLIDER_SHIFT_KEYBOARD_STEP: 0.02,
  /** Stopcock slider page keyboard step (control/model units). */
  STOPCOCK_SLIDER_PAGE_KEYBOARD_STEP: 0.5,
  /** Burette panel spacing (px). */
  BURETTE_PANEL_SPACING: 7,
  /** Burette panel x (px). */
  BURETTE_PANEL_X: 10,
  /** Readings box spacing (px). */
  READINGS_BOX_SPACING: 2,
  /** Answer picker decimal places (digits). */
  ANSWER_PICKER_DECIMAL_PLACES: 3,
  /** Unknown box spacing (px). */
  UNKNOWN_BOX_SPACING: 6,
  /** Notebook panel spacing (px). */
  NOTEBOOK_PANEL_SPACING: 7,
  /** Concentration control decimal places (digits). */
  CONCENTRATION_CONTROL_DECIMAL_PLACES: 3,
  /** Titrant concentration control decimal places (digits). */
  TITRANT_CONCENTRATION_CONTROL_DECIMAL_PLACES: 3,
  /** Side panel spacing (px). */
  SIDE_PANEL_SPACING: 8,
  /** Step line width (px). */
  STEP_LINE_WIDTH: 0.5,
} as const;

/** Settings for lab/view/PHMeterNode.ts. */
export const PH_METER_NODE_SETTINGS = {
  VALUE_MAX_WIDTH_OFFSET: 24, // px

  /** Width (px). */
  WIDTH: 92,
  /** Height (px). */
  HEIGHT: 56,
  /** Cable anchor x (px). */
  CABLE_ANCHOR_X: 14,
  /** Screen x (px). */
  SCREEN_X: 8,
  /** Screen y (px). */
  SCREEN_Y: 18,
  /** Screen corner x (px). */
  SCREEN_CORNER_X: 3,
  /** Screen corner y (px). */
  SCREEN_CORNER_Y: 3,
  /** Value font size (px). */
  VALUE_FONT_SIZE: 20,
  /** Children corner x (px). */
  CHILDREN_CORNER_X: 6,
  /** Children corner y (px). */
  CHILDREN_CORNER_Y: 6,
  /** Children left (px). */
  CHILDREN_LEFT: 8,
  /** Children top (px). */
  CHILDREN_TOP: 2,
} as const;

/** Settings for preferences/TitrationLabPreferencesNode.ts. */
export const TITRATION_LAB_PREFERENCES_NODE_SETTINGS = {
  /** Header font size (px). */
  HEADER_FONT_SIZE: 18,
  /** Show reading checkbox font size (px). */
  SHOW_READING_CHECKBOX_FONT_SIZE: 14,
  /** Show reading checkbox spacing (px). */
  SHOW_READING_CHECKBOX_SPACING: 8,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 12,
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const FORMAT_VALUES_SETTINGS = {
  FORMAT_PH_DECIMALS: 2, // digits
  FORMAT_VOLUME_DECIMALS: 2, // digits
} as const;

/** Settings for lab/model/LabModel.ts; units are documented per value. */
export const LAB_MODEL_NUMERICS = {
  /** Tolerance for detecting an empty burette (mL). */
  EMPTY_BURETTE_TOLERANCE: 1e-9,
  /** Tolerance for detecting a duplicate volume sample (mL). */
  REPEATED_VOLUME_TOLERANCE: 1e-12,
  /** Volume-axis headroom relative to the final equivalence point (dimensionless). */
  AXIS_HEADROOM_FACTOR: 1.5,
  /** Volume-axis upper limit rounding increment (mL). */
  AXIS_VOLUME_INCREMENT: 5,
  /** Minimum volume-axis upper limit (mL). */
  MIN_AXIS_VOLUME: 10,
  /** Decimal places used to select an unknown concentration (digits). */
  UNKNOWN_CONCENTRATION_DECIMALS: 4,
} as const;

TitrationLabNamespace.register("TitrationLabConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  KW,
  BURETTE_CAPACITY,
  DROP_VOLUME,
});
