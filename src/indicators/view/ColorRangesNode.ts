import { COLOR_RANGES_NODE_SETTINGS } from "../../TitrationLabConstants.js";
/**
 * ColorRangesNode.ts
 *
 * Each indicator's colour across pH 0–14 as a strip, with its transition ranges bracketed and a
 * line at the chosen pH. The strip is the same colour mixing as the tubes, so the bands show
 * where the colour visibly changes rather than a hand-drawn bar.
 */

import { Multilink, type Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Line, LinearGradient, Node, PressListener, Rectangle, Text } from "scenerystack/scenery";
import { INDICATORS, type Indicator } from "../../common/model/Indicators.js";
import { heading, SMALL_FONT } from "../../common/view/ControlFactory.js";
import { indicatorNameProperty } from "../../common/view/formatValues.js";
import { SOLUTION_COLOR_DEPENDENCIES, solutionColor } from "../../common/view/indicatorColor.js";
import { StringManager } from "../../i18n/StringManager.js";
import TitrationLabColors from "../../TitrationLabColors.js";
import { INDICATOR_STRENGTH, PH_RANGE } from "../../TitrationLabConstants.js";

const NAME_WIDTH: number = COLOR_RANGES_NODE_SETTINGS.NAME_WIDTH;
const ROW_HEIGHT: number = COLOR_RANGES_NODE_SETTINGS.ROW_HEIGHT;
const ROW_SPACING: number = COLOR_RANGES_NODE_SETTINGS.ROW_SPACING;
const PH_STEP: number = COLOR_RANGES_NODE_SETTINGS.PH_STEP;

export class ColorRangesNode extends Node {
  public constructor(pHProperty: TReadOnlyProperty<number>, indicatorProperty: Property<Indicator>, width: number) {
    super();
    const strings = StringManager.getInstance().getIndicatorsStrings();
    const stripWidth = width - NAME_WIDTH;
    const xOf = (pH: number): number => NAME_WIDTH + (stripWidth * (pH - PH_RANGE.min)) / PH_RANGE.getLength();
    const title = heading(strings.rangesHeadingStringProperty, width);
    const top: number = COLOR_RANGES_NODE_SETTINGS.TOP;
    const rowsHeight = INDICATORS.length * (ROW_HEIGHT + ROW_SPACING);
    this.addChild(title);

    INDICATORS.forEach((indicator, i) => {
      const y = top + i * (ROW_HEIGHT + ROW_SPACING);
      const name = new Text(indicatorNameProperty(indicator.id), {
        font: SMALL_FONT,
        fill: TitrationLabColors.textColorProperty,
        maxWidth: NAME_WIDTH - COLOR_RANGES_NODE_SETTINGS.NAME_MAX_WIDTH_OFFSET,
        left: 0,
        centerY: y + ROW_HEIGHT / 2,
      });
      const strip = new Rectangle(xOf(PH_RANGE.min), y, stripWidth, ROW_HEIGHT, {
        stroke: TitrationLabColors.glassColorProperty,
        lineWidth: COLOR_RANGES_NODE_SETTINGS.STRIP_LINE_WIDTH,
      });
      const brackets = new Node({
        children: indicator.ranges.map(
          (range) =>
            new Rectangle(xOf(range.min), y - 2, xOf(range.max) - xOf(range.min), ROW_HEIGHT + 4, {
              stroke: TitrationLabColors.textColorProperty,
              lineWidth: 1,
            }),
        ),
      });
      const row = new Node({ children: [name, strip, brackets], cursor: "pointer" });
      row.addInputListener(
        new PressListener({
          press: () => {
            indicatorProperty.value = indicator;
          },
        }),
      );
      Multilink.multilinkAny([...SOLUTION_COLOR_DEPENDENCIES], () => {
        const gradient = new LinearGradient(xOf(PH_RANGE.min), 0, xOf(PH_RANGE.max), 0);
        for (let pH = PH_RANGE.min; pH <= PH_RANGE.max + 1e-9; pH += PH_STEP) {
          gradient.addColorStop(
            (pH - PH_RANGE.min) / PH_RANGE.getLength(),
            solutionColor(indicator, pH, INDICATOR_STRENGTH),
          );
        }
        strip.fill = gradient;
      });
      indicatorProperty.link((selected) => {
        name.fill =
          selected === indicator ? TitrationLabColors.accentColorProperty : TitrationLabColors.textColorProperty;
        name.fontWeight = selected === indicator ? "bold" : "normal";
      });
      this.addChild(row);
    });

    // pH axis.
    const axisY = top + rowsHeight + 2;
    for (let pH = PH_RANGE.min; pH <= PH_RANGE.max; pH += 2) {
      this.addChild(
        new Line(xOf(pH), axisY, xOf(pH), axisY + 4, { stroke: TitrationLabColors.chartAxisColorProperty }),
      );
      this.addChild(
        new Text(String(pH), {
          font: SMALL_FONT,
          fill: TitrationLabColors.textColorProperty,
          centerX: xOf(pH),
          top: axisY + COLOR_RANGES_NODE_SETTINGS.CONSTRUCTOR_TOP_OFFSET,
        }),
      );
    }
    this.addChild(
      new Text("pH", {
        font: SMALL_FONT,
        fill: TitrationLabColors.mutedTextColorProperty,
        right: NAME_WIDTH - COLOR_RANGES_NODE_SETTINGS.CONSTRUCTOR_RIGHT_OFFSET,
        top: axisY + COLOR_RANGES_NODE_SETTINGS.CONSTRUCTOR_TOP_OFFSET,
      }),
    );

    const cursor = new Line(0, top - 6, 0, axisY, {
      stroke: TitrationLabColors.cursorColorProperty,
      lineWidth: COLOR_RANGES_NODE_SETTINGS.CURSOR_LINE_WIDTH,
    });
    pHProperty.link((pH) => {
      cursor.setLine(xOf(pH), top - 6, xOf(pH), axisY);
    });
    this.addChild(cursor);
  }
}
