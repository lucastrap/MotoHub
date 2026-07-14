import { render, screen, fireEvent } from "@testing-library/react";
import AddMotorcyclePage from "@/app/garage/new/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/garage/new",
}));
jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: ({ className }: { className?: string }) => <span className={className} />,
}));

describe("Page d'ajout de moto — rendu du wizard", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ models: [] }) });
  });

  it("affiche l'étape 1 (Identité) avec le sélecteur de marques", () => {
    render(<AddMotorcyclePage />);
    expect(screen.getByText("Ajouter une moto")).toBeInTheDocument();
    expect(screen.getByText("Informations essentielles")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Yamaha/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Suivant/ })).toBeInTheDocument();
  });

  it("affiche le stepper avec les trois étapes", () => {
    render(<AddMotorcyclePage />);
    expect(screen.getByText("Identité")).toBeInTheDocument();
    expect(screen.getByText("Détails")).toBeInTheDocument();
    expect(screen.getByText("Achat")).toBeInTheDocument();
  });

  it("permet de sélectionner une marque (retour visuel actif)", () => {
    render(<AddMotorcyclePage />);
    const yamaha = screen.getByRole("button", { name: /Yamaha/ });
    fireEvent.click(yamaha);
    expect(yamaha.className).toContain("border-primary");
  });
});
