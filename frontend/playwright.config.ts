import { defineConfig, devices } from "@playwright/test";

const WEB_URL = "http://localhost:3000";
const API_URL = "http://localhost:3001";

export default defineConfig({
  testDir: "./e2e",
  // The suite drives one SQLite database, so specs that create and delete rows would
  // race each other if they ran in parallel.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  // Output lands at the repo root, next to docker-compose.yml, so results sit with the
  // commands that produce them rather than inside frontend/.
  outputDir: "../test-results",
  reporter: [
    [process.env.CI ? "github" : "list"],
    ["html", { open: "never", outputFolder: "../playwright-report" }],
  ],
  // The dev server compiles a route on its first request, so a cold run is far slower
  // than a warm one. These suit that worst case rather than the steady state.
  timeout: 60_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: WEB_URL,
    trace: "retain-on-failure",
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run dev",
      cwd: "../backend",
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run dev",
      url: `${WEB_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
