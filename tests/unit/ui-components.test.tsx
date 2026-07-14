import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

describe("Button", () => {
  it("rend un bouton avec son libellé", () => {
    render(<Button>Enregistrer</Button>);
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeInTheDocument();
  });

  it("applique la variante et la taille demandées", () => {
    render(
      <Button variant="destructive" size="lg">
        Supprimer
      </Button>
    );
    const btn = screen.getByRole("button", { name: "Supprimer" });
    expect(btn.className).toContain("bg-destructive");
    expect(btn.className).toContain("h-11");
  });

  it("rend l'élément enfant quand asChild est activé", () => {
    render(
      <Button asChild>
        <a href="/login">Connexion</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Connexion" });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("transmet l'état disabled", () => {
    render(<Button disabled>Off</Button>);
    expect(screen.getByRole("button", { name: "Off" })).toBeDisabled();
  });
});

describe("Input", () => {
  it("rend un champ de saisie et transmet les props", () => {
    render(<Input type="email" placeholder="Email" aria-label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("type", "email");
  });
});

describe("Label", () => {
  it("rend un label associé à un champ", () => {
    render(<Label htmlFor="pwd">Mot de passe</Label>);
    const label = screen.getByText("Mot de passe");
    expect(label).toHaveAttribute("for", "pwd");
  });
});
