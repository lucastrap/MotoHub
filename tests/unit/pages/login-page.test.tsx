import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";

const push = jest.fn();
const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

const fill = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("Page de connexion (intégration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("affiche les champs et le bouton de connexion", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /mototrack/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("affiche les erreurs de validation Zod sur soumission vide", async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("appelle l'API et redirige vers le dashboard si les identifiants sont valides", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<LoginPage />);
    fill(/email/i, "pilote@motoclub-alpes.fr");
    fill(/password/i, "motdepasse");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.objectContaining({ method: "POST" })
      )
    );
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("affiche un message d'erreur accessible si l'API rejette", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    render(<LoginPage />);
    fill(/email/i, "pilote@motoclub-alpes.fr");
    fill(/password/i, "mauvaispass");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/invalid credentials/i);
    expect(push).not.toHaveBeenCalled();
  });
});
