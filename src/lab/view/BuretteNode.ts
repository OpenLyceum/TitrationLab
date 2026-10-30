/**
 * BuretteNode.ts
 *
 * A 50 mL burette on its stand: graduations every mL (labelled every 5), the titrant column with
 * its meniscus at the current reading, and a stopcock whose handle turns from across the tube
 * (closed) to along it (fully open). A magnifier beside the tube follows the meniscus and shows
 * the 0.1 mL graduations a student reads to estimate 0.01 mL. With the "show reading"
 * preference on, the reading is also printed under the magnifier.
 *
 * The origin is the burette's 0.00 mark on the tube's left wall.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { disposeChildren } from "../../common/view/disposeChildren.js";
import { formatVolume } from "../../common/view/formatValues.js";
import TitrationLabColors from "../../TitrationLabColors.js";
import { BURETTE_CAPACITY, FLOW_RATE_RANGE, FONT_SIZE } from "../../TitrationLabConstants.js";
import type { LabModel } from "../model/LabModel.js";

/** Tube scale and size (px). */
export const PX_PER_ML = 7;
export const TUBE_WIDTH = 14;
const TUBE_TOP = -14;
const TUBE_BOTTOM = BURETTE_CAPACITY * PX_PER_ML + 8;
const STOPCOCK_Y = TUBE_BOTTOM + 10;
const TIP_LENGTH = 26;

/** Tip of the burette, where drops fall from (local coordinates). */
export const TIP_POSITION = { x: TUBE_WIDTH / 2, y: STOPCOCK_Y + TIP_LENGTH };

/** Magnifier geometry. */
const LENS_RADIUS = 44;
const LENS_CENTER_X = -64;
const ZOOM = 9;
const LENS_HALF_SPAN = LENS_RADIUS / (PX_PER_ML * ZOOM);

export class BuretteNode extends Node {
  public constructor(model: LabModel, showReadingProperty: TReadOnlyProperty<boolean>) {
    super();
    const tickFont = new PhetFont(FONT_SIZE.tiny);
    const glass = TitrationLabColors.glassColorProperty;
    const y = (reading: number): number => reading * PX_PER_ML;

    // ── Stand ───────────────────────────────────────────────────────────────────
    const rodX = -26;
    const stand = new Node({
      children: [
        new Rectangle(rodX - 3, TUBE_TOP - 20, 6, 620, { fill: TitrationLabColors.standColorProperty }),
        new Rectangle(rodX, 40, -rodX, 6, { fill: TitrationLabColors.standColorProperty }),
        new Rectangle(rodX, 300, -rodX, 6, { fill: TitrationLabColors.standColorProperty }),
      ],
    });

    // ── Tube, liquid, graduations ───────────────────────────────────────────────
    const liquid = new Rectangle(0, 0, TUBE_WIDTH, 1, { fill: TitrationLabColors.solutionColorProperty });
    const meniscus = new Path(null, { stroke: glass, lineWidth: 1.2 });
    const tube = new Rectangle(0, TUBE_TOP, TUBE_WIDTH, TUBE_BOTTOM - TUBE_TOP, {
      fill: TitrationLabColors.glassFillColorProperty,
      stroke: glass,
      lineWidth: 1.5,
    });
    const graduations = new Node();
    for (let mL = 0; mL <= BURETTE_CAPACITY; mL++) {
      const major = mL % 5 === 0;
      graduations.addChild(
        new Line(TUBE_WIDTH, y(mL), TUBE_WIDTH - (major ? 9 : 5), y(mL), { stroke: glass, lineWidth: major ? 1 : 0.6 }),
      );
      if (major) {
        graduations.addChild(
          new Text(String(mL), {
            font: tickFont,
            fill: TitrationLabColors.textColorProperty,
            left: TUBE_WIDTH + 3,
            centerY: y(mL),
          }),
        );
      }
    }

    // ── Stopcock and tip ────────────────────────────────────────────────────────
    const tipShape = new Shape()
      .moveTo(2, STOPCOCK_Y)
      .lineTo(TUBE_WIDTH - 2, STOPCOCK_Y)
      .lineTo(TUBE_WIDTH / 2 + 1.5, STOPCOCK_Y + TIP_LENGTH)
      .lineTo(TUBE_WIDTH / 2 - 1.5, STOPCOCK_Y + TIP_LENGTH)
      .close();
    const tip = new Path(tipShape, {
      fill: TitrationLabColors.solutionColorProperty,
      stroke: glass,
      lineWidth: 1.2,
    });
    const stem = new Rectangle(2, TUBE_BOTTOM, TUBE_WIDTH - 4, STOPCOCK_Y - TUBE_BOTTOM, {
      fill: TitrationLabColors.solutionColorProperty,
      stroke: glass,
    });
    const barrel = new Circle(7, {
      fill: TitrationLabColors.glassFillColorProperty,
      stroke: glass,
      lineWidth: 1.5,
      x: TUBE_WIDTH / 2,
      y: STOPCOCK_Y,
    });
    const handle = new Rectangle(-22, -3.5, 44, 7, 3, 3, {
      fill: TitrationLabColors.stopcockColorProperty,
      x: TUBE_WIDTH / 2,
      y: STOPCOCK_Y,
    });

    // ── Magnifier ──────────────────────────────────────────────────────────────
    const lensContent = new Node();
    const lens = new Node({
      children: [
        new Circle(LENS_RADIUS, { fill: TitrationLabColors.chartBackgroundColorProperty }),
        new Node({ children: [lensContent], clipArea: Shape.circle(0, 0, LENS_RADIUS - 1) }),
        new Circle(LENS_RADIUS, { stroke: glass, lineWidth: 3 }),
      ],
      x: LENS_CENTER_X,
    });
    const lensLeader = new Line(0, 0, 0, 0, { stroke: glass, lineWidth: 1, lineDash: [3, 3] });
    const readingText = new Text("", {
      font: new PhetFont({ size: FONT_SIZE.small, weight: "bold" }),
      fill: TitrationLabColors.textColorProperty,
      visibleProperty: showReadingProperty,
    });

    this.children = [
      stand,
      lensLeader,
      liquid,
      tube,
      meniscus,
      graduations,
      stem,
      tip,
      barrel,
      handle,
      lens,
      readingText,
    ];

    // Draws the zoomed scale around `reading`; the lens centre is the meniscus.
    const drawLens = (reading: number): void => {
      disposeChildren(lensContent);
      const zoomed = (mL: number): number => (mL - reading) * PX_PER_ML * ZOOM;
      const halfWidth = LENS_RADIUS / 2;
      lensContent.addChild(
        new Rectangle(-halfWidth, zoomed(reading), 2 * halfWidth, 3 * LENS_RADIUS, {
          fill: TitrationLabColors.solutionColorProperty,
        }),
      );
      const first = Math.ceil((reading - LENS_HALF_SPAN) * 10);
      const last = Math.floor((reading + LENS_HALF_SPAN) * 10);
      for (let tenth = first; tenth <= last; tenth++) {
        if (tenth < 0 || tenth > BURETTE_CAPACITY * 10) {
          continue;
        }
        const whole = tenth % 10 === 0;
        const half = tenth % 5 === 0;
        const length = whole ? 2 * halfWidth : half ? 1.3 * halfWidth : halfWidth;
        lensContent.addChild(
          new Line(halfWidth, zoomed(tenth / 10), halfWidth - length, zoomed(tenth / 10), {
            stroke: TitrationLabColors.textColorProperty,
            lineWidth: whole ? 1.5 : 1,
          }),
        );
        if (whole) {
          lensContent.addChild(
            new Text(String(tenth / 10), {
              font: new PhetFont(FONT_SIZE.small),
              fill: TitrationLabColors.textColorProperty,
              left: halfWidth + 4,
              centerY: zoomed(tenth / 10),
            }),
          );
        }
      }
      // Meniscus: the bottom of the curve sits exactly on the reading.
      lensContent.addChild(
        new Path(new Shape().moveTo(-halfWidth, -8).quadraticCurveTo(0, 8, halfWidth, -8), {
          stroke: TitrationLabColors.glassColorProperty,
          lineWidth: 2,
        }),
      );
    };

    Multilink.multilink([model.buretteReadingProperty], (reading) => {
      const top = y(reading);
      liquid.setRect(0, top, TUBE_WIDTH, Math.max(TUBE_BOTTOM - top, 0));
      liquid.visible = reading < BURETTE_CAPACITY;
      meniscus.shape = new Shape().moveTo(0, top - 2).quadraticCurveTo(TUBE_WIDTH / 2, top + 2, TUBE_WIDTH, top - 2);
      lens.y = Math.min(Math.max(top, LENS_RADIUS), TUBE_BOTTOM - LENS_RADIUS);
      lensLeader.setLine(LENS_CENTER_X + LENS_RADIUS, lens.y, 0, top);
      drawLens(reading);
      readingText.string = `${formatVolume(reading)} mL`;
      readingText.centerX = LENS_CENTER_X;
      readingText.top = lens.y + LENS_RADIUS + 4;
    });

    const openFraction = new DerivedProperty([model.flowRateProperty], (rate) => rate / FLOW_RATE_RANGE.max);
    openFraction.link((fraction) => {
      handle.rotation = (fraction * Math.PI) / 2;
    });
  }
}
