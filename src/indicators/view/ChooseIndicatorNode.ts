/**
 * ChooseIndicatorNode.ts
 *
 * Choosing an indicator for a titration: the titration curve with the selected indicator's
 * colour-change range as a band and its endpoint marked, and a table rating every indicator by
 * its endpoint error (endpoint − equivalence) and how sharply its colour changes. Clicking a row
 * selects that indicator.
 */

import { DerivedProperty, Multilink, type Property } from "scenerystack/axon";
import { LinePlot } from "scenerystack/bamboo";
import { Bounds2 } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { AlignBox, Circle, HBox, Line, Node, PressListener, Rectangle, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import type { Indicator } from "../../common/model/Indicators.js";
import { equivalenceVolumes, pHAt, sampleCurve } from "../../common/model/TitrationCurve.js";
import { disposeChildren } from "../../common/view/disposeChildren.js";
import { fixed, formatVolume, indicatorNameProperty, volumeAxisTitle } from "../../common/view/formatValues.js";
import { FORM_COLOR_PROPERTIES } from "../../common/view/indicatorColor.js";
import { TitrationChartNode } from "../../common/view/TitrationChartNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import TitrationLabColors from "../../TitrationLabColors.js";
import { FONT_SIZE } from "../../TitrationLabConstants.js";
import type { IndicatorsModel } from "../model/IndicatorsModel.js";

const COLUMN_WIDTHS = [130, 80, 80, 60];
const ROW_HEIGHT = 17;
const BAND_OPACITY = 0.35;

export class ChooseIndicatorNode extends VBox {
  public constructor(
    model: IndicatorsModel,
    indicatorProperty: Property<Indicator>,
    chartWidth: number,
    chartHeight: number,
  ) {
    const common = StringManager.getInstance().getCommonStrings();
    const strings = StringManager.getInstance().getIndicatorsStrings();
    const xTitleProperty = new DerivedProperty([model.setupProperty, common.volumeAxisPatternStringProperty], (setup) =>
      volumeAxisTitle(setup.analyte),
    );
    const chart = new TitrationChartNode(chartWidth, chartHeight, xTitleProperty);
    const transform = chart.chartTransform;
    const bands = new Node();
    chart.underlayLayer.addChild(bands);
    const curve = new LinePlot(transform, [], { stroke: TitrationLabColors.curveColorProperty, lineWidth: 2.5 });
    chart.plotLayer.addChild(curve);
    const markers = new Node();
    chart.overlayLayer.addChild(markers);

    const table = new VBox({ align: "left", spacing: 1 });
    const cell = (text: string, column: number, bold = false, fill = TitrationLabColors.textColorProperty): Node =>
      new AlignBox(
        new Text(text, {
          font: new PhetFont({ size: FONT_SIZE.small, weight: bold ? "bold" : "normal" }),
          fill,
          maxWidth: (COLUMN_WIDTHS[column] as number) - 6,
        }),
        { alignBounds: new Bounds2(0, 0, COLUMN_WIDTHS[column] as number, ROW_HEIGHT), xAlign: "left" },
      );

    super({ align: "left", spacing: 34, children: [chart, table] });

    Multilink.multilinkAny(
      [
        model.setupProperty,
        model.maxVolumeProperty,
        model.ratingsProperty,
        indicatorProperty,
        strings.goodStringProperty,
        ...Object.values(FORM_COLOR_PROPERTIES),
      ],
      () => {
        const setup = model.setupProperty.value;
        const maxVolume = model.maxVolumeProperty.value;
        const indicator = indicatorProperty.value;
        chart.setMaxVolume(maxVolume);
        curve.setDataSet(sampleCurve(setup, maxVolume));

        disposeChildren(bands);
        bands.children = indicator.ranges.map((range, i) => {
          const top = transform.modelToViewY(range.max);
          const bottom = transform.modelToViewY(range.min);
          return new Rectangle(0, top, chartWidth, bottom - top, {
            fill: FORM_COLOR_PROPERTIES[
              indicator.forms[i + 1] === "colorless" ? "pink" : (indicator.forms[i + 1] ?? "pink")
            ],
            opacity: BAND_OPACITY,
          });
        });

        disposeChildren(markers);
        const nodes: Node[] = equivalenceVolumes(setup).map((volume) => {
          const x = transform.modelToViewX(volume);
          return new Line(x, 0, x, chartHeight, {
            stroke: TitrationLabColors.equivalenceColorProperty,
            lineDash: [4, 3],
          });
        });
        const rating = model.ratingsProperty.value.find((r) => r.indicator === indicator);
        if (rating?.endpoint) {
          nodes.push(
            new Circle(5, {
              fill: rating.good ? TitrationLabColors.goodColorProperty : TitrationLabColors.poorColorProperty,
              stroke: TitrationLabColors.textColorProperty,
              center: transform.modelToViewXY(rating.endpoint.volume, pHAt(setup, rating.endpoint.volume)),
            }),
          );
        }
        markers.children = nodes;

        // Table.
        disposeChildren(table);
        const header = new HBox({
          children: [
            cell("", 0),
            cell(strings.endpointColumnStringProperty.value, 1, true),
            cell(strings.errorColumnStringProperty.value, 2, true),
            cell(strings.verdictColumnStringProperty.value, 3, true),
          ],
        });
        const rows = model.ratingsProperty.value.map((r) => {
          const selected = r.indicator === indicator;
          const fill = selected ? TitrationLabColors.accentColorProperty : TitrationLabColors.textColorProperty;
          const endpoint = r.endpoint;
          const row = new HBox({
            cursor: "pointer",
            children: [
              cell(indicatorNameProperty(r.indicator.id).value, 0, selected, fill),
              cell(
                endpoint ? `${formatVolume(endpoint.volume)} mL` : strings.notReachedStringProperty.value,
                1,
                false,
                fill,
              ),
              cell(
                endpoint
                  ? `${endpoint.error >= 0 ? "+" : ""}${fixed(endpoint.error, 2)} mL`
                  : strings.notReachedStringProperty.value,
                2,
                false,
                fill,
              ),
              cell(
                r.good ? strings.goodStringProperty.value : strings.poorStringProperty.value,
                3,
                true,
                r.good ? TitrationLabColors.goodColorProperty : TitrationLabColors.poorColorProperty,
              ),
            ],
          });
          row.addInputListener(
            new PressListener({
              press: () => {
                indicatorProperty.value = r.indicator;
              },
            }),
          );
          return row;
        });
        table.children = [header, ...rows];

        // The table read as sentences, one per indicator.
        const a11y = StringManager.getInstance().getIndicatorsA11yStrings();
        this.accessibleParagraph = model.ratingsProperty.value
          .map((r) => {
            const name = indicatorNameProperty(r.indicator.id).value;
            return r.endpoint
              ? StringUtils.fillIn(a11y.endpointRowPatternStringProperty.value, {
                  indicator: name,
                  volume: formatVolume(r.endpoint.volume),
                  error: fixed(r.endpoint.error, 2),
                  verdict: r.good ? strings.goodStringProperty.value : strings.poorStringProperty.value,
                })
              : StringUtils.fillIn(a11y.endpointNotReachedPatternStringProperty.value, { indicator: name });
          })
          .join(" ");
      },
    );
  }
}
