/**
 * FlaskNode.ts
 *
 * Erlenmeyer flask with the analyte. The liquid rises with the volume added, and its colour is
 * the indicator's at the flask pH, diluted as titrant is added. Where the last titrant landed, a
 * patch takes the colour of the not-yet-mixed local pH (LabModel.localPHProperty) and fades as it
 * mixes: before the endpoint the flash disappears, after it the whole flask matches it.
 *
 * The origin is the centre of the flask's mouth.
 */

import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Node, Path } from "scenerystack/scenery";
import { SOLUTION_COLOR_DEPENDENCIES, solutionColor } from "../../common/view/indicatorColor.js";
import TitrationLabColors from "../../TitrationLabColors.js";
import { FLASH_THRESHOLD, FLASK_BODY_VOLUME, INDICATOR_STRENGTH } from "../../TitrationLabConstants.js";
import type { LabModel } from "../model/LabModel.js";

const NECK_HALF_WIDTH = 17;
const NECK_HEIGHT = 28;
const BODY_HEIGHT = 112;
const BASE_HALF_WIDTH = 74;
export const FLASK_HEIGHT = NECK_HEIGHT + BODY_HEIGHT;

/** Excess (mL) at which the flash is fully opaque. */
const FULL_FLASH_EXCESS = 0.03;

/** Half-width of the body at height h above the base. */
function halfWidthAt(h: number): number {
  return BASE_HALF_WIDTH + (NECK_HALF_WIDTH - BASE_HALF_WIDTH) * (h / BODY_HEIGHT);
}

export class FlaskNode extends Node {
  /** Top of the liquid, in local coordinates (for the drop landing point and the probe). */
  public liquidTopY = FLASK_HEIGHT;

  public constructor(model: LabModel) {
    super();
    const baseY = FLASK_HEIGHT;
    const outline = new Shape()
      .moveTo(-NECK_HALF_WIDTH, 0)
      .lineTo(-NECK_HALF_WIDTH, NECK_HEIGHT)
      .lineTo(-BASE_HALF_WIDTH, baseY)
      .lineTo(BASE_HALF_WIDTH, baseY)
      .lineTo(NECK_HALF_WIDTH, NECK_HEIGHT)
      .lineTo(NECK_HALF_WIDTH, 0);
    const glass = new Path(outline, {
      stroke: TitrationLabColors.glassColorProperty,
      lineWidth: 2,
      fill: TitrationLabColors.glassFillColorProperty,
    });
    const liquid = new Path(null);
    const flash = new Path(Shape.ellipse(0, 0, 18, 6, 0), { visible: false });
    this.children = [liquid, flash, glass];

    Multilink.multilinkAny(
      [
        model.pHProperty,
        model.indicatorProperty,
        model.titrantAddedProperty,
        model.setupProperty,
        model.localPHProperty,
        model.localExcessProperty,
        ...SOLUTION_COLOR_DEPENDENCIES,
      ],
      () => {
        const setup = model.setupProperty.value;
        const added = model.titrantAddedProperty.value;
        const total = setup.analyteVolume + added;
        const height = Math.min(BODY_HEIGHT * Math.sqrt(Math.min(total / FLASK_BODY_VOLUME, 1)), BODY_HEIGHT);
        const top = baseY - height;
        const half = halfWidthAt(height);
        liquid.shape = new Shape()
          .moveTo(-BASE_HALF_WIDTH + 1.5, baseY - 1)
          .lineTo(BASE_HALF_WIDTH - 1.5, baseY - 1)
          .lineTo(half - 1, top)
          .lineTo(-half + 1, top)
          .close();
        this.liquidTopY = top;

        const strength = (INDICATOR_STRENGTH * setup.analyteVolume) / total;
        const indicator = model.indicatorProperty.value;
        liquid.fill = solutionColor(indicator, model.pHProperty.value, strength);

        const excess = model.localExcessProperty.value;
        flash.visible = indicator !== null && excess > FLASH_THRESHOLD;
        if (flash.visible) {
          flash.fill = solutionColor(indicator, model.localPHProperty.value, strength * 1.5);
          flash.opacity = Math.min(excess / FULL_FLASH_EXCESS, 1) * 0.9;
          flash.centerX = 0;
          flash.centerY = top + 8;
        }
      },
    );
  }
}
