import { render, screen } from "@testing-library/react";
import AuthLayout from "@/app/(auth)/layout";

describe("Layout des pages d'authentification (accessibilité)", () => {
  it("fournit un repère <main> unique avec l'ancre #main-content (RGAA 12.6)", () => {
    render(
      <AuthLayout>
        <p>contenu</p>
      </AuthLayout>,
    );
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute("id", "main-content");
    expect(main).toHaveTextContent("contenu");
  });

  it("expose un lien d'évitement vers le contenu principal (RGAA 12.7)", () => {
    render(
      <AuthLayout>
        <p>contenu</p>
      </AuthLayout>,
    );
    const skip = screen.getByRole("link", { name: /aller au contenu principal/i });
    expect(skip).toHaveAttribute("href", "#main-content");
  });
});
