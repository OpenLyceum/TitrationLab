# Titration Lab — implementation notes

Architecture and the design decisions behind it. The chemistry is in [`model.md`](model.md).

## Layout of the code

```
src/
  common/
    model/      ChargeBalanceSolver, Analytes, Indicators, TitrationCurve  (pure functions + data)
    view/       TitrationChartNode, indicatorColor, formatValues, ControlFactory, disposeChildren
    TitrationLabHotkeyData.ts, TitrationLabScreenIcons.ts, …
  lab/          LabModel; BuretteNode, FlaskNode, PHMeterNode, LabScreenView
  curves/       CurvesModel; SpeciesChartNode, CursorReadoutNode, CurvesScreenView
  indicators/   IndicatorsModel; TubeRackNode, ColorRangesNode, IndicatorBreakdownNode,
                ChooseIndicatorNode, IndicatorsScreenView
```

The chemistry is a set of pure functions over plain data (`TitrationSetup`, `Mixture`,
`Analyte`, `Indicator`); the screen models only hold Properties and derive from them. This keeps
the whole chemistry testable without SceneryStack and lets all three screens share it.

## Decisions

- **Exact solver everywhere.** A single charge-balance solver replaces the usual case analysis
  (strong/weak, before/at/after equivalence). Approximations live only in `regionAt` and are
  displayed, never used for a value on screen. Cost: ~50 bisection steps × a few α evaluations per
  pH, which is negligible even for a 300-point curve recomputed on every slider change.
- **Analytes as data.** An analyte is its weak system (pKa list, charge of the protonated form),
  spectators per formula unit, and a start index. Bases titrated with HCl need no special code:
  NH₃ is the NH₄⁺ system starting one proton down; Na₂CO₃ is the H₂CO₃ system starting two down
  with 2 Na⁺.
- **Units.** Chemistry quantities use lab units (mL, mol/L, mmol), not SI, because that is what
  the student reads and enters; `TitrationLabConstants.ts` says so at the top.
- **Lab dispensing.** The model integrates `flowRate × dt`; drops and half drops are
  `dispense(volume)`. The burette reading and the volume in the flask are separate Properties so a
  refill changes only the reading. Changing anything that defines the flask (`setupProperty`)
  starts a new flask; the indicator can change without one.
- **Bounded recording.** At the measured-curve capacity, retain every other sample and the latest
  sample, then double the minimum volume spacing. This preserves the full run and keeps recording
  through later refills/endpoints. `newFlask` restores the original spacing before seeding its point.
- **Equation regions.** Whole-equivalent equations require a roundoff-sized stoichiometric
  tolerance, not the wider half-equivalence label tolerance. Weak systems count all chemically
  available protons independently of their visible markers. H₃PO₄ beyond its second marker uses
  the full charge-balance explanation because its weak third step competes with water.
- **Local flash.** `localExcessProperty` is the unmixed titrant (mL); each dispense adds to it and
  `step` decays it exponentially. `localPHProperty` mixes it into a 2 mL slice of the flask with
  the same solver. The view only reads these two.
- **Drops are view-only.** `LabScreenView` turns increases of `titrantAddedProperty` into falling
  drops (at most one per frame, a few waiting); a flow above 0.35 mL/s is drawn as a stream.
- **Curves cursor as a fraction.** The cursor is stored as a fraction of the volume axis, which
  runs to twice the last equivalence point. Changing the analyte or concentration keeps the cursor
  at the same stage of the titration (the equivalence point stays mid-axis), and the slider's
  keyboard steps stay sensible for any axis length.
- **Charts are rebuilt, not mutated, for markers.** Curves use `LinePlot.setDataSet`; markers,
  bands, legends and table rows are recreated on change and the old nodes disposed
  (`disposeChildren`), since they link to profile colours.
- **Colour.** Indicator form colours are `ProfileColorProperty`s (same value in both profiles) so
  the compliance rule "every colour in the Colors file" holds; `indicatorColor.solutionColor`
  mixes them by Beer–Lambert. Views that use it also listen to
  `SOLUTION_COLOR_DEPENDENCIES` so a profile change repaints.
- **Global hotkeys.** D / Shift+D and K / Shift+K use `KeyboardListener.createGlobal` on the
  screen view, declared once in `TitrationLabHotkeyData` for the listener and the help dialogs.
- **Readout localization.** `CursorReadoutNode` observes every string Property it reads, including
  the region and method groups. The cursor slider also observes its localized region/value-text
  Properties, so runtime language changes refresh the visible and accessible descriptions.

## Not done (possible extensions)

- Activity coefficients / ionic strength, temperature dependence of K<sub>w</sub> and K<sub>a</sub>.
- CO₂ loss (open-system carbonate).
- A derivative (dpH/dV) or Gran plot for locating the endpoint from pH data.
- Back-titrations and redox titrations.
