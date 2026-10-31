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

TitrationLabNamespace.register("TitrationLabConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  KW,
  BURETTE_CAPACITY,
  DROP_VOLUME,
});
