import { expect, type Page, test } from "@playwright/test";
import type { Node, RichText, Text } from "scenerystack/scenery";
import type { ScreenView } from "scenerystack/sim";
import type { CurvesModel } from "../../src/curves/model/CurvesModel.js";

type SimulationWindow = {
  phet: {
    joist: {
      localeProperty: { value: string };
      sim: {
        selectedScreenProperty: { value: { model: CurvesModel; view: ScreenView } };
        display: { updateDisplay(): void };
      };
    };
  };
};

async function ready(page: Page, locale = "en") {
  await page.goto(`/?screens=2&ea&locale=${locale}`);
  await page.locator("h1").first().waitFor();
}

function readout(page: Page) {
  return page.evaluate(() => {
    const screen = (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value;
    const strings: string[] = [];
    const visit = (node: Node, inside = false): void => {
      const inReadout = inside || node.constructor.name === "CursorReadoutNode";
      if (inReadout && (node.constructor.name === "Text" || node.constructor.name === "RichText")) {
        strings.push((node as Text | RichText).string);
      }
      for (const child of node.children) {
        visit(child, inReadout);
      }
    };
    visit(screen.view);
    return { strings, volume: screen.model.volumeProperty.value, pH: screen.model.pHProperty.value };
  });
}

test("keyboard movement near equivalence uses the actual excess; the key-point shortcut stays neutral", async ({
  page,
}) => {
  await ready(page);
  await page.evaluate(() => {
    const model = (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value.model;
    model.analyteProperty.value = model.analyteProperty.validValues!.find((a) => a.id === "hydrochloricAcid")!;
    model.cursorFractionProperty.value = 0.496;
  });
  await page.getByRole("checkbox", { name: "Show equations", exact: true }).press("Space");
  await page.getByRole("slider").first().focus();
  await page.keyboard.press("Shift+ArrowRight");
  const near = await readout(page);
  expect(near.volume).toBeCloseTo(24.9, 8);
  expect(near.pH).toBeCloseTo(3.6981, 4);
  expect(near.strings).toContain("Approximation: pH ≈ 3.70");
  expect(near.strings).not.toContain("Only spectator ions: pH = 7.00");
  await page.keyboard.press("k");
  const exact = await readout(page);
  expect(exact.volume).toBe(25);
  expect(exact.strings).toContain("Only spectator ions: pH = 7.00");
});

for (const [locale, explanation] of [
  ["en", "Use the full acid–base charge balance, including water."],
  ["fr", "Utiliser le bilan complet des charges acido-basiques, y compris l'eau."],
  ["es", "Usar el balance completo de cargas ácido-base, incluida el agua."],
] as const) {
  test(`phosphoric acid beyond the second marker explains the full balance in ${locale}`, async ({ page }) => {
    await ready(page, locale);
    await page.evaluate(() => {
      const model = (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value.model;
      model.analyteProperty.value = model.analyteProperty.validValues!.find((a) => a.id === "phosphoricAcid")!;
      model.cursorFractionProperty.value = 0.625;
      model.showEquationsProperty.value = true;
    });
    const result = await readout(page);
    expect(result.volume).toBe(62.5);
    expect(result.pH).toBeCloseTo(11.873081, 5);
    expect(result.strings).toContain(explanation);
    expect(result.strings.some((text) => text.includes("12.15"))).toBe(false);
  });
}

test("runtime locale changes refresh equations, region and slider description without moving the cursor", async ({
  page,
}) => {
  await ready(page);
  await page.evaluate(() => {
    const model = (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value.model;
    model.showEquationsProperty.value = true;
    model.cursorFractionProperty.value = 0.1;
  });
  const before = await readout(page);
  const slider = page.getByRole("slider").first();
  await slider.focus();
  for (const [locale, region, ratio, approximation] of [
    ["fr", "Zone tampon", "mol de base ÷ mol d'acide", "Approximation : pH ≈ 4.14"],
    ["es", "Región amortiguadora", "mol de base ÷ mol de ácido", "Aproximación: pH ≈ 4.14"],
    ["en", "Buffer region", "mol base ÷ mol acid", "Approximation: pH ≈ 4.14"],
  ] as const) {
    await page.evaluate((language) => {
      (window as unknown as SimulationWindow).phet.joist.localeProperty.value = language;
    }, locale);
    await expect.poll(async () => (await readout(page)).strings).toContain(region);
    const after = await readout(page);
    expect(after.volume).toBe(before.volume);
    expect(after.pH).toBe(before.pH);
    expect(after.strings.some((text) => text.includes(ratio))).toBe(true);
    expect(after.strings).toContain(approximation);
    await expect(slider).toHaveAttribute("aria-valuetext", new RegExp(region));
  }
});
