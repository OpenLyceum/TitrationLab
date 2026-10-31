# TitrationLab functional review — 2026-10-31

Reviewed `main` at `6a0bd0c6208675b0c6747866fcb6caa8ee10c9d2`.
Ran `git pull --ff-only` before source analysis and browser testing: **Already up to date**.
The initial working tree was clean. Runtime: Node v26.13.0 in WSL Ubuntu-24.04
(Ubuntu 26.04.1), satisfying the repository's Node >=26 requirement.

Scope: the shared charge-balance solver and titration calculations, all three screens, burette
dispensing/refills, pH recording, notebook and unknown workflow, cursor controls, indicator
endpoints, and runtime language changes. Applied Baton's `scenerystack-code-review` skill and
functional-review reference. This is a targeted functional review, not a full release sign-off.
All four findings below are now resolved; see the resolution section for changes and validation.
The original locations and reproductions below refer to the reviewed revision.

## Findings

### 1. [P2] Do not use the key-point label tolerance to select equivalence-only equations

Location: `src/common/model/TitrationCurve.ts:220–224`, `:175–177` and `:234–235`.

`regionAt` treats any progress within 0.01 equivalents of an integer as that exact equivalence
point and uses the equivalence-only formula. A volume-label tolerance is therefore also deciding
which chemistry is present. Around a steep endpoint, this produces a large error and a false
statement about the flask's contents.

Browser reproduction on Curves, with assertions enabled:

1. Choose HCl at 0.100 M; the sample is 25.00 mL and NaOH is 0.100 M.
2. Enable Show equations and put the cursor at 24.90 mL (fraction 0.498 of the 50 mL axis).
3. The exact readout correctly shows **pH 3.70**, but the equation says
   **“Only spectator ions: pH = 7.00”** and **“Approximation: pH ≈ 7.00.”**

There is still 0.010 mmol excess HCl in 49.90 mL, so [H+] is about 2.004 × 10^-4 M and
pH is 3.6981. This is not an approximation failure from a dilute solution: the code selected
the wrong stoichiometric case. NaOH analytes and the weak-system `singleFormRegion` path use
the same tolerance shortcut.

Keep a convenient near-key-point label if desired, but select the displayed equation from the
actual stoichiometric state, using only a numerical-roundoff tolerance for exact equivalence.
Check both sides of an endpoint and the exact endpoint in regressions.

### 2. [P2] Continue recording the measured curve after its point buffer fills

Location: `src/lab/model/LabModel.ts:254–269`, especially `:266–268`.

After `MAX_RECORDED_POINTS` (6000) samples, `recordPoint` silently stops appending or emitting
updates forever. The burette, titrant-added amount, flask pH and chart axis continue advancing,
but the measured curve remains at the old volume. Supported concentration/volume combinations
can reach this limit before the first equivalence point.

Browser/model reproduction:

1. Select phosphoric acid, 25.00 mL, set analyte concentration to 0.200 M and titrant to
   0.050 M. The first and second equivalence volumes are 100 and 200 mL.
2. Put the pH meter in the flask. Deliver 6500 increments of 0.011 mL, refilling when needed.
   These increments correspond to the supported flow of 0.66 mL/s at 60 frames/s; the probe
   called the same `dispense` path used by `step`.
3. Delivered volume reaches **71.500 mL**, pH **2.62685**, but the 6000-point curve ends at
   **65.989 mL**, pH **2.52318**. Further dispensing leaves that endpoint unchanged.

Keep the record bounded through decimation or another retention policy that preserves the
latest sample and meaningful curve history. Verify acquisition still progresses through an
endpoint after refills and after crossing the capacity boundary.

### 3. [P2] Separate phosphoric acid's displayed endpoint count from its chemical capacity

Location: `src/common/model/TitrationCurve.ts:232–245`;
`src/common/model/Analytes.ts` (`PHOSPHORIC_ACID`);
`tests/common/TitrationCurve.test.ts` (“stops phosphoric acid at its second equivalence point”).

Phosphoric acid correctly has three pKa values in the solver, but `equivalencePoints = 2`
means only two endpoint markers are shown. `regionAt` also uses that presentation count as
the total number of protons neutralized. Beyond two equivalents, it treats all further NaOH
as free excess hydroxide and displays the associated strong-base excess equation, ignoring
the HPO4^2-/PO4^3- equilibrium still represented in the exact model.

Browser reproduction: on Curves, choose 0.100 M H3PO4, Show equations, and cursor volume
62.50 mL (2.5 equivalents, fraction 0.625). The exact pH is **11.8731**, with approximately
1.90 mmol HPO4^2- and 0.60 mmol PO4^3-. The readout labels the region **“Excess titrant”**
and displays `[OH-] = mol excess titrant ÷ total volume`, **pH ≈ 12.15**. That calculation
counts all 1.25 mmol added after the second endpoint as free OH-, whereas the exact free OH-
amount is about 0.653 mmol; much of the addition participates in the third equilibrium.

The third dissociation remains part of the chemistry even when its endpoint is not marked.
[OpenStax Chemistry 2e, §14.5](https://openstax.org/books/chemistry-2e/pages/14-5-polyprotic-acids)
describes phosphoric acid's three stepwise ionizations. Preserve the two-marker teaching choice,
but base region/equation selection on the complete system; suppress or qualify a simplified
formula where it is invalid. The existing test currently codifies the incorrect excess-base
classification, so it should be corrected rather than retained as the expected behavior.

### 4. [P2] Refresh the composed Curves readouts when the language changes

Location: `src/curves/view/CursorReadoutNode.ts:84–93` and the callback that follows.

The callback builds region, equation, approximation and other strings by reading localized
Properties, but observes only two string Properties. Their values are identical across some
locales, so switching language does not rerun the callback. Directly bound labels update, while
the scientific explanation remains in the previous language until a physical input changes.

Browser reproduction:

1. Open Curves in English, enable Show equations, and place the acetic-acid cursor at 5 mL.
2. Set the application's normal `localeProperty` to `fr`; wait two animation frames.
3. The rest of the screen is French, but the readout still says **“Buffer region”**,
   `log(mol base ÷ mol acid)`, and **“Approximation: pH ≈ 4.14.”**
4. Moving the cursor by only 10^-9 of its range refreshes those same strings to **“Zone tampon”**,
   `log(mol de base ÷ mol d'acide)`, and **“Approximation : pH ≈ 4.14.”**

A screenshot also confirmed an English “Excess titrant” explanation inside an otherwise French
phosphoric-acid screen. Observe every string Property read by the callback, or add an appropriate
locale dependency that refreshes after localization. Test a runtime language switch while the
cursor and chemistry remain unchanged.

## Initial review validation and evidence

- `npm run lint`: passed, 73 files checked, no lint findings.
- `npm run check`: passed app, scripts and test type checks.
- `npm test`: **30 passed** across 5 files, including the existing five memory-leak tests.
- `npm run build`: passed production and PWA build.
- From the fleet root, `bash Baton/scripts/check-repo-compliance.sh TitrationLab` and
  `bash Baton/scripts/check-template-drift.sh TitrationLab`: both passed, including remote
  repository security-setting probes.
- `FUZZ_PORT=5211 npm run test:fuzz:quick`: **2 passed**, pointer and keyboard, 10 seconds each.
- Chromium `?ea` probes: all three screens launched without page errors; inspected English
  screenshots of each and focused screenshots of the two equation issues and live French switch.
- Actual focused keyboard D and Shift+D delivered 0.050 and 0.025 mL (0.075 mL total).
- Actual Record burette reading and New flask buttons recorded and cleared the notebook;
  New flask cleared delivered volume and closed the stopcock.
- Actual focused K / Shift+K advanced and returned between 25.00 and 12.50 mL key points.
- An unknown answer rounded to the UI's 0.001 M precision was graded correctly. Unknown-sample
  screenshot confirmed its calculated curve/equivalence controls were disabled.
- All nine known analyte choices and reset were exercised on all three screens in French and
  Spanish without page errors. Runtime-switch correctness is limited by finding 4.
- The point-buffer boundary was exercised through 6500 real `dispense` calls with refills;
  the resulting stale trace endpoint was read from the same record displayed by the chart.

The initial review left application sources and tests unchanged and made no external issues.
Built output was compiled, not separately
browser-tested. Heap snapshots, educator sign-off, manual assistive-technology testing and a
full performance/release audit were outside this review's scope.

## Resolution — all four findings addressed

1. **Equation selection:** whole-equivalent formulas now require a roundoff-sized tolerance
   (`STOICHIOMETRIC_TOLERANCE`, 10^-10 equivalents scaled with progress). The wider 1 % tolerance
   only labels half-equivalence, whose equation retains the actual ratio. HCl at 24.90 mL now
   displays the remaining-acid equation and pH ≈ 3.70; the exact 25.00 mL point still shows pH 7.
   Both titration directions and weak/polyprotic systems are covered by regressions.
2. **Measured history:** when the record exceeds its capacity it retains every other point
   plus its latest point, then doubles the volume sampling spacing. The history remains bounded
   while continuing through refills and later endpoints. New flask and reset restore the original
   spacing. A 20,000-frame test at 0.66 mL/s reaches 220 mL, preserves samples near the 100 and
   200 mL endpoints, and retains a recent sample beyond 219.95 mL instead of freezing at 65.989 mL.
3. **Phosphoric-acid feedback:** region selection counts all available protons independently
   of the two visible endpoint markers. Beyond its second marker, H3PO4 uses a localized
   full-charge-balance explanation including water, with no misleading simplified numerical
   approximation. The exact solver and its pH values are unchanged. The readout can identify
   the third stoichiometric region, while the graph and key-point navigation retain two endpoint
   markers. The previous test that codified the excess-base shortcut has been corrected.
4. **Runtime localization:** the composed readout observes every localized string it reads,
   including region and method groups. The cursor slider's accessible value text also observes
   its localized dependencies. Browser tests switch English → French → Spanish → English without
   moving the cursor and check both visible and accessible descriptions. Equation text wraps
   within the panel so the new explanations stay readable in all three languages.

Expanded model regressions include seven cases that failed against the original behavior before
the fix. Added five browser regressions: native keyboard movement near equivalence and the K
shortcut, phosphoric-acid explanations in three locales, and live locale switching with a fixed
cursor. Updated model documentation and implementation guidance.

Final validation with Node v26.13.0:

- `npm run lint`: passed, no findings; `npm run check`: passed all three type-check targets.
- `npm test`: **37 passed** across 5 files, including all five existing memory-leak checks.
- `npm run build`: passed production and PWA build.
- `FUZZ_PORT=5210 npx playwright test tests/browser`: **5 passed**.
- `FUZZ_PORT=5211 npm run test:fuzz:quick`: **2 passed**, pointer and keyboard, 10 seconds each.
- Fleet compliance and template drift checks for `TitrationLab`: both passed.
- Inspected updated French/Spanish phosphoric-acid panels and the HCl near-equivalence panel.
- `git diff --check`: passed. No template-owned infrastructure files were changed.
