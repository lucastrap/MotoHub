import { test, expect } from "@playwright/test";

// launchOptions doit rester au niveau du fichier : force un worker dédié.
test.use({
  launchOptions: { args: ["--disable-webgl", "--disable-webgl2", "--disable-gpu"] },
});

test.describe("Page d'accueil sans WebGL", () => {
  test("la page ne plante pas après l'hydratation", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.getByRole("heading", { name: /échéances calculées/i })).toBeVisible();
  });

  test("un visuel de repli remplace la scène 3D", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/aperçu 3D n'est pas disponible/i)).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
