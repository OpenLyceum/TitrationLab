import { describe, expect, it } from "vitest";
import {
  BROMOTHYMOL_BLUE,
  INDICATORS,
  PHENOLPHTHALEIN,
  perceivedColor,
  THYMOL_BLUE,
} from "../../src/common/model/Indicators.js";

describe("indicators", () => {
  it("has one more form than transitions, and each pK_In inside its range", () => {
    for (const indicator of INDICATORS) {
      expect(indicator.forms).toHaveLength(indicator.pKIns.length + 1);
      expect(indicator.ranges).toHaveLength(indicator.pKIns.length);
      indicator.pKIns.forEach((pK, i) => {
        expect(indicator.ranges[i]?.contains(pK)).toBe(true);
      });
    }
  });

  it("names the colour a student sees", () => {
    expect(perceivedColor(PHENOLPHTHALEIN, 7)).toEqual({ color: "colorless", partial: false });
    expect(perceivedColor(PHENOLPHTHALEIN, 8.6)).toEqual({ color: "pink", partial: true });
    expect(perceivedColor(PHENOLPHTHALEIN, 11)).toEqual({ color: "pink", partial: false });
    expect(perceivedColor(BROMOTHYMOL_BLUE, 5)).toEqual({ color: "yellow", partial: false });
    expect(perceivedColor(BROMOTHYMOL_BLUE, 7)).toEqual({ color: "yellow", partial: true });
    expect(perceivedColor(THYMOL_BLUE, 0.5).color).toBe("red");
    expect(perceivedColor(THYMOL_BLUE, 5).color).toBe("yellow");
    expect(perceivedColor(THYMOL_BLUE, 11).color).toBe("blue");
  });
});
