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
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("signale une erreur accessible si les mots de passe diffèrent", async () => {
    render(<RegisterPage />);
    fill(/^name$/i, "Jean Pilote");
    fill(/^email$/i, "jean@motoclub-alpes.fr");
    fill(/^password$/i, "password123");
    fill(/confirm password/i, "different456");
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/don't match/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("soumet les données (sans confirmPassword) et redirige vers /login", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<RegisterPage />);
    fill(/^name$/i, "Jean Pilote");
    fill(/^email$/i, "jean@motoclub-alpes.fr");
    fill(/^password$/i, "password123");
    fill(/confirm password/i, "password123");
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const payload = JSON.parse(options.body);
    expect(payload).not.toHaveProperty("confirmPassword");
    expect(push).toHaveBeenCalledWith("/login?registered=true");
  });
});
