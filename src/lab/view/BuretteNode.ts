import { BURETTE_NODE_SETTINGS } from "../../TitrationLabConstants.js";
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
import { formatVolume } from "../../common/view/formatValues.js";
import TitrationLabColors from "../../TitrationLabColors.js";
import { BURETTE_CAPACITY, FLOW_RATE_RANGE, FONT_SIZE } from "../../TitrationLabConstants.js";
import type { LabModel } from "../model/LabModel.js";

/** Tube scale and size (px). */
const PX_PER_ML: number = BURETTE_NODE_SETTINGS.PX_PER_ML;
const TUBE_WIDTH: number = BURETTE_NODE_SETTINGS.TUBE_WIDTH;
const TUBE_TOP: number = BURETTE_NODE_SETTINGS.TUBE_TOP;
const TUBE_BOTTOM = BURETTE_CAPACITY * PX_PER_ML + 8;
const STOPCOCK_Y = TUBE_BOTTOM + 10;
const TIP_LENGTH: number = BURETTE_NODE_SETTINGS.TIP_LENGTH;

/** Tip of the burette, where drops fall from (local coordinates). */
export const TIP_POSITION = { x: TUBE_WIDTH / 2, y: STOPCOCK_Y + TIP_LENGTH };

/** Magnifier geometry. */
const LENS_RADIUS: number = BURETTE_NODE_SETTINGS.LENS_RADIUS;
const LENS_CENTER_X: number = BURETTE_NODE_SETTINGS.LENS_CENTER_X;
const ZOOM: number = BURETTE_NODE_SETTINGS.ZOOM;

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
        new Rectangle(rodX - 3, TUBE_TOP - 20, BURETTE_NODE_SETTINGS.STAND_WIDTH, BURETTE_NODE_SETTINGS.STAND_HEIGHT, {
          fill: TitrationLabColors.standColorProperty,
        }),
        new Rectangle(rodX, BURETTE_NODE_SETTINGS.STAND_Y, -rodX, BURETTE_NODE_SETTINGS.STAND_HEIGHT_SEGMENT_2, {
          fill: TitrationLabColors.standColorProperty,
        }),
        new Rectangle(
          rodX,
          BURETTE_NODE_SETTINGS.STAND_Y_SEGMENT_2,
          -rodX,
          BURETTE_NODE_SETTINGS.STAND_HEIGHT_SEGMENT_2,
          { fill: TitrationLabColors.standColorProperty },
        ),
      ],
    });

    // ── Tube, liquid, graduations ───────────────────────────────────────────────
    const liquid = new Rectangle(0, 0, TUBE_WIDTH, 1, { fill: TitrationLabColors.solutionColorProperty });
    const meniscus = new Path(null, { stroke: glass, lineWidth: BURETTE_NODE_SETTINGS.MENISCUS_LINE_WIDTH });
    const tube = new Rectangle(0, TUBE_TOP, TUBE_WIDTH, TUBE_BOTTOM - TUBE_TOP, {
      fill: TitrationLabColors.glassFillColorProperty,
      stroke: glass,
      lineWidth: BURETTE_NODE_SETTINGS.TUBE_LINE_WIDTH,
    });
    const graduations = new Node();
    for (let mL = 0; mL <= BURETTE_CAPACITY; mL++) {
      const major = mL % 5 === 0;
      graduations.addChild(
        new Line(TUBE_WIDTH, y(mL), TUBE_WIDTH - (major ? 9 : 5), y(mL), {
          stroke: glass,
          lineWidth: major ? 1 : BURETTE_NODE_SETTINGS.CONSTRUCTOR_LINE_WIDTH,
        }),
      );
      if (major) {
        graduations.addChild(
          new Text(String(mL), {
            font: tickFont,
            fill: TitrationLabColors.textColorProperty,
            left: TUBE_WIDTH + BURETTE_NODE_SETTINGS.CONSTRUCTOR_LEFT_OFFSET,
            centerY: y(mL),
          }),
        );
      }
    }

    // ── Stopcock and tip ────────────────────────────────────────────────────────
    const tipShape = new Shape()
      .moveTo(BURETTE_NODE_SETTINGS.TIP_SHAPE_X, STOPCOCK_Y)
      .lineTo(TUBE_WIDTH - 2, STOPCOCK_Y)
      .lineTo(TUBE_WIDTH / 2 + 1.5, STOPCOCK_Y + TIP_LENGTH)
      .lineTo(TUBE_WIDTH / 2 - 1.5, STOPCOCK_Y + TIP_LENGTH)
      .close();
    const tip = new Path(tipShape, {
      fill: TitrationLabColors.solutionColorProperty,
      stroke: glass,
      lineWidth: BURETTE_NODE_SETTINGS.TIP_LINE_WIDTH,
    });
    const stem = new Rectangle(BURETTE_NODE_SETTINGS.STEM_X, TUBE_BOTTOM, TUBE_WIDTH - 4, STOPCOCK_Y - TUBE_BOTTOM, {
      fill: TitrationLabColors.solutionColorProperty,
      stroke: glass,
    });
    const barrel = new Circle(BURETTE_NODE_SETTINGS.BARREL_RADIUS, {
      fill: TitrationLabColors.glassFillColorProperty,
      stroke: glass,
      lineWidth: BURETTE_NODE_SETTINGS.BARREL_LINE_WIDTH,
      x: TUBE_WIDTH / 2,
      y: STOPCOCK_Y,
    });
    const handle = new Rectangle(
      BURETTE_NODE_SETTINGS.HANDLE_X,
      BURETTE_NODE_SETTINGS.HANDLE_Y,
      BURETTE_NODE_SETTINGS.HANDLE_WIDTH,
      BURETTE_NODE_SETTINGS.HANDLE_HEIGHT,
      BURETTE_NODE_SETTINGS.HANDLE_CORNER_X,
      BURETTE_NODE_SETTINGS.HANDLE_CORNER_Y,
      {
        fill: TitrationLabColors.stopcockColorProperty,
        x: TUBE_WIDTH / 2,
        y: STOPCOCK_Y,
      },
    );

    // ── Magnifier ──────────────────────────────────────────────────────────────
    const lensContent = new Node();
    const lens = new Node({
      children: [
        new Circle(LENS_RADIUS, { fill: TitrationLabColors.chartBackgroundColorProperty }),
        new Node({ children: [lensContent], clipArea: Shape.circle(0, 0, LENS_RADIUS - 1) }),
        new Circle(LENS_RADIUS, { stroke: glass, lineWidth: BURETTE_NODE_SETTINGS.LENS_LINE_WIDTH }),
      ],
      x: LENS_CENTER_X,
    });
    const lensLeader = new Line(0, 0, 0, 0, {
      stroke: glass,
      lineWidth: 1,
      lineDash: [BURETTE_NODE_SETTINGS.LENS_LEADER_LINE_DASH_DASH, BURETTE_NODE_SETTINGS.LENS_LEADER_LINE_DASH_DASH],
    });
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

    // The zoomed scale is built once at full length and slid under the lens, so the lens
    // centre is always the reading. The liquid and meniscus stay fixed at that centre.
    const halfWidth = LENS_RADIUS / 2;
    const zoomedScale = (mL: number): number => mL * PX_PER_ML * ZOOM;
    const wholeTicks = new Shape();
    const minorTicks = new Shape();
    const scaleLabels: Text[] = [];
    for (let tenth = 0; tenth <= BURETTE_CAPACITY * 10; tenth++) {
      const whole = tenth % 10 === 0;
      const half = tenth % 5 === 0;
      const length = whole ? 2 * halfWidth : half ? 1.3 * halfWidth : halfWidth;
      const tickY = zoomedScale(tenth / 10);
      (whole ? wholeTicks : minorTicks).moveTo(halfWidth, tickY).lineTo(halfWidth - length, tickY);
      if (whole) {
        scaleLabels.push(
          new Text(String(tenth / 10), {
            font: new PhetFont(FONT_SIZE.small),
            fill: TitrationLabColors.textColorProperty,
            left: halfWidth + BURETTE_NODE_SETTINGS.DRAW_LENS_LEFT_OFFSET,
            centerY: zoomedScale(tenth / BURETTE_NODE_SETTINGS.DRAW_LENS_CENTER_Y_FACTOR),
          }),
        );
      }
    }
    const lensScale = new Node({
      children: [
        new Path(wholeTicks, {
          stroke: TitrationLabColors.textColorProperty,
          lineWidth: BURETTE_NODE_SETTINGS.CONSTRUCTOR_DRAW_LENS_LINE_WIDTH,
        }),
        new Path(minorTicks, { stroke: TitrationLabColors.textColorProperty, lineWidth: 1 }),
        ...scaleLabels,
      ],
    });
    lensContent.children = [
      new Rectangle(-halfWidth, 0, 2 * halfWidth, 3 * LENS_RADIUS, {
        fill: TitrationLabColors.solutionColorProperty,
      }),
      lensScale,
      // Meniscus: the bottom of the curve sits exactly on the reading.
      new Path(
        new Shape()
          .moveTo(-halfWidth, BURETTE_NODE_SETTINGS.DRAW_LENS_Y)
          .quadraticCurveTo(
            0,
            BURETTE_NODE_SETTINGS.DRAW_LENS_CONTROL_Y,
            halfWidth,
            BURETTE_NODE_SETTINGS.DRAW_LENS_END_Y,
          ),
        {
          stroke: TitrationLabColors.glassColorProperty,
          lineWidth: BURETTE_NODE_SETTINGS.DRAW_LENS_LINE_WIDTH,
        },
      ),
    ];

    Multilink.multilink([model.buretteReadingProperty], (reading) => {
      const top = y(reading);
      liquid.setRect(0, top, TUBE_WIDTH, Math.max(TUBE_BOTTOM - top, 0));
      liquid.visible = reading < BURETTE_CAPACITY;
      meniscus.shape = new Shape().moveTo(0, top - 2).quadraticCurveTo(TUBE_WIDTH / 2, top + 2, TUBE_WIDTH, top - 2);
      lens.y = Math.min(Math.max(top, LENS_RADIUS), TUBE_BOTTOM - LENS_RADIUS);
      lensLeader.setLine(LENS_CENTER_X + LENS_RADIUS, lens.y, 0, top);
      lensScale.y = -zoomedScale(reading);
      readingText.string = `${formatVolume(reading)} mL`;
      readingText.centerX = LENS_CENTER_X;
      readingText.top = lens.y + LENS_RADIUS + BURETTE_NODE_SETTINGS.CONSTRUCTOR_TOP_OFFSET;
    });

    const openFraction = new DerivedProperty([model.flowRateProperty], (rate) => rate / FLOW_RATE_RANGE.max);
    openFraction.link((fraction) => {
      handle.rotation = (fraction * Math.PI) / 2;
    });
  }
}
