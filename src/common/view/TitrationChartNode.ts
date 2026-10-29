/**
 * TitrationChartNode.ts
 *
 * pH (0–14) against titrant volume on bamboo, shared by all three screens. The volume range can
 * change (setMaxVolume); grid, ticks and labels follow. Screens draw into the public layers, in
 * the chart's model coordinates via `chartTransform`:
 *
 *   underlayLayer – shading (buffer region, indicator bands), below the curves
 *   plotLayer     – curves
 *   overlayLayer  – markers and cursors
 *
 * Every layer is clipped to the plotting area.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { ChartRectangle, ChartTransform, GridLineSet, TickLabelSet, TickMarkSet } from "scenerystack/bamboo";
import { Range, toFixed } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Orientation } from "scenerystack/phet-core";
import { Node, RichText, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import TitrationLabColors from "../../TitrationLabColors.js";
import { FONT_SIZE, PH_RANGE } from "../../TitrationLabConstants.js";

const PH_TICK = 2;

/** A "nice" tick spacing (1, 2, 2.5 or 5 × 10ⁿ) giving about `count` intervals over `span`. */
export function niceStep(span: number, count: number): number {
  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const nice = [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= raw) ?? 10;
  return nice * magnitude;
}

/** Tick label with just enough decimals for the tick spacing. */
export function tickText(value: number, step: number): string {
  const decimals = [0, 1, 2, 3].find((d) => Math.abs(Number(toFixed(step, d)) - step) < 1e-9) ?? 3;
  return toFixed(value, decimals);
}

export type TitrationChartOptions = {
  /** Title above the chart (RichText). */
  title?: TReadOnlyProperty<string> | null;
  /** y-axis title; pH by default. */
  yAxisTitle?: TReadOnlyProperty<string> | string;
  /** y range; PH_RANGE by default (the species chart uses 0–1). */
  yRange?: Range;
  yTick?: number;
};

export class TitrationChartNode extends Node {
  public readonly chartTransform: ChartTransform;
  public readonly underlayLayer: Node;
  public readonly plotLayer: Node;
  public readonly overlayLayer: Node;
  public readonly chartWidth: number;
  public readonly chartHeight: number;

  private readonly verticalGrid: GridLineSet;
  private readonly xTickMarks: TickMarkSet;
  private readonly xTickLabels: TickLabelSet;

  public constructor(
    chartWidth: number,
    chartHeight: number,
    xAxisTitle: TReadOnlyProperty<string>,
    options?: TitrationChartOptions,
  ) {
    super();
    this.chartWidth = chartWidth;
    this.chartHeight = chartHeight;
    const yRange = options?.yRange ?? PH_RANGE;
    const yTick = options?.yTick ?? PH_TICK;

    this.chartTransform = new ChartTransform({
      viewWidth: chartWidth,
      viewHeight: chartHeight,
      modelXRange: new Range(0, 50),
      modelYRange: yRange,
    });
    const transform = this.chartTransform;
    const tickFont = new PhetFont(FONT_SIZE.tiny);
    const titleFont = new PhetFont(FONT_SIZE.small);
    const xStep = niceStep(50, 5);

    this.verticalGrid = new GridLineSet(transform, Orientation.HORIZONTAL, xStep, {
      stroke: TitrationLabColors.chartGridColorProperty,
    });
    this.xTickMarks = new TickMarkSet(transform, Orientation.HORIZONTAL, xStep, {
      edge: "min",
      stroke: TitrationLabColors.chartAxisColorProperty,
    });
    this.xTickLabels = new TickLabelSet(transform, Orientation.HORIZONTAL, xStep, {
      edge: "min",
      createLabel: (value) =>
        new Text(tickText(value, xStep), { font: tickFont, fill: TitrationLabColors.textColorProperty }),
    });

    this.underlayLayer = new Node();
    this.plotLayer = new Node();
    this.overlayLayer = new Node();
    const clipped = new Node({
      children: [this.underlayLayer, this.plotLayer, this.overlayLayer],
      clipArea: Shape.rect(0, 0, chartWidth, chartHeight),
    });

    const yTitle = new RichText(options?.yAxisTitle ?? "pH", {
      font: titleFont,
      fill: TitrationLabColors.mutedTextColorProperty,
      rotation: -Math.PI / 2,
      maxWidth: chartHeight,
    });
    yTitle.right = -28;
    yTitle.centerY = chartHeight / 2;
    const xTitle = new RichText(xAxisTitle, {
      font: titleFont,
      fill: TitrationLabColors.mutedTextColorProperty,
      maxWidth: chartWidth,
    });
    xTitle.centerX = chartWidth / 2;
    xTitle.top = chartHeight + 18;
    xTitle.boundsProperty.lazyLink(() => {
      xTitle.centerX = chartWidth / 2;
    });

    const children: Node[] = [
      new ChartRectangle(transform, {
        fill: TitrationLabColors.chartBackgroundColorProperty,
        stroke: TitrationLabColors.chartAxisColorProperty,
      }),
      new GridLineSet(transform, Orientation.VERTICAL, yTick, { stroke: TitrationLabColors.chartGridColorProperty }),
      this.verticalGrid,
      clipped,
      new TickMarkSet(transform, Orientation.VERTICAL, yTick, {
        edge: "min",
        stroke: TitrationLabColors.chartAxisColorProperty,
      }),
      new TickLabelSet(transform, Orientation.VERTICAL, yTick, {
        edge: "min",
        createLabel: (value) =>
          new Text(tickText(value, yTick), { font: tickFont, fill: TitrationLabColors.textColorProperty }),
      }),
      this.xTickMarks,
      this.xTickLabels,
      yTitle,
      xTitle,
    ];
    if (options?.title) {
      const title = new RichText(options.title, {
        font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
        fill: TitrationLabColors.textColorProperty,
        maxWidth: chartWidth,
        left: 0,
        bottom: -8,
      });
      title.boundsProperty.lazyLink(() => {
        title.left = 0;
        title.bottom = -8;
      });
      children.push(title);
    }
    this.children = children;
  }

  /** Changes the volume axis to 0…maxVolume (mL) with nice ticks. */
  public setMaxVolume(maxVolume: number): void {
    const step = niceStep(maxVolume, 5);
    this.chartTransform.setModelXRange(new Range(0, maxVolume));
    this.verticalGrid.setSpacing(step);
    this.xTickMarks.setSpacing(step);
    const tickFont = new PhetFont(FONT_SIZE.tiny);
    this.xTickLabels.setCreateLabel(
      (value) => new Text(tickText(value, step), { font: tickFont, fill: TitrationLabColors.textColorProperty }),
    );
    this.xTickLabels.setSpacing(step);
  }
}
