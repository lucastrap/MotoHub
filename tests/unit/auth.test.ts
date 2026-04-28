// jose est un module ESM pur — on le mock pour l'environnement Jest/JSDOM
jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setNotBefore: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue("mocked.jwt.token"),
  })),
}));

import { jwtVerify } from "jose";
import { getJwtSecretKey, signToken, verifyAuth } from "@/lib/auth";

const mockJwtVerify = jwtVerify as jest.Mock;

describe("getJwtSecretKey", () => {
  const originalEnv = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  it("retourne la clé si JWT_SECRET est défini", () => {
    process.env.JWT_SECRET = "test-secret-key";
    expect(getJwtSecretKey()).toBe("test-secret-key");
  });

  it("lève une erreur si JWT_SECRET est absent", () => {
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecretKey()).toThrow(
      "The environment variable JWT_SECRET is not set."
    );
  });

  it("lève une erreur si JWT_SECRET est une chaîne vide", () => {
    process.env.JWT_SECRET = "";
    expect(() => getJwtSecretKey()).toThrow(
      "The environment variable JWT_SECRET is not set."
    );
  });
});

describe("signToken", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret-32-chars-minimum-key!";
  });

  it("retourne le token signé par jose", async () => {
    const token = await signToken({ sub: "user-123", email: "test@example.com" });
    expect(token).toBe("mocked.jwt.token");
  });
});

describe("verifyAuth", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret-32-chars-minimum-key!";
  });

  it("retourne le payload si le token est valide", async () => {
    mockJwtVerify.mockResolvedValueOnce({
      payload: { sub: "user-123", email: "test@example.com" },
    });

    const payload = await verifyAuth("valid.jwt.token");
    expect(payload.sub).toBe("user-123");
    expect(payload.email).toBe("test@example.com");
  });

  it("lève une erreur si jwtVerify rejette (token expiré ou invalide)", async () => {
    mockJwtVerify.mockRejectedValueOnce(new Error("JWTExpired"));
    await expect(verifyAuth("expired.token")).rejects.toThrow(
      "Your token has expired."
    );
  });
});
