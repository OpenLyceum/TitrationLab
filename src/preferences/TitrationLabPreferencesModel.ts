/**
 * TitrationLabPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in titrationLabQueryParameters.
 *
 * Remove the example preference (and its query parameter / UI control) if the
 * sim has no sim-specific preferences.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import TitrationLabNamespace from "../TitrationLabNamespace.js";
import titrationLabQueryParameters from "./titrationLabQueryParameters.js";

export class TitrationLabPreferencesModel {
  /** Show the burette reading as a number beside the burette; initial value from the `showReading` query parameter. */
  public readonly showReadingProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.showReadingProperty = new BooleanProperty(
      titrationLabQueryParameters.showReading,
      tandem ? { tandem: tandem.createTandem("showReadingProperty") } : undefined,
    );
  }

  public reset(): void {
    this.showReadingProperty.reset();
  }
}

TitrationLabNamespace.register("TitrationLabPreferencesModel", TitrationLabPreferencesModel);
