/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({ verifyAuth: jest.fn() }));

import { middleware, config } from "@/middleware";
import { verifyAuth } from "@/lib/auth";

type FakeReq = {
  cookies: { get: (n: string) => { value: string } | undefined };
  nextUrl: { pathname: string };
  url: string;
};

const makeReq = (pathname: string, token?: string): FakeReq => ({
  cookies: { get: () => (token ? { value: token } : undefined) },
  nextUrl: { pathname },
  url: `http://localhost${pathname}`,
});

describe("middleware de protection des routes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("redirige vers /login l'accès non authentifié à /dashboard", async () => {
    const res = await middleware(makeReq("/dashboard") as never);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirige vers /login si le token est invalide", async () => {
    (verifyAuth as jest.Mock).mockRejectedValue(new Error("expired"));
    const res = await middleware(makeReq("/garage", "bad-token") as never);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("laisse passer un utilisateur authentifié vers /dashboard", async () => {
    (verifyAuth as jest.Mock).mockResolvedValue({ sub: "u1" });
    const res = await middleware(makeReq("/dashboard", "good-token") as never);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirige un utilisateur déjà connecté hors de /login vers /dashboard", async () => {
    (verifyAuth as jest.Mock).mockResolvedValue({ sub: "u1" });
    const res = await middleware(makeReq("/login", "good-token") as never);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("laisse un visiteur anonyme accéder à /login", async () => {
    const res = await middleware(makeReq("/login") as never);
    expect(res.headers.get("location")).toBeNull();
  });

  it("expose un matcher couvrant les routes sensibles", () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining(["/dashboard/:path*", "/garage/:path*", "/maintenance/:path*"])
    );
  });
});
