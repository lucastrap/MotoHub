import { test, expect } from "@playwright/test";

test.describe("Page d'accueil", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("affiche le nom de l'application dans la navbar", async ({ page }) => {
    await expect(page.locator("header")).toContainText("MotoHub");
  });

  test("le lien Connexion pointe vers /login", async ({ page }) => {
    const link = page.getByRole("link", { name: /connexion/i });
    await expect(link).toHaveAttribute("href", "/login");
  });

  test("le lien Commencer pointe vers /register", async ({ page }) => {
    const link = page.getByRole("link", { name: /commencer/i });
    await expect(link).toHaveAttribute("href", "/register");
  });

  test("affiche le titre hero principal", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 }).first()).toContainText("Ton garage");
  });

  test("affiche la section fonctionnalités", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /carnet d'entretien/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /pièces détachées/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /rappels intelligents/i })).toBeVisible();
  });

  test("le footer affiche l'année courante", async ({ page }) => {
    const year = new Date().getFullYear().toString();
    await expect(page.locator("footer")).toContainText(year);
  });
});
