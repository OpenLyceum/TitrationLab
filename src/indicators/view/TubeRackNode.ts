import { TUBE_RACK_NODE_SETTINGS } from "../../TitrationLabConstants.js";
/**
 * TubeRackNode.ts
 *
 * One test tube per indicator, each coloured as that indicator looks at the chosen pH. The
 * selected indicator's tube is outlined; clicking a tube selects it (a pointer shortcut for the
 * indicator menu).
 */

import { Multilink, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Node, Path, PressListener, Text } from "scenerystack/scenery";
import { INDICATORS, type Indicator } from "../../common/model/Indicators.js";
import { SMALL_FONT } from "../../common/view/ControlFactory.js";
import { indicatorNameProperty } from "../../common/view/formatValues.js";
import { SOLUTION_COLOR_DEPENDENCIES, solutionColor } from "../../common/view/indicatorColor.js";
import TitrationLabColors from "../../TitrationLabColors.js";
import { INDICATOR_STRENGTH } from "../../TitrationLabConstants.js";

const TUBE_WIDTH: number = TUBE_RACK_NODE_SETTINGS.TUBE_WIDTH;
const TUBE_HEIGHT: number = TUBE_RACK_NODE_SETTINGS.TUBE_HEIGHT;
const LIQUID_TOP: number = TUBE_RACK_NODE_SETTINGS.LIQUID_TOP;

function tubeShape(top: number): Shape {
  const radius = TUBE_WIDTH / 2;
  return new Shape()
    .moveTo(0, top)
    .lineTo(0, TUBE_HEIGHT - radius)
    .arc(radius, TUBE_HEIGHT - radius, radius, Math.PI, 0, true)
    .lineTo(TUBE_WIDTH, top);
}

export class TubeRackNode extends Node {
  public constructor(pHProperty: TReadOnlyProperty<number>, indicatorProperty: Property<Indicator>, width: number) {
    super();
    const spacing = width / INDICATORS.length;
    INDICATORS.forEach((indicator, i) => {
      const liquid = new Path(tubeShape(LIQUID_TOP).close(), {});
      const glass = new Path(tubeShape(0), {
        stroke: TitrationLabColors.glassColorProperty,
        lineWidth: TUBE_RACK_NODE_SETTINGS.GLASS_LINE_WIDTH,
      });
      const outline = new Path(tubeShape(-4).close(), {
        stroke: TitrationLabColors.accentColorProperty,
        lineWidth: TUBE_RACK_NODE_SETTINGS.OUTLINE_LINE_WIDTH,
        lineDash: [
          TUBE_RACK_NODE_SETTINGS.OUTLINE_LINE_DASH_DASH,
          TUBE_RACK_NODE_SETTINGS.CONSTRUCTOR_OUTLINE_LINE_DASH_DASH,
        ],
      });
      const name = new Text(indicatorNameProperty(indicator.id), {
        font: SMALL_FONT,
        fill: TitrationLabColors.textColorProperty,
        maxWidth: spacing - TUBE_RACK_NODE_SETTINGS.NAME_MAX_WIDTH_OFFSET,
      });
      name.boundsProperty.link(() => {
        name.centerX = TUBE_WIDTH / 2;
        name.top = TUBE_HEIGHT + TUBE_RACK_NODE_SETTINGS.CONSTRUCTOR_TOP_OFFSET;
      });
      const tube = new Node({
        children: [outline, liquid, glass, name],
        x: i * spacing + (spacing - TUBE_WIDTH) / 2,
        cursor: "pointer",
      });
      tube.addInputListener(
        new PressListener({
          press: () => {
            indicatorProperty.value = indicator;
          },
        }),
      );
      Multilink.multilinkAny([pHProperty, ...SOLUTION_COLOR_DEPENDENCIES], () => {
        liquid.fill = solutionColor(indicator, pHProperty.value, INDICATOR_STRENGTH);
      });
      indicatorProperty.link((selected) => {
        outline.visible = selected === indicator;
      });
      this.addChild(tube);
    });
  }
}
