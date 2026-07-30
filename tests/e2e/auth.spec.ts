import { test, expect } from "@playwright/test";

test.describe("Page de connexion (/login)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("affiche le formulaire de connexion", async ({ page }) => {
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
  });

  test("affiche une erreur Zod quand l'email est vide", async ({ page }) => {
    // type="email" bloque la soumission si la valeur est invalide (validation navigateur)
    // mais laisse passer un champ vide sans required   zodResolver prend le relai
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.locator("text=Adresse e-mail invalide")).toBeVisible();
  });

  test("affiche une erreur pour un mot de passe trop court", async ({ page }) => {
    await page.getByLabel(/e-mail/i).fill("test@example.com");
    await page.getByLabel(/mot de passe/i).first().fill("abc");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.getByText(/au moins 6 caractères/i)).toBeVisible();
  });

  test("le lien d'inscription pointe vers /register", async ({ page }) => {
    await expect(page.getByRole("link", { name: /s'inscrire/i })).toHaveAttribute("href", "/register");
  });
});

test.describe("Page d'inscription (/register)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("affiche le formulaire d'inscription complet", async ({ page }) => {
    await expect(page.getByLabel(/^nom$/i)).toBeVisible();
    await expect(page.getByLabel(/^adresse e-mail$/i)).toBeVisible();
    await expect(page.getByLabel(/^mot de passe$/i)).toBeVisible();
    await expect(page.getByLabel(/confirmer le mot de passe/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /s'inscrire/i })).toBeVisible();
  });

  test("affiche une erreur si les mots de passe ne correspondent pas", async ({ page }) => {
    await page.getByLabel(/^nom$/i).fill("Test Utilisateur");
    await page.getByLabel(/^adresse e-mail$/i).fill("test@example.com");
    await page.getByLabel(/^mot de passe$/i).fill("password123");
    await page.getByLabel(/confirmer le mot de passe/i).fill("different456");
    await page.getByRole("button", { name: /s'inscrire/i }).click();
    await expect(page.getByText(/ne correspondent pas/i)).toBeVisible();
  });

  test("le lien de connexion pointe vers /login", async ({ page }) => {
    await expect(page.getByRole("link", { name: /se connecter/i })).toHaveAttribute("href", "/login");
  });
});

test.describe("Protection des routes (middleware)", () => {
  test("accéder à /dashboard sans token redirige vers /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("accéder à /garage sans token redirige vers /login", async ({ page }) => {
    await page.goto("/garage");
    await expect(page).toHaveURL(/\/login/);
  });

  test("accéder à /maintenance sans token redirige vers /login", async ({ page }) => {
    await page.goto("/maintenance");
    await expect(page).toHaveURL(/\/login/);
  });
});
