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
  H₃PO₄ with NaOH; NaOH, NH₃, Na₂CO₃ with HCl. H₃PO₄'s third equivalence point is not shown.
  Polyprotic analytes default to 0.050 M so the last endpoint fits in one 50 mL burette.
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
| `src/common/model/Indicators.ts` | Indicator data; `perceivedColor` (the colour a student names) |
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
  between key points. The summary is live.
- Indicators: the pH slider and two menus; the endpoint table is also an accessible paragraph,
  one sentence per indicator. Tubes, colour strips and table rows are pointer shortcuts for the
  indicator menu.

## Compliance carve-outs

None: every colour is in `TitrationLabColors.ts`. Indicator form colours are profile colours too
(the same value in both profiles, since they are chemistry); solution colours are mixed from them
at runtime in `common/view/indicatorColor.ts`.

### Template-owned files (drift-checked)

Infrastructure files are owned by this template and must stay byte-identical in every sim
(after substituting the sim's own name). `Baton/scripts/check-template-drift.sh <Sim>` compares a
sim against this repo using `Baton/config/template-manifest.json`, which lists the exact files,
the required `package.json` scripts, and the few keys a sim may extend (extra `biome.json`
ignores, extra tsconfig `types`, CSP/Permissions additions).

To diverge on purpose, add a bullet to the sim's own `## Compliance carve-outs` section naming
the file in backticks and the reason, e.g. ``- `tests/setup.ts`: adds a WebGPU mock``. The drift
checker treats a file named there as approved. Fix template-owned files **here first**, then
propagate — never hand-edit one in a single sim.

### `package.json` overrides

JSON cannot carry comments, so the rationale for forced transitive pins lives here. Prefer
**tilde (`~`) or exact** versions — caret (`^`) lets minors drift under what is meant to be a
hard pin. Dependabot ignores these three names (see `.github/dependabot.yml`) so it does not
open PRs that fight the overrides. Revisit when SceneryStack drops or re-pins them upstream.

| Override | Pin | Why |
|---|---|---|
| `lodash` | `~4.18.1` | SceneryStack declares `~4.17.12`. Bump clears Dependabot/npm advisories patched in 4.18.x (e.g. GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh). |
| `three` | `~0.125.2` | SceneryStack declares `^0.104.0`. Floor is 0.125.0 for GHSA-fq6p-x6j3-cmmq (ReDoS). Staying on the 0.125 line avoids a larger API jump; **0.125.x still has open CVEs** (e.g. XSS GHSA-7vvq-7r29-5vg3, fixed only in ≥0.137.0). Remove this override if/when SceneryStack stops depending on `three` or pins a patched line itself. |
| `brace-expansion` | `~5.0.12` | Transitive via `vite-plugin-pwa` / Workbox. Clears npm audit (originally GHSA-mh99-v99m-4gvg; keep ≥5.0.9 for GHSA-rgw5-rvv9-x895; ≥5.0.12 for the CPU-DoS advisory). |

## Testing

| Path | Purpose |
|---|---|
| `tests/common/ChargeBalanceSolver.test.ts` | α fractions, strong/weak/dilute pH, charge balance zeroed, mixing |
| `tests/common/TitrationCurve.test.ts` | Textbook values (acetic acid 2.87 / 4.74 / 8.72 / 11.96, HCl 7.00, NH₃ 5.28, Na₂CO₃ 8.35 / 3.99), monotonic curves, regions and approximations, indicator endpoints |
| `tests/common/Indicators.test.ts` | Forms and ranges consistent; the colour a student would name |
| `tests/memory-leak.test.ts`, `tests/helpers/`, `tests/fuzz/` | Template-owned harness; the leak suite covers `TitrationChartNode` |

- Unit tests live only under root `tests/`, mirroring `src/`.
- Optional: `npm run test:fuzz` / `test:fuzz:quick` / `test:fuzz:long` (not part of default CI).

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
```

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run build:single` | Single-file build mode |
| `npm run check` | TypeScript (`tsc --noEmit` on app, scripts, and tests) |
| `npm run lint` / `npm run fix` | Biome check / auto-fix |
| `npm test` | Vitest unit tests |
| `npm run test:fuzz` | Playwright fuzz smoke (pointer + keyboard, `?ea`, 30s each; `npm run test:fuzz -- 90` to change) |
| `npm run test:fuzz:quick` | 10s fuzz |
| `npm run test:fuzz:long` | 300s fuzz |
| `npm run icons` | Regenerate PWA icons; seed missing screenshots, preserve existing ones |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |

`src/init.ts` reads `version` from `package.json`, so the patch bump shows up in the About dialog
without a second edit.

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
