import { test, expect } from "@playwright/test";

test.describe("Accessibilité RGAA — pages publiques", () => {
  test("la langue du document est déclarée en français (RGAA 8.3)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("chaque champ du formulaire de connexion possède une étiquette (RGAA 11.1)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });

  test("les champs portent les attributs d'autocomplétion (RGAA 11.13)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toHaveAttribute("autocomplete", "email");
    await expect(page.getByLabel(/password/i).first()).toHaveAttribute(
      "autocomplete",
      "current-password"
    );
  });

  test("les erreurs de saisie sont signalées via role=alert et aria-invalid (RGAA 11.10)", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Un message d'erreur avec le rôle alert est exposé aux technologies d'assistance
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(page.getByLabel(/email/i)).toHaveAttribute("aria-invalid", "true");
  });

  test("un titre de niveau 1 unique structure la page (RGAA 9.1)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("MotoTrack");
  });
});
