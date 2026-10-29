# Titration Lab — model

The chemistry behind the three screens: how the pH is computed, the data and where it comes
from, the textbook approximations shown beside the exact values, and the indicator colours.

## Assumptions

- Ideal dilute solutions: concentrations stand in for activities.
- 25 °C throughout: K<sub>w</sub> = 1.0 × 10⁻¹⁴, pK<sub>w</sub> = 14.
- Volumes add on mixing.
- Closed system: carbonate does not lose CO₂ (a real Na₂CO₃ titration is often boiled near the
  second endpoint; the sim's second endpoint is the closed-system one, pH ≈ 3.9).
- The indicator is at a tiny concentration and does not take part in the charge balance.

## Exact pH: the charge balance

The flask holds one weak acid–base system (or none, for HCl or NaOH) plus spectator ions. Every
concentration is the amount divided by the total volume V<sub>analyte</sub> + V<sub>titrant</sub>.

For a system with total concentration C, stepwise pK<sub>a1</sub> < pK<sub>a2</sub> < … <
pK<sub>an</sub> and charge z₀ on its fully protonated form, the fraction that has lost j protons is

α<sub>j</sub> = [H⁺]<sup>n−j</sup> K<sub>1</sub>⋯K<sub>j</sub> ⁄ Σ<sub>k</sub> [H⁺]<sup>n−k</sup> K<sub>1</sub>⋯K<sub>k</sub>

(computed in log space so that, e.g., pH 14 with pK<sub>a</sub> 1 does not underflow). The pH is
the root of

[H⁺] + [Na⁺] − [Cl⁻] − K<sub>w</sub>/[H⁺] + C Σ<sub>j</sub> α<sub>j</sub>(z₀ − j) = 0.

The left side falls monotonically as the pH rises, so 50 bisection steps between pH −2 and 16
find it to far better than the 0.01 displayed. The same code gives the initial pH, the buffer, the
equivalence points and the excess-titrant region, for strong, weak and polyprotic analytes, and
stays right where the textbook formulas fail (very dilute or very weak acids).

How each analyte enters the balance:

| Analyte | Weak system (z₀) | Spectators per formula unit | Start index |
|---|---|---|---|
| HCl | none | 1 Cl⁻ | — |
| NaOH | none | 1 Na⁺ | — |
| CH₃COOH, HF, HClO | HA (0) | — | 0 |
| H₂C₂O₄ | H₂A (0) | — | 0 |
| H₃PO₄ | H₃A (0) | — | 0 |
| NH₃ | NH₄⁺ (+1) | — | 1 |
| Na₂CO₃ | H₂CO₃ (0) | 2 Na⁺ | 2 |

The titrant adds Na⁺ (NaOH) or Cl⁻ (HCl). The *start index* is how many protons the added form has
already lost; it fixes where the titration starts along the species.

## Data

K<sub>a</sub> and K<sub>b</sub> at 25 °C from OpenStax *Chemistry 2e*, Appendix H (weak acids) and
Appendix I (weak bases), CC BY 4.0. pK<sub>a</sub> = −log K<sub>a</sub>; for NH₄⁺,
pK<sub>a</sub> = 14 + log K<sub>b</sub>(NH₃).

| Acid | K<sub>a</sub> | pK<sub>a</sub> |
|---|---|---|
| CH₃COOH | 1.8 × 10⁻⁵ | 4.74 |
| HF | 6.4 × 10⁻⁴ | 3.19 |
| HClO | 2.9 × 10⁻⁸ | 7.54 |
| H₂C₂O₄ | 6.0 × 10⁻², 6.1 × 10⁻⁵ | 1.22, 4.21 |
| H₃PO₄ | 7.5 × 10⁻³, 6.2 × 10⁻⁸, 4.2 × 10⁻¹³ | 2.12, 7.21, 12.38 |
| H₂CO₃ | 4.3 × 10⁻⁷, 4.7 × 10⁻¹¹ | 6.37, 10.33 |
| NH₄⁺ (K<sub>b</sub> NH₃ = 1.8 × 10⁻⁵) | 5.6 × 10⁻¹⁰ | 9.26 |

Checked values (25.00 mL of 0.100 M analyte, 0.100 M titrant; see
`tests/common/TitrationCurve.test.ts`): acetic acid starts at pH 2.88, is 4.75 at half-equivalence,
8.72 at equivalence and 11.96 at 30.00 mL; HCl is 7.00 at equivalence; NH₃ is 5.28 at
equivalence; 0.050 M Na₂CO₃ is 8.35 and 3.99 at its two equivalence points.

## Key volumes and regions

With n<sub>a</sub> = C<sub>a</sub>V<sub>a</sub> and the titrant concentration C<sub>t</sub>, the k-th
equivalence point is at V = k n<sub>a</sub>/C<sub>t</sub> and the k-th half-equivalence point at
V = (k − ½) n<sub>a</sub>/C<sub>t</sub>. Progress e = C<sub>t</sub>V/n<sub>a</sub> counts equivalents
added; within 1 % of a whole or half number the cursor is "at" that point.

The approximation shown for each region ("Show equations" on the Curves screen):

| Region | Approximation |
|---|---|
| Start, or equivalence with only the weak acid | [H⁺] ≈ √(K<sub>a</sub>C) |
| Equivalence with only the weak base | [OH⁻] ≈ √(K<sub>b</sub>C), K<sub>b</sub> = K<sub>w</sub>/K<sub>a</sub> |
| Intermediate equivalence (amphiprotic form) | pH ≈ ½(pK<sub>a</sub> below + pK<sub>a</sub> above) |
| Buffer | pH ≈ pK<sub>a</sub> + log(mol base / mol acid) |
| Strong acid or base before equivalence | [H⁺] or [OH⁻] = excess ÷ total volume |
| Strong + strong at equivalence | pH = 7.00 |
| Past the last equivalence point | excess titrant ÷ total volume |

The shaded buffer region on the curve spans base : acid ratios from 1 : 9 to 9 : 1, the range over
which Henderson–Hasselbalch is usually taught.

## Indicators

An indicator is a weak acid HIn whose forms differ in colour; thymol blue has two transitions and
three forms. Values are the usual textbook figures (OpenStax *Chemistry 2e* Figure 14.21; CRC
Handbook):

| Indicator | Range | pK<sub>In</sub> | Colours |
|---|---|---|---|
| Methyl orange | 3.1–4.4 | 3.7 | red → yellow |
| Bromocresol green | 3.8–5.4 | 4.7 | yellow → blue |
| Methyl red | 4.4–6.2 | 5.1 | red → yellow |
| Bromothymol blue | 6.0–7.6 | 7.1 | yellow → blue |
| Thymol blue | 1.2–2.8, 8.0–9.6 | 1.7, 8.9 | red → yellow → blue |
| Phenolphthalein | 8.2–10.0 | 9.4 | colourless → pink |

**Colour.** Each form's profile colour is taken as its transmission at a reference strength, and
the forms absorb independently (Beer–Lambert), so per channel T = Π T<sub>form</sub><sup>α·s</sup>.
The strength s in the flask is 1.6 × V<sub>analyte</sub>/V<sub>total</sub>: the indicator is diluted
as titrant is added. Phenolphthalein's pink therefore deepens gradually past its endpoint, and a
two-colour indicator passes through the true mixture (yellow + blue → green).

**Endpoint.** The endpoint is where the colour first visibly changes: the edge of the transition
range that the pH reaches first (the low edge when the pH rises, the high edge when it falls). For
each indicator the sim finds the volume where the curve reaches that pH (bisection; pH is
monotonic in volume), takes the closest equivalence point, and reports

- the error, endpoint − equivalence, and
- the span, the volume over which the whole colour change happens.

An indicator is rated **good** when |error| ≤ 0.5 % and span ≤ 3 % of that equivalence volume.

## The Lab's local flash

Titrant takes time to mix in (time constant 0.8 s). Until it does, the volume just added sits in a
2 mL region where it landed; that region's pH is computed exactly like the flask's, and the flash
there is drawn in its indicator colour with an opacity that fades with the unmixed volume. Before
the endpoint the flash fades away; after it, the whole flask matches it.

## Unknown

An unknown is HCl, CH₃COOH or HF at a uniformly random concentration between 0.05 and 0.15 M
(4 decimals). An answer within 1.5 % of the true value is accepted.
