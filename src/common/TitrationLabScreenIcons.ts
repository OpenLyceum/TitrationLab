/**
 * TitrationLabScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for each screen.
 * Drawn on the standard PhET 548 × 373 canvas using TitrationLabColors.
 */
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import TitrationLabColors from "../TitrationLabColors.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: TitrationLabColors.backgroundColorProperty });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: TitrationLabColors.backgroundColorProperty,
  });
}

/** Lab: a burette dripping into a flask that has just turned pink. */
export function createLabIcon(): ScreenIcon {
  const glass = { stroke: TitrationLabColors.glassColorProperty, lineWidth: 6 };
  const flaskShape = new Shape()
    .moveTo(W / 2 - 34, 170)
    .lineTo(W / 2 - 34, 215)
    .lineTo(W / 2 - 130, 345)
    .lineTo(W / 2 + 130, 345)
    .lineTo(W / 2 + 34, 215)
    .lineTo(W / 2 + 34, 170);
  const liquidShape = new Shape()
    .moveTo(W / 2 - 92, 290)
    .lineTo(W / 2 - 127, 342)
    .lineTo(W / 2 + 127, 342)
    .lineTo(W / 2 + 92, 290)
    .close();
  return iconFrom(
    new Node({
      children: [
        background(),
        new Path(liquidShape, { fill: TitrationLabColors.indicatorPinkColorProperty }),
        new Path(flaskShape, glass),
        new Rectangle(W / 2 - 14, 10, 28, 110, { ...glass, fill: TitrationLabColors.solutionColorProperty }),
        new Rectangle(W / 2 - 40, 118, 80, 14, 7, 7, { fill: TitrationLabColors.stopcockColorProperty }),
        new Circle(9, { fill: TitrationLabColors.solutionColorProperty, center: new Vector2(W / 2, 160) }),
      ],
    }),
  );
}

/** Curves: an S-shaped titration curve with its equivalence point. */
export function createCurvesIcon(): ScreenIcon {
  const left = 70;
  const right = W - 50;
  const top = 40;
  const bottom = H - 40;
  const points: Vector2[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = i / 100;
    // A logistic step with a gentle buffer slope, like a weak acid titrated with a strong base.
    const y = 0.15 + 0.25 * x + 0.5 / (1 + Math.exp(-60 * (x - 0.55)));
    points.push(new Vector2(left + x * (right - left), bottom - y * (bottom - top)));
  }
  const curve = new Shape();
  curve.moveToPoint(points[0] as Vector2);
  for (const point of points.slice(1)) {
    curve.lineToPoint(point);
  }
  const equivalence = points[55] as Vector2;
  return iconFrom(
    new Node({
      children: [
        background(),
        new Path(new Shape().moveTo(left, top).lineTo(left, bottom).lineTo(right, bottom), {
          stroke: TitrationLabColors.chartAxisColorProperty,
          lineWidth: 5,
        }),
        new Path(curve, { stroke: TitrationLabColors.curveColorProperty, lineWidth: 12 }),
        new Circle(16, { fill: TitrationLabColors.equivalenceColorProperty, center: equivalence }),
      ],
    }),
  );
}

/** Indicators: a rack of tubes in indicator colours. */
export function createIndicatorsIcon(): ScreenIcon {
  const colors = [
    TitrationLabColors.indicatorRedColorProperty,
    TitrationLabColors.indicatorYellowColorProperty,
    TitrationLabColors.indicatorBlueColorProperty,
    TitrationLabColors.indicatorPinkColorProperty,
  ];
  const tubeWidth = 70;
  const spacing = W / colors.length;
  return iconFrom(
    new Node({
      children: [
        background(),
        ...colors.map((color, i) => {
          const x = i * spacing + (spacing - tubeWidth) / 2;
          const tube = (topY: number): Shape =>
            new Shape()
              .moveTo(x, topY)
              .lineTo(x, 300)
              .arc(x + tubeWidth / 2, 300, tubeWidth / 2, Math.PI, 0, true)
              .lineTo(x + tubeWidth, topY);
          return new Node({
            children: [
              new Path(tube(120).close(), { fill: color }),
              new Path(tube(40), { stroke: TitrationLabColors.glassColorProperty, lineWidth: 6 }),
            ],
          });
        }),
      ],
    }),
  );
}
