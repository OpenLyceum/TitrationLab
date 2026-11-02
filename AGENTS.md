# AGENTS.md — Titration Lab

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Acid–base titration for **introductory (General) chemistry**, the acid–base equilibria chapter of
Gen Chem 2. It follows LightAndAtoms and PeriodicTrends in the Gen Chem sequence. Three screens:

| Screen | Folder | Content |
|---|---|---|
| Lab | `src/lab/` | Burette (random start reading, magnified meniscus), stopcock, drops and half drops, flask with indicator colour and a fading local flash, pH meter, measured curve, notebook of readings, unknown-acid challenge |
| Curves | `src/curves/` | Calculated curve with buffer shading, half-equivalence and equivalence markers, optional second curve; species fractions on the same axis; cursor readout with [H₃O⁺], [OH⁻], amounts and the textbook approximation |
| Indicators | `src/indicators/` | Every indicator at a chosen pH (tubes and colour strips), the selected indicator's forms, and a titration with every indicator's endpoint error rated good or poor |

Chemistry, data sources and assumptions: [`doc/model.md`](doc/model.md). Architecture and design
decisions: [`doc/implementation-notes.md`](doc/implementation-notes.md).

### Things to know first

- **One exact solver, no piecewise formulas.** Every pH comes from the charge balance in
  `common/model/ChargeBalanceSolver.ts` (bisection on pH). The textbook approximations in
  `TitrationCurve.regionAt` are only *displayed* next to the exact value ("Show equations"), so
  students see where Henderson–Hasselbalch and √(Ka C) hold and where they fail. Don't compute a
  displayed pH from an approximation.
- **Ka/Kb values are OpenStax Chemistry 2e's** (Appendices H and I), so answers match the
  textbook problems; the tests check textbook numbers. Changing a value means changing a test.
- **Monoprotic + polyprotic analytes** (the user's choice): HCl, CH₃COOH, HF, HClO, H₂C₂O₄,
  H₃PO₄ with NaOH; NaOH, NH₃, Na₂CO₃ with HCl. H₃PO₄'s third equivalence marker is not shown.
  Polyprotic analytes default to 0.050 M so the last endpoint fits in one 50 mL burette.
- **Equation selection uses actual stoichiometry.** `STOICHIOMETRIC_TOLERANCE` handles roundoff
  at whole equivalents; the wider `KEY_POINT_TOLERANCE` only labels half-equivalence. The number
  of displayed markers does not limit chemical capacity. Beyond H₃PO₄'s second marker the
  readout asks for the full charge balance including water, without a misleading simple approximation.
- **Measured curves keep acquiring.** When the 6000-point history fills, it is thinned while
  retaining its first and latest points, and sampling spacing doubles. New flask and reset restore
  the original spacing. Refills preserve the run's history.
- **Ideal, 25 °C, closed system.** No activities, no temperature, no CO₂ loss from carbonate.
- **The unknown is always a monoprotic acid** titrated with NaOH (HCl, CH₃COOH or HF, 0.05–0.15 M);
  the calculated curve and equivalence markers are disabled for it.
- **The endpoint is where the colour first changes**: the edge of the transition range the pH
  enters first (low edge when the pH rises), not pK_In. `bestEndpoint` and the Lab flash both use
  this.

## Key files

| File | Purpose |
|---|---|
| `src/TitrationLabConstants.ts` | Kw, glassware volumes, drop size, flow range, tolerances, layout sizes |
| `src/TitrationLabColors.ts` | All `ProfileColorProperty` instances, including the indicator form colours |
| `src/common/model/ChargeBalanceSolver.ts` | `alphaFractions`, `chargeImbalance`, `solvePH`, `mix` |
| `src/common/model/Analytes.ts` | Analyte data (pKa, protonated charge, start index, spectators) and titrant mixtures |
| `src/common/model/Indicators.ts` | Indicator data; `perceivedColor` (the colour a student names, including mid-transition mixes: green, orange) |
| `src/common/model/TitrationCurve.ts` | pH vs volume, equivalence and half-equivalence volumes, regions + approximations, `volumeAtPH`, `bestEndpoint` |
| `src/common/view/indicatorColor.ts` | Beer–Lambert mixing of form colours into a solution colour |
| `src/common/view/TitrationChartNode.ts` | Shared bamboo pH-vs-volume chart with underlay / plot / overlay layers |
| `src/common/view/formatValues.ts` | Names, regions, approximations and number formats |
| `src/common/view/ControlFactory.ts` | Themed control builders (copied from PeriodicTrends; combo items can show RichText formulas) |
| `src/common/TitrationLabHotkeyData.ts` | D / Shift+D (drops), K / Shift+K (key points) |
| `src/lab/model/LabModel.ts` | Burette, flow, dispensing, local mixing excess, measured points, notebook, unknown |
| `src/lab/view/BuretteNode.ts` / `FlaskNode.ts` / `PHMeterNode.ts` | Glassware and meter |
| `src/curves/model/CurvesModel.ts` | Setup, comparison, cursor as a fraction of the axis, key-point jumps |
| `src/curves/view/CursorReadoutNode.ts` / `SpeciesChartNode.ts` | Readout at the cursor; species fractions |
| `src/indicators/model/IndicatorsModel.ts` | pH, selected indicator, titration, endpoint ratings |
| `src/indicators/view/` | Tube rack, colour strips, form breakdown, choosing an indicator |

## Accessibility

- Lab: the stopcock is a slider; D adds a drop and Shift+D half a drop from anywhere on the
  screen. Colour changes ("turned faint pink"), flashes that will fade, notebook entries, refills,
  an empty burette and the Check result are announced. The live screen summary gives the sample,
  indicator, volume added, colour and (with the meter in) the pH.
- Curves: the cursor is a slider whose value text gives volume, pH and region; K / Shift+K jump
  between key points. The summary is live. Composed readouts and the slider's value text observe
  their localized string dependencies so a language change needs no cursor movement.
- Indicators: the pH slider and two menus; the endpoint table is also an accessible paragraph,
  one sentence per indicator. Tubes, colour strips and table rows are pointer shortcuts for the
  indicator menu.

## Compliance carve-outs

None: every colour is in `TitrationLabColors.ts`. Indicator form colours are profile colours too
(the same value in both profiles, since they are chemistry); solution colours are mixed from them
at runtime in `common/view/indicatorColor.ts`.

## Testing

| Path | Purpose |
|---|---|
| `tests/common/ChargeBalanceSolver.test.ts` | α fractions, strong/weak/dilute pH, charge balance zeroed, mixing |
| `tests/common/TitrationCurve.test.ts` | Textbook values (acetic acid 2.87 / 4.74 / 8.72 / 11.96, HCl 7.00, NH₃ 5.28, Na₂CO₃ 8.35 / 3.99), monotonic curves, regions and approximations, indicator endpoints |
| `tests/common/Indicators.test.ts` | Forms and ranges consistent; the colour a student would name |
| `tests/lab/LabModel.test.ts` | Lab chart axis covers endpoints past one burette and grows with refills |
| `tests/browser/review-regressions.spec.ts` | Native near-equivalence cursor movement, phosphoric-acid equation text in all locales, and live locale changes without moving the cursor |
| `tests/memory-leak.test.ts`, `tests/helpers/`, `tests/fuzz/` | Template-owned harness; the leak suite covers `TitrationChartNode` |

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
