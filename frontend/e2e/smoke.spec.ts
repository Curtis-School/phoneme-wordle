import { expect, test } from "@playwright/test";

test("the home page offers both activity builders", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Build phoneme-based classroom activities",
  );
  // Scoped to main: the header logo is also named "Phoneme Wordle".
  const cards = page.getByRole("main");

  await expect(cards.getByRole("link", { name: /Phoneme Wordle/ })).toBeVisible();
  await expect(cards.getByRole("link", { name: /Phoneme Word Search/ })).toBeVisible();
});

test("the frontend health check reports itself and the API", async ({ request }) => {
  const response = await request.get("/health");

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body.status).toBe("ok");
  expect(body.api.status).toBe("ok");
  expect(body.api.health.database).toBe("connected");
});

test("the dashboard renders its reporting sections", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Alerts" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent events" })).toBeVisible();
});
