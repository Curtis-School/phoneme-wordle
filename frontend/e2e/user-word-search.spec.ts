import { expect, test } from "@playwright/test";

/** The user use case for Word Search: view a generated grid and its clues. */

test.beforeEach(async ({ page }) => {
  await page.goto("/word-search");
});

test("generates a grid and its clue list", async ({ page }) => {
  const grid = page.getByRole("grid", { name: "Phoneme word search grid" });

  await expect(grid).toBeVisible();

  const cells = grid.getByRole("gridcell");
  const count = await cells.count();

  // The grid is square, so the cell count is a perfect square.
  expect(Math.sqrt(count) % 1).toBe(0);
  expect(count).toBeGreaterThan(0);

  await expect(page.getByRole("status").filter({ hasText: /0 of \d+ found/ })).toBeVisible();
});

test("reveals the hidden words", async ({ page }) => {
  await page.getByRole("button", { name: "Reveal answers" }).click();

  await expect(page.getByText("Answers revealed")).toBeVisible();
  await expect(page.getByRole("button", { name: "Hide answers" })).toBeVisible();
});

test("shuffles the grid into a different puzzle", async ({ page }) => {
  const grid = page.getByRole("grid", { name: "Phoneme word search grid" });
  const before = await grid.textContent();

  await page.getByRole("button", { name: "Shuffle grid" }).click();

  await expect
    .poll(async () => grid.textContent(), { timeout: 10_000 })
    .not.toBe(before);
});
