import { expect, test, type Page } from "@playwright/test";

/**
 * Library route: a word list created, read, edited and deleted
 * through the UI, with every step checked against what the API stored.
 */

// Unique per run, so a crashed run never blocks the next one on the unique-name rule.
const listName = `E2E list ${Date.now()}`;

async function openList(page: Page, name: string) {
  await page.goto("/library");
  await page
    .getByRole("row", { name: new RegExp(name) })
    .getByRole("link", { name: "View words" })
    .click();

  // Wait for the navigation to land, so a following reload cannot race it.
  await expect(page).toHaveURL(/\/library\/\d+$/);
}

const API_URL = "http://localhost:3001";

/**
 * A failing run stops before the delete step, so the list it created would otherwise
 * stay in the database and show up in the library and the dashboard counts.
 */
test.afterAll(async () => {
  const response = await fetch(`${API_URL}/api/word-lists?search=E2E list`);

  if (!response.ok) return;

  const lists: { id: number }[] = await response.json();

  await Promise.all(
    lists.map((list) =>
      fetch(`${API_URL}/api/word-lists/${list.id}`, { method: "DELETE" }),
    ),
  );
});

test.describe.serial("word list CRUD", () => {
  test("creates a word list", async ({ page }) => {
    await page.goto("/library");

    await page.getByLabel("Name").fill(listName);
    await page.getByLabel(/Description/).fill("Created by the Playwright builder spec.");
    await page.getByRole("button", { name: "Create list" }).click();

    // Creating opens the new list, so the id in the URL confirms it was persisted.
    await expect(page).toHaveURL(/\/library\/\d+$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(listName);
    await expect(page.getByText("This list holds no words yet.")).toBeVisible();
  });

  test("shows the new list in the library", async ({ page }) => {
    await page.goto("/library");

    const row = page.getByRole("row", { name: new RegExp(listName) });

    await expect(row).toBeVisible();
    await expect(row).toContainText("Created by the Playwright builder spec.");
  });

  test("adds words to the list", async ({ page }) => {
    await openList(page, listName);

    for (const word of ["bed", "bad"]) {
      await page.getByRole("button", { name: "Add a word" }).click();
      await page.getByPlaceholder("Type a word to add").fill(word);
      await page.getByRole("button", { name: "Add to list" }).click();
      await expect(page.getByRole("listitem").filter({ hasText: word })).toBeVisible();
    }

    await expect(page.getByRole("heading", { name: /^Words \(2\)$/ })).toBeVisible();
  });

  test("persists the words across a reload", async ({ page }) => {
    await openList(page, listName);

    await page.reload();

    await expect(page.getByRole("heading", { name: /^Words \(2\)$/ })).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: "bed" })).toBeVisible();
  });

  test("removes a word", async ({ page }) => {
    await openList(page, listName);

    await page.getByRole("button", { name: "Remove bad from this list" }).click();

    await expect(page.getByRole("heading", { name: /^Words \(1\)$/ })).toBeVisible();
    await expect(
      page.getByRole("listitem").filter({ hasText: "bad" }),
    ).toHaveCount(0);
  });

  test("deletes the list", async ({ page }) => {
    await openList(page, listName);

    await page.getByRole("button", { name: "Delete list" }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();

    await expect(page).toHaveURL(/\/library$/);
    await expect(page.getByRole("row", { name: new RegExp(listName) })).toHaveCount(0);
  });
});
