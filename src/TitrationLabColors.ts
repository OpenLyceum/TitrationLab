/**
 * TitrationLabColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import TitrationLabColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import TitrationLabColors from "../../TitrationLabColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: TitrationLabColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the TitrationLabColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import TitrationLabNamespace from "./TitrationLabNamespace.js";

const TitrationLabColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(TitrationLabNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(TitrationLabNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(TitrationLabNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(TitrationLabNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(TitrationLabNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(TitrationLabNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(TitrationLabNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(TitrationLabNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),
  // ── Sim-specific ─────────────────────────────────────────────────────────────

  /** Secondary text: axis titles, hints, legends. */
  mutedTextColorProperty: new ProfileColorProperty(TitrationLabNamespace, "mutedText", {
    default: "#a0a8c0",
    projector: "#555555",
  }),

  /** Chart plotting area. */
  chartBackgroundColorProperty: new ProfileColorProperty(TitrationLabNamespace, "chartBackground", {
    default: "#10182e",
    projector: "#ffffff",
  }),

  /** Chart frame and tick marks. */
  chartAxisColorProperty: new ProfileColorProperty(TitrationLabNamespace, "chartAxis", {
    default: "#8890a8",
    projector: "#555555",
  }),

  /** Chart grid lines. */
  chartGridColorProperty: new ProfileColorProperty(TitrationLabNamespace, "chartGrid", {
    default: "#26304d",
    projector: "#e3e3e3",
  }),

  /** Measured or selected titration curve. */
  curveColorProperty: new ProfileColorProperty(TitrationLabNamespace, "curve", {
    default: "#ff9e57",
    projector: "#c2410c",
  }),

  /** Calculated curve behind the measured points (Lab). */
  theoreticalCurveColorProperty: new ProfileColorProperty(TitrationLabNamespace, "theoreticalCurve", {
    default: "#7f8aa8",
    projector: "#8a8a8a",
  }),

  /** Second curve for comparison (Curves). */
  compareCurveColorProperty: new ProfileColorProperty(TitrationLabNamespace, "compareCurve", {
    default: "#4fc3f7",
    projector: "#0057b8",
  }),

  /** Equivalence-point markers. */
  equivalenceColorProperty: new ProfileColorProperty(TitrationLabNamespace, "equivalence", {
    default: "#ff6b9a",
    projector: "#c2185b",
  }),

  /** Half-equivalence markers (pH = pKa). */
  halfEquivalenceColorProperty: new ProfileColorProperty(TitrationLabNamespace, "halfEquivalence", {
    default: "#8bd17c",
    projector: "#2e7d32",
  }),

  /** Shaded buffer region. */
  bufferRegionColorProperty: new ProfileColorProperty(TitrationLabNamespace, "bufferRegion", {
    default: "rgba(139,209,124,0.14)",
    projector: "rgba(46,125,50,0.10)",
  }),

  /** Volume cursor on the Curves screen. */
  cursorColorProperty: new ProfileColorProperty(TitrationLabNamespace, "cursor", {
    default: "#ffeb3b",
    projector: "#7b1fa2",
  }),

  /** Species fractions, from most protonated (0) to least (3). */
  species0ColorProperty: new ProfileColorProperty(TitrationLabNamespace, "species0", {
    default: "#ff9e57",
    projector: "#c2410c",
  }),

  /** Second species. */
  species1ColorProperty: new ProfileColorProperty(TitrationLabNamespace, "species1", {
    default: "#4fc3f7",
    projector: "#0057b8",
  }),

  /** Third species. */
  species2ColorProperty: new ProfileColorProperty(TitrationLabNamespace, "species2", {
    default: "#8bd17c",
    projector: "#2e7d32",
  }),

  /** Fourth species. */
  species3ColorProperty: new ProfileColorProperty(TitrationLabNamespace, "species3", {
    default: "#d59cff",
    projector: "#7b1fa2",
  }),

  /** Spectator-ion bars (Na⁺, Cl⁻). */
  spectatorColorProperty: new ProfileColorProperty(TitrationLabNamespace, "spectator", {
    default: "#8890a8",
    projector: "#888888",
  }),

  /** Glassware outline and graduations. */
  glassColorProperty: new ProfileColorProperty(TitrationLabNamespace, "glass", {
    default: "#c8d6e5",
    projector: "#5a6b7d",
  }),

  /** Empty glass. */
  glassFillColorProperty: new ProfileColorProperty(TitrationLabNamespace, "glassFill", {
    default: "rgba(200,214,229,0.10)",
    projector: "rgba(90,107,125,0.08)",
  }),

  /** Colourless solution (water, titrant, flask with no indicator). */
  solutionColorProperty: new ProfileColorProperty(TitrationLabNamespace, "solution", {
    default: "#e9f3fb",
    projector: "#e3eef8",
  }),

  /** Retort stand and clamp. */
  standColorProperty: new ProfileColorProperty(TitrationLabNamespace, "stand", {
    default: "#5a6378",
    projector: "#9aa3b5",
  }),

  /** Burette stopcock handle. */
  stopcockColorProperty: new ProfileColorProperty(TitrationLabNamespace, "stopcock", {
    default: "#e57373",
    projector: "#c62828",
  }),

  /** pH meter case. */
  meterBodyColorProperty: new ProfileColorProperty(TitrationLabNamespace, "meterBody", {
    default: "#2c3550",
    projector: "#dfe4ec",
  }),

  /** pH meter display (always light, so its text is dark). */
  meterScreenColorProperty: new ProfileColorProperty(TitrationLabNamespace, "meterScreen", {
    default: "#b8e6c4",
    projector: "#b8e6c4",
  }),

  /** pH meter digits. */
  meterTextColorProperty: new ProfileColorProperty(TitrationLabNamespace, "meterText", {
    default: "#10241a",
    projector: "#10241a",
  }),

  /** pH probe and its cable. */
  probeColorProperty: new ProfileColorProperty(TitrationLabNamespace, "probe", {
    default: "#9aa3b5",
    projector: "#5a6378",
  }),

  /** Good indicator choice / correct answer. */
  goodColorProperty: new ProfileColorProperty(TitrationLabNamespace, "good", {
    default: "#8bd17c",
    projector: "#2e7d32",
  }),

  /** Poor indicator choice / wrong answer. */
  poorColorProperty: new ProfileColorProperty(TitrationLabNamespace, "poor", {
    default: "#ff8a80",
    projector: "#c62828",
  }),

  // ── Indicator forms ─────────────────────────────────────────────────────────
  // Colour each form shows at the sim's reference indicator strength; the view mixes them by
  // Beer–Lambert transmission (see common/view/indicatorColor.ts). Chemical, so the same in both
  // profiles.

  /** Colourless form (phenolphthalein in acid). */
  indicatorColorlessColorProperty: new ProfileColorProperty(TitrationLabNamespace, "indicatorColorless", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Pink form (phenolphthalein in base). */
  indicatorPinkColorProperty: new ProfileColorProperty(TitrationLabNamespace, "indicatorPink", {
    default: "#e0218a",
    projector: "#e0218a",
  }),

  /** Red form (methyl orange, methyl red, thymol blue in strong acid). */
  indicatorRedColorProperty: new ProfileColorProperty(TitrationLabNamespace, "indicatorRed", {
    default: "#d7262b",
    projector: "#d7262b",
  }),

  /** Yellow form. */
  indicatorYellowColorProperty: new ProfileColorProperty(TitrationLabNamespace, "indicatorYellow", {
    default: "#f2c80f",
    projector: "#f2c80f",
  }),

  /** Blue form (bromothymol blue, bromocresol green, thymol blue in base). */
  indicatorBlueColorProperty: new ProfileColorProperty(TitrationLabNamespace, "indicatorBlue", {
    default: "#1f5fd0",
    projector: "#1f5fd0",
  }),
};

export default TitrationLabColors;
