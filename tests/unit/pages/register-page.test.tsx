import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "@/app/(auth)/register/page";

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const fill = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("Page d'inscription (intégration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("affiche l'ensemble des champs du formulaire", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/^nom$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^adresse e-mail$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument();
  });

  it("signale une erreur accessible si les mots de passe diffèrent", async () => {
    render(<RegisterPage />);
    fill(/^nom$/i, "Jean Pilote");
    fill(/^adresse e-mail$/i, "jean@example.fr");
    fill(/^mot de passe$/i, "password123");
    fill(/confirmer le mot de passe/i, "different456");
    fireEvent.click(screen.getByRole("button", { name: /s'inscrire/i }));

    expect(await screen.findByText(/ne correspondent pas/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("soumet les données (sans confirmPassword) et redirige vers /login", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<RegisterPage />);
    fill(/^nom$/i, "Jean Pilote");
    fill(/^adresse e-mail$/i, "jean@example.fr");
    fill(/^mot de passe$/i, "password123");
    fill(/confirmer le mot de passe/i, "password123");
    fireEvent.click(screen.getByRole("button", { name: /s'inscrire/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const payload = JSON.parse(options.body);
    expect(payload).not.toHaveProperty("confirmPassword");
    expect(push).toHaveBeenCalledWith("/login?registered=true");
  });
});
