# Titration Lab

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

Acid–base titration for introductory (General) chemistry. Titrate at the bench with a burette,
an indicator and a pH meter; compare calculated curves for strong, weak and polyprotic acids and
bases; and learn how indicators work and how to choose one. Every pH is computed exactly from the
charge balance, with the textbook approximations shown alongside. Built with
[SceneryStack](https://scenerystack.org/); runs offline as a Progressive Web App.

## Features

- **Lab.** A 50 mL burette over a flask of analyte with an indicator. Open the stopcock, or add a
  drop or half a drop at a time; read the burette at its magnified meniscus (it never starts at
  exactly 0.00 mL) and record readings in a notebook. Near the endpoint, a flash of colour appears
  where each drop lands and fades as it mixes, until it stays. Dip the pH meter in to plot the
  curve as you go, and titrate an unknown acid to find its concentration.
- **Curves.** The calculated titration curve of hydrochloric, acetic, hydrofluoric, hypochlorous,
  oxalic or phosphoric acid with NaOH, or of sodium hydroxide, ammonia or sodium carbonate with
  HCl, or a weak acid of any pKa. Buffer regions, half-equivalence points (pH = pKa) and
  equivalence points are marked, a second curve can be overlaid, and the fraction of each species
  is plotted below. A cursor reads out the pH, [H₃O⁺], [OH⁻] and the amount of every species, with
  the Gen Chem approximation for that region (Henderson–Hasselbalch, √(K<sub>a</sub>C), …) next to
  the exact value.
- **Indicators.** Six indicators at any pH, as tubes and as colour strips from pH 0 to 14, with
  the selected one broken down into its acid and base forms. Pick a titration to see where each
  indicator would change colour, its endpoint error, and whether it is a good choice.
- Ka and Kb values from OpenStax *Chemistry 2e*, so results match the textbook.
- **Accessible:** keyboard drops (D, Shift+D) and key-point jumps (K, Shift+K), announced colour
  changes, live screen summaries, keyboard-help dialogs.
- English, French and Spanish; default and projector colour profiles; installable PWA. A
  preference (or `?showReading`) prints the burette reading as a number.

## Quick Start

```bash
npm install
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

New sims start at `version: "0.0.0"` in `package.json`. Bump only when cutting a release (for example `npm version patch` and a matching git tag). Keep `name` in kebab-case; it is separate from the SceneryStack sim identifier in `src/init.ts`, which reads its `version` from `package.json`.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
