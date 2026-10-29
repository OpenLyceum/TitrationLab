/**
 * IndicatorsModel.ts
 *
 * How indicators work and how to choose one. A pH slider sets a test solution's pH; every
 * indicator is shown at that pH, and the selected one is broken down into its forms. Separately,
 * a titration is chosen and every indicator's endpoint in it is computed (see
 * TitrationCurve.bestEndpoint), so the choice can be judged by its error and sharpness.
 */

import { DerivedProperty, NumberProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { ACETIC_ACID, ANALYTES, type Analyte, defaultConcentration } from "../../common/model/Analytes.js";
import { BROMOTHYMOL_BLUE, INDICATORS, type Indicator } from "../../common/model/Indicators.js";
import {
  bestEndpoint,
  type EndpointResult,
  equivalenceVolumes,
  type TitrationSetup,
} from "../../common/model/TitrationCurve.js";
import {
  DEFAULT_ANALYTE_VOLUME,
  DEFAULT_CONCENTRATION,
  GOOD_ENDPOINT_ERROR,
  PH_RANGE,
  SHARP_CHANGE_SPAN,
} from "../../TitrationLabConstants.js";
import TitrationLabNamespace from "../../TitrationLabNamespace.js";

export type EndpointRating = {
  readonly indicator: Indicator;
  readonly endpoint: EndpointResult | null;
  /** Small error and a sharp change. */
  readonly good: boolean;
};

export class IndicatorsModel implements TModel {
  public readonly pHProperty = new NumberProperty(7, { range: PH_RANGE });
  public readonly indicatorProperty = new Property<Indicator>(BROMOTHYMOL_BLUE, { validValues: INDICATORS });
  public readonly titrationAnalyteProperty = new Property<Analyte>(ACETIC_ACID, { validValues: ANALYTES });

  public readonly setupProperty: TReadOnlyProperty<TitrationSetup>;
  public readonly maxVolumeProperty: TReadOnlyProperty<number>;
  public readonly ratingsProperty: TReadOnlyProperty<EndpointRating[]>;

  public constructor() {
    this.setupProperty = new DerivedProperty([this.titrationAnalyteProperty], (analyte) => ({
      analyte,
      analyteConcentration: defaultConcentration(analyte),
      analyteVolume: DEFAULT_ANALYTE_VOLUME,
      titrantConcentration: DEFAULT_CONCENTRATION,
    }));
    this.maxVolumeProperty = new DerivedProperty(
      [this.setupProperty],
      (setup) => 1.6 * (equivalenceVolumes(setup).at(-1) as number),
    );
    this.ratingsProperty = new DerivedProperty([this.setupProperty, this.maxVolumeProperty], (setup, maxVolume) => {
      const equivalences = equivalenceVolumes(setup);
      return INDICATORS.map((indicator) => {
        const endpoint = bestEndpoint(setup, indicator, maxVolume);
        const reference = endpoint ? (equivalences[endpoint.equivalenceIndex - 1] as number) : 1;
        const good =
          endpoint !== null &&
          Math.abs(endpoint.error) <= GOOD_ENDPOINT_ERROR * reference &&
          endpoint.span <= SHARP_CHANGE_SPAN * reference;
        return { indicator, endpoint, good };
      });
    });
  }

  public reset(): void {
    this.pHProperty.reset();
    this.indicatorProperty.reset();
    this.titrationAnalyteProperty.reset();
  }

  public step(_dt: number): void {
    // Nothing moves on its own.
  }
}

TitrationLabNamespace.register("IndicatorsModel", IndicatorsModel);
