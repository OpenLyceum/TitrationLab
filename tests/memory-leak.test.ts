/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 *
 * Models, screen views and their panels live for the whole sim. What is created and thrown away
 * at runtime is chart content: every rebuild disposes the old nodes, which link to profile colours
 * and, for TitrationChartNode, to a ChartTransform and a locale-dependent axis title.
 */

import { StringProperty } from "scenerystack/axon";
import { TitrationChartNode } from "../src/common/view/TitrationChartNode.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  {
    name: "TitrationChartNode",
    create: () => new TitrationChartNode(300, 200, new StringProperty("Volume (mL)")),
    idempotentDispose: true,
  },
]);
