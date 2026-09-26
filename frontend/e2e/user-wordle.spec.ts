import { expect, test } from "@playwright/test";

/** The user use case for Wordle: open a generated puzzle and play a guess. */

test.beforeEach(async ({ page }) => {
  await page.goto("/wordle");
});

test("generates a playable board from a saved activity", async ({ page }) => {
  const board = page.getByRole("grid", { name: "Wordle board" });

  await expect(board).toBeVisible();
  await expect(page.getByText(/^Try 1 of \d+$/)).toBeVisible();

  // Every row holds the same number of tiles as the generated word.
  const rows = board.getByRole("row");

  expect(await rows.count()).toBeGreaterThan(0);
});

test("scores a submitted guess with tile feedback", async ({ page }) => {
  const board = page.getByRole("grid", { name: "Wordle board" });
  const firstRow = board.getByRole("row").first();
  const tilesPerRow = await firstRow.locator("div").count();

  // Fill the row from the phoneme keyboard, then submit it.
  const keys = page.getByRole("group", { name: "Phoneme keys" }).getByRole("button");

  for (let i = 0; i < tilesPerRow; i++) {
    await keys.nth(i).click();
  }

  await expect(page.getByText("Ready to submit")).toBeVisible();

  await page.getByRole("button", { name: "Enter" }).click();

  // A scored guess paints every tile of that row, and the round advances.
  await expect(page.getByText(/^Try 2 of \d+$/)).toBeVisible();
  await expect(
    board.locator(".bg-correct, .bg-present, .bg-absent").first(),
  ).toBeVisible();
});

test("starts a fresh round on request", async ({ page }) => {
  const keys = page.getByRole("group", { name: "Phoneme keys" }).getByRole("button");

  await keys.first().click();
  await page.getByRole("button", { name: "New round" }).click();

  await expect(page.getByText(/^Try 1 of \d+$/)).toBeVisible();
  await expect(page.getByText(/Tap (sounds|letters) to fill the row/)).toBeVisible();
});
