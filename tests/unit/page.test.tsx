import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

// Three.js / R3F ne fonctionne pas dans JSDOM
jest.mock("@/components/3d/MotorcycleScene", () => ({
  __esModule: true,
  default: () => <div data-testid="motorcycle-scene" />,
}));

// FontAwesome a besoin d'un mock partiel pour JSDOM
jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: ({ className }: { className?: string }) => (
    <span className={className} />
  ),
}));

describe("Page d'accueil", () => {
  it("affiche le nom de l'application", () => {
    render(<Home />);
    expect(screen.getByText(/MotoTrack/i)).toBeInTheDocument();
  });

  it("affiche un lien vers la page de connexion", () => {
    render(<Home />);
    const loginLink = screen.getByRole("link", { name: /connexion/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("affiche un lien vers la page d'inscription", () => {
    render(<Home />);
    const registerLink = screen.getByRole("link", { name: /commencer/i });
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("affiche la scène 3D", () => {
    render(<Home />);
    expect(screen.getByTestId("motorcycle-scene")).toBeInTheDocument();
  });
});
