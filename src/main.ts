/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { CurvesScreen } from "./curves/CurvesScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import { IndicatorsScreen } from "./indicators/IndicatorsScreen.js";
import { LabScreen } from "./lab/LabScreen.js";
import { TitrationLabPreferencesModel } from "./preferences/TitrationLabPreferencesModel.js";
import { TitrationLabPreferencesNode } from "./preferences/TitrationLabPreferencesNode.js";
import TitrationLabColors from "./TitrationLabColors.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from titrationLabQueryParameters.
  const simPreferences = new TitrationLabPreferencesModel(Tandem.ROOT.createTandem("preferences"));

  const screens = [
    new LabScreen({
      showReadingProperty: simPreferences.showReadingProperty,
      name: stringManager.getScreenNames().labStringProperty,
      tandem: Tandem.ROOT.createTandem("labScreen"),
      backgroundColorProperty: TitrationLabColors.backgroundColorProperty,
    }),
    new CurvesScreen({
      name: stringManager.getScreenNames().curvesStringProperty,
      tandem: Tandem.ROOT.createTandem("curvesScreen"),
      backgroundColorProperty: TitrationLabColors.backgroundColorProperty,
    }),
    new IndicatorsScreen({
      name: stringManager.getScreenNames().indicatorsStringProperty,
      tandem: Tandem.ROOT.createTandem("indicatorsScreen"),
      backgroundColorProperty: TitrationLabColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new TitrationLabPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "Martin Veillette",
      softwareDevelopment: "Martin Veillette",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
