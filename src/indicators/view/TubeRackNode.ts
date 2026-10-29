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

const TUBE_WIDTH = 30;
const TUBE_HEIGHT = 84;
const LIQUID_TOP = 24;

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
      const glass = new Path(tubeShape(0), { stroke: TitrationLabColors.glassColorProperty, lineWidth: 1.5 });
      const outline = new Path(tubeShape(-4).close(), {
        stroke: TitrationLabColors.accentColorProperty,
        lineWidth: 3,
        lineDash: [4, 3],
      });
      const name = new Text(indicatorNameProperty(indicator.id), {
        font: SMALL_FONT,
        fill: TitrationLabColors.textColorProperty,
        maxWidth: spacing - 6,
      });
      name.boundsProperty.link(() => {
        name.centerX = TUBE_WIDTH / 2;
        name.top = TUBE_HEIGHT + 6;
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
