import { SPECIES_CHART_NODE_SETTINGS } from "../../TitrationLabConstants.js";
/**
 * SpeciesChartNode.ts
 *
 * Fraction of each form of the weak system against titrant volume, on the same volume axis as the
 * titration curve, with a legend of the forms' formulas and the cursor line. A strong acid or
 * base has no weak system, so a note replaces the curves.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { LinePlot } from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { HBox, Line, Node, RichText, Text } from "scenerystack/scenery";
import { isStrong } from "../../common/model/Analytes.js";
import { alphaFractions } from "../../common/model/ChargeBalanceSolver.js";
import { pHAt } from "../../common/model/TitrationCurve.js";
import { SMALL_FONT } from "../../common/view/ControlFactory.js";
import { disposeChildren } from "../../common/view/disposeChildren.js";
import { TitrationChartNode } from "../../common/view/TitrationChartNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import TitrationLabColors from "../../TitrationLabColors.js";
import type { CurvesModel } from "../model/CurvesModel.js";
import { SPECIES_COLORS } from "./speciesColors.js";

const SAMPLES: number = SPECIES_CHART_NODE_SETTINGS.SAMPLES;

export class SpeciesChartNode extends Node {
  public constructor(
    model: CurvesModel,
    chartWidth: number,
    chartHeight: number,
    xAxisTitleProperty: TReadOnlyProperty<string>,
  ) {
    super();
    const strings = StringManager.getInstance().getCurvesStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const chart = new TitrationChartNode(chartWidth, chartHeight, xAxisTitleProperty, {
      title: strings.speciesFractionsStringProperty,
      yAxisTitle: common.fractionAxisStringProperty,
      yRange: new Range(0, 1),
      yTick: 0.5,
    });
    const plots = SPECIES_COLORS.map(
      (color) =>
        new LinePlot(chart.chartTransform, [], {
          stroke: color,
          lineWidth: SPECIES_CHART_NODE_SETTINGS.PLOTS_LINE_WIDTH,
        }),
    );
    chart.plotLayer.children = plots;
    const cursor = new Line(0, 0, 0, chartHeight, {
      stroke: TitrationLabColors.cursorColorProperty,
      lineWidth: SPECIES_CHART_NODE_SETTINGS.CURSOR_LINE_WIDTH,
    });
    chart.overlayLayer.addChild(cursor);
    const note = new Text(strings.strongNoSpeciesStringProperty, {
      font: SMALL_FONT,
      fill: TitrationLabColors.mutedTextColorProperty,
      maxWidth: chartWidth - SPECIES_CHART_NODE_SETTINGS.NOTE_MAX_WIDTH_OFFSET,
    });
    note.boundsProperty.link(() => {
      note.center = chart.localToParentPoint(new Vector2(chartWidth / 2, chartHeight / 2));
    });
    const legend = new HBox({ spacing: SPECIES_CHART_NODE_SETTINGS.LEGEND_SPACING });
    this.children = [chart, note, legend];

    Multilink.multilink([model.setupProperty, model.maxVolumeProperty], (setup, maxVolume) => {
      chart.setMaxVolume(maxVolume);
      const strong = isStrong(setup.analyte);
      note.visible = strong;
      const volumes = Array.from({ length: SAMPLES + 1 }, (_, i) => (maxVolume * i) / SAMPLES);
      const fractions = volumes.map((volume) => alphaFractions(pHAt(setup, volume), setup.analyte.pKas));
      plots.forEach((plot, j) => {
        plot.setDataSet(
          strong || j > setup.analyte.pKas.length
            ? []
            : volumes.map((volume, i) => new Vector2(volume, fractions[i]?.[j] as number)),
        );
      });
      disposeChildren(legend);
      legend.children = strong
        ? []
        : setup.analyte.species.map(
            (formula, j) =>
              new HBox({
                spacing: SPECIES_CHART_NODE_SETTINGS.CHILDREN_SPACING,
                children: [
                  new Line(0, 0, SPECIES_CHART_NODE_SETTINGS.CHILDREN_END_X, 0, {
                    stroke: SPECIES_COLORS[j] ?? TitrationLabColors.curveColorProperty,
                    lineWidth: SPECIES_CHART_NODE_SETTINGS.CHILDREN_LINE_WIDTH,
                  }),
                  new RichText(formula, { font: SMALL_FONT, fill: TitrationLabColors.textColorProperty }),
                ],
              }),
          );
      legend.right = chartWidth;
      legend.bottom = SPECIES_CHART_NODE_SETTINGS.LEGEND_BOTTOM;
    });

    Multilink.multilink([model.volumeProperty, model.maxVolumeProperty], (volume) => {
      const x = chart.chartTransform.modelToViewX(volume);
      cursor.setLine(x, 0, x, chartHeight);
    });
  }
}
