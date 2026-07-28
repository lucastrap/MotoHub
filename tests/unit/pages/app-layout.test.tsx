import { render, screen } from "@testing-library/react";
import { AppLayout } from "@/components/layout/AppLayout";

let mockPathname = "/dashboard";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));
jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: ({ className }: { className?: string }) => <span className={className} />,
}));

describe("AppLayout   structure et accessibilité", () => {
  it("expose un lien d'évitement vers le contenu principal (RGAA 12.7)", () => {
    render(<AppLayout title="Tableau de bord">contenu</AppLayout>);
    const skip = screen.getByRole("link", { name: /aller au contenu principal/i });
    expect(skip).toHaveAttribute("href", "#main-content");
  });

  it("rend une navigation étiquetée avec tous les liens principaux", () => {
    render(<AppLayout title="Tableau de bord">contenu</AppLayout>);
    const nav = screen.getByRole("navigation", { name: /navigation principale/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /mon garage/i })).toHaveAttribute("href", "/garage");
    expect(screen.getByRole("link", { name: /historique/i })).toHaveAttribute("href", "/maintenance");
  });

  it("marque le lien actif avec aria-current selon l'URL courante", () => {
    mockPathname = "/garage";
    render(<AppLayout title="Mon Garage">contenu</AppLayout>);
    expect(screen.getByRole("link", { name: /mon garage/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /historique/i })).not.toHaveAttribute("aria-current");
  });

  it("affiche le titre de page fourni et le contenu", () => {
    mockPathname = "/dashboard";
    render(<AppLayout title="Mon Titre">contenu enfant</AppLayout>);
    expect(screen.getByRole("heading", { name: "Mon Titre" })).toBeInTheDocument();
    expect(screen.getByText("contenu enfant")).toBeInTheDocument();
  });
});
