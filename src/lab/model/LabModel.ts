/**
 * LabModel.ts
 *
 * A titration at the bench. The student picks a sample (a known analyte, or an unknown acid of
 * hidden identity and concentration), an indicator, and dispenses titrant from a 50 mL burette:
 * continuously through the stopcock, or a drop or half drop at a time. The burette starts at a
 * random reading so the delivered volume is always a difference. With the pH meter in the flask,
 * each change in volume adds a point to the measured curve.
 *
 * Freshly added titrant takes MIXING_TIME_CONSTANT to mix in: until it does, the region where it
 * lands has its own pH (localPHProperty), which the view uses for the colour flash that fades
 * before the endpoint and stays after it.
 *
 * Changing the sample, a concentration or the analyte volume starts a new flask.
 */

import {
  BooleanProperty,
  createObservableArray,
  DerivedProperty,
  Emitter,
  NumberProperty,
  type ObservableArray,
  Property,
  StringUnionProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { dotRandom, Range, toFixed, Vector2 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import {
  ACETIC_ACID,
  type Analyte,
  defaultConcentration,
  isTitratedWithBase,
  titrantMixture,
  UNKNOWN_CANDIDATES,
} from "../../common/model/Analytes.js";
import { mix, solvePH } from "../../common/model/ChargeBalanceSolver.js";
import { type Indicator, PHENOLPHTHALEIN } from "../../common/model/Indicators.js";
import { equivalenceVolumes, flaskMixture, pHAt, type TitrationSetup } from "../../common/model/TitrationCurve.js";
import {
  ANALYTE_CONCENTRATION_RANGE,
  ANSWER_RANGE,
  ANSWER_TOLERANCE,
  BURETTE_CAPACITY,
  DEFAULT_ANALYTE_VOLUME,
  DEFAULT_CONCENTRATION,
  FLASH_THRESHOLD,
  FLOW_RATE_RANGE,
  LOCAL_MIXING_VOLUME,
  MAX_RECORDED_POINTS,
  MIXING_TIME_CONSTANT,
  READING_DECIMALS,
  RECORD_SPACING,
  START_READING_RANGE,
  TITRANT_CONCENTRATION_RANGE,
  UNKNOWN_CONCENTRATION_RANGE,
} from "../../TitrationLabConstants.js";
import TitrationLabNamespace from "../../TitrationLabNamespace.js";

/** The sample choice: a known analyte or the unknown acid. */
export const UNKNOWN = "unknown";
export type LabSample = Analyte | typeof UNKNOWN;

export const ANSWER_RESULTS = ["none", "correct", "tooHigh", "tooLow"] as const;
export type AnswerResult = (typeof ANSWER_RESULTS)[number];

/** A burette reading as a student records it (0.01 mL). */
export function roundReading(reading: number): number {
  return Number(toFixed(reading, READING_DECIMALS));
}

export class LabModel implements TModel {
  public readonly sampleProperty: Property<LabSample>;
  public readonly analyteConcentrationProperty: NumberProperty;
  public readonly analyteVolumeProperty: NumberProperty;
  public readonly titrantConcentrationProperty: NumberProperty;
  public readonly indicatorProperty: Property<Indicator | null>;

  public readonly meterInFlaskProperty = new BooleanProperty(false);
  public readonly showCalculatedCurveProperty = new BooleanProperty(false);
  public readonly showEquivalenceProperty = new BooleanProperty(false);

  /** Stopcock opening as a flow rate (mL/s). */
  public readonly flowRateProperty = new NumberProperty(0, { range: FLOW_RATE_RANGE });
  /** Burette reading (mL from the 0.00 mark at the top). */
  public readonly buretteReadingProperty: NumberProperty;
  /** Titrant delivered into this flask (mL). */
  public readonly titrantAddedProperty = new NumberProperty(0);
  /** Titrant still mixing in where it landed (mL). */
  public readonly localExcessProperty = new NumberProperty(0);

  /** The unknown sample, drawn again by newUnknown(). */
  public readonly unknownProperty: Property<{ analyte: Analyte; concentration: number }>;

  /** What is actually in the flask (the unknown resolved). */
  public readonly setupProperty: TReadOnlyProperty<TitrationSetup>;
  public readonly pHProperty: TReadOnlyProperty<number>;
  public readonly localPHProperty: TReadOnlyProperty<number>;
  public readonly buretteEmptyProperty: TReadOnlyProperty<boolean>;

  /** Recorded readings for the notebook (mL, to 0.01). */
  public readonly readings: ObservableArray<number> = createObservableArray();

  /** Measured (volume, pH) points while the meter is in the flask. */
  public readonly measuredPoints: Vector2[] = [];
  public readonly measuredPointsChangedEmitter = new Emitter();
  /** Sample spacing grows when history is thinned, so the whole run stays bounded. */
  private recordSpacing = RECORD_SPACING;

  /** The student's answer for the unknown (mol/L) and the result of checking it. */
  public readonly answerProperty = new NumberProperty(DEFAULT_CONCENTRATION, { range: ANSWER_RANGE });
  public readonly answerResultProperty = new StringUnionProperty<AnswerResult>("none", { validValues: ANSWER_RESULTS });

  public constructor() {
    this.sampleProperty = new Property<LabSample>(ACETIC_ACID);
    this.analyteConcentrationProperty = new NumberProperty(DEFAULT_CONCENTRATION, {
      range: ANALYTE_CONCENTRATION_RANGE,
    });
    this.analyteVolumeProperty = new NumberProperty(DEFAULT_ANALYTE_VOLUME);
    this.titrantConcentrationProperty = new NumberProperty(DEFAULT_CONCENTRATION, {
      range: TITRANT_CONCENTRATION_RANGE,
    });
    this.indicatorProperty = new Property<Indicator | null>(PHENOLPHTHALEIN);
    this.buretteReadingProperty = new NumberProperty(randomStartReading(), {
      range: new Range(0, BURETTE_CAPACITY),
    });
    this.unknownProperty = new Property(randomUnknown());

    this.setupProperty = new DerivedProperty(
      [
        this.sampleProperty,
        this.analyteConcentrationProperty,
        this.analyteVolumeProperty,
        this.titrantConcentrationProperty,
        this.unknownProperty,
      ],
      (sample, concentration, analyteVolume, titrantConcentration, unknown) => ({
        analyte: sample === UNKNOWN ? unknown.analyte : sample,
        analyteConcentration: sample === UNKNOWN ? unknown.concentration : concentration,
        analyteVolume,
        titrantConcentration,
      }),
    );
    this.pHProperty = new DerivedProperty([this.setupProperty, this.titrantAddedProperty], pHAt);
    this.localPHProperty = new DerivedProperty(
      [this.setupProperty, this.titrantAddedProperty, this.localExcessProperty],
      (setup, added, excess) =>
        solvePH(
          mix(
            flaskMixture(setup, added),
            LOCAL_MIXING_VOLUME,
            titrantMixture(setup.analyte.titrant, setup.titrantConcentration),
            excess,
          ),
        ),
    );
    this.buretteEmptyProperty = new DerivedProperty(
      [this.buretteReadingProperty],
      (reading) => reading >= BURETTE_CAPACITY - 1e-9,
    );

    // A new sample starts at its own default concentration.
    this.sampleProperty.lazyLink((sample) => {
      if (sample !== UNKNOWN) {
        this.analyteConcentrationProperty.value = defaultConcentration(sample);
      }
    });
    // Anything that changes what is in the flask starts a new one.
    this.setupProperty.lazyLink(() => this.newFlask());
    this.meterInFlaskProperty.lazyLink((meterIn) => {
      if (meterIn) {
        this.recordPoint(true);
      }
    });
  }

  /** The unknown is being titrated. */
  public get isUnknown(): boolean {
    return this.sampleProperty.value === UNKNOWN;
  }

  /**
   * Volume axis of the chart: room past the last endpoint (kept to one burette when the endpoint
   * fits in one), or the whole burette for an unknown. Refills can carry the titrant past that, so
   * the axis then grows a burette at a time to keep every measured point on the chart.
   */
  public chartMaxVolume(): number {
    const delivered = Math.ceil(this.titrantAddedProperty.value / BURETTE_CAPACITY) * BURETTE_CAPACITY;
    if (this.isUnknown) {
      return Math.max(BURETTE_CAPACITY, delivered);
    }
    const volumes = equivalenceVolumes(this.setupProperty.value);
    const last = volumes[volumes.length - 1] as number;
    const roomy = Math.max(10, Math.ceil((1.5 * last) / 5) * 5);
    return Math.max(last < BURETTE_CAPACITY ? Math.min(BURETTE_CAPACITY, roomy) : roomy, delivered);
  }

  /** Empties the flask and pipettes in a fresh sample; the burette keeps its level. */
  public newFlask(): void {
    this.flowRateProperty.value = 0;
    this.titrantAddedProperty.value = 0;
    this.localExcessProperty.value = 0;
    this.readings.clear();
    this.measuredPoints.length = 0;
    this.recordSpacing = RECORD_SPACING;
    this.answerResultProperty.value = "none";
    this.recordPoint(true);
    this.measuredPointsChangedEmitter.emit();
  }

  /** Delivers up to `volume` mL from the burette; returns what was delivered. */
  public dispense(volume: number): number {
    const delivered = Math.min(volume, BURETTE_CAPACITY - this.buretteReadingProperty.value);
    if (delivered <= 0) {
      return 0;
    }
    this.buretteReadingProperty.value += delivered;
    this.titrantAddedProperty.value += delivered;
    this.localExcessProperty.value += delivered;
    this.recordPoint(false);
    return delivered;
  }

  /** Refills the burette to a new random reading near the top. */
  public refill(): void {
    this.buretteReadingProperty.value = randomStartReading();
  }

  /** Writes the current burette reading in the notebook. */
  public recordReading(): number {
    const reading = roundReading(this.buretteReadingProperty.value);
    this.readings.push(reading);
    return reading;
  }

  /** Draws a new unknown sample (which also starts a new flask). */
  public newUnknown(): void {
    this.unknownProperty.value = randomUnknown();
  }

  /** Compares the answer with the unknown's concentration. */
  public checkAnswer(): AnswerResult {
    const actual = this.unknownProperty.value.concentration;
    const answer = this.answerProperty.value;
    const result: AnswerResult =
      Math.abs(answer - actual) <= ANSWER_TOLERANCE * actual ? "correct" : answer > actual ? "tooHigh" : "tooLow";
    this.answerResultProperty.value = result;
    return result;
  }

  /** True when the titrant raises the pH. */
  public get titratedWithBase(): boolean {
    return isTitratedWithBase(this.setupProperty.value.analyte);
  }

  private recordPoint(force: boolean): void {
    if (!this.meterInFlaskProperty.value) {
      return;
    }
    const volume = this.titrantAddedProperty.value;
    const last = this.measuredPoints[this.measuredPoints.length - 1];
    if (!force && last && volume - last.x < this.recordSpacing) {
      return;
    }
    if (last && Math.abs(volume - last.x) < 1e-12) {
      return;
    }
    this.measuredPoints.push(new Vector2(volume, this.pHProperty.value));
    if (this.measuredPoints.length > MAX_RECORDED_POINTS) {
      const kept = this.measuredPoints.filter((_point, i) => i % 2 === 0 || i === this.measuredPoints.length - 1);
      this.measuredPoints.length = 0;
      this.measuredPoints.push(...kept);
      this.recordSpacing *= 2;
    }
    this.measuredPointsChangedEmitter.emit();
  }

  public reset(): void {
    this.sampleProperty.reset();
    this.analyteConcentrationProperty.reset();
    this.analyteVolumeProperty.reset();
    this.titrantConcentrationProperty.reset();
    this.indicatorProperty.reset();
    this.meterInFlaskProperty.reset();
    this.showCalculatedCurveProperty.reset();
    this.showEquivalenceProperty.reset();
    this.answerProperty.reset();
    this.buretteReadingProperty.value = randomStartReading();
    this.newFlask();
  }

  public step(dt: number): void {
    const flow = this.flowRateProperty.value;
    if (flow > 0) {
      if (this.dispense(flow * dt) === 0) {
        this.flowRateProperty.value = 0;
      }
    }
    const excess = this.localExcessProperty.value;
    if (excess > 0) {
      const decayed = excess * Math.exp(-dt / MIXING_TIME_CONSTANT);
      this.localExcessProperty.value = decayed < FLASH_THRESHOLD / 10 ? 0 : decayed;
    }
  }
}

function randomStartReading(): number {
  return roundReading(dotRandom.nextDoubleBetween(START_READING_RANGE.min, START_READING_RANGE.max));
}

function randomUnknown(): { analyte: Analyte; concentration: number } {
  return {
    analyte: dotRandom.sample([...UNKNOWN_CANDIDATES]),
    concentration: Number(
      toFixed(dotRandom.nextDoubleBetween(UNKNOWN_CONCENTRATION_RANGE.min, UNKNOWN_CONCENTRATION_RANGE.max), 4),
    ),
  };
}

TitrationLabNamespace.register("LabModel", LabModel);
