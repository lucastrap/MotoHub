import { test, expect } from "@playwright/test";

test.describe("Page de connexion (/login)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("affiche le formulaire de connexion", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("affiche une erreur Zod quand l'email est vide", async ({ page }) => {
    // type="email" bloque la soumission si la valeur est invalide (validation navigateur)
    // mais laisse passer un champ vide sans required — zodResolver prend le relai
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.locator("text=Invalid email address")).toBeVisible();
  });

  test("affiche une erreur pour un mot de passe trop court", async ({ page }) => {
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/password/i).first().fill("abc");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/at least 6 characters/i)).toBeVisible();
  });

  test("le lien Register pointe vers /register", async ({ page }) => {
    await expect(page.getByRole("link", { name: /register/i })).toHaveAttribute("href", "/register");
  });
});

test.describe("Page d'inscription (/register)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("affiche le formulaire d'inscription complet", async ({ page }) => {
    await expect(page.getByLabel(/^name$/i)).toBeVisible();
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /register/i })).toBeVisible();
  });

  test("affiche une erreur si les mots de passe ne correspondent pas", async ({ page }) => {
    await page.getByLabel(/^name$/i).fill("Test User");
    await page.getByLabel(/^email$/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("password123");
    await page.getByLabel(/confirm password/i).fill("different456");
    await page.getByRole("button", { name: /register/i }).click();
    await expect(page.getByText(/don't match/i)).toBeVisible();
  });

  test("le lien Sign In pointe vers /login", async ({ page }) => {
    await expect(page.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
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
