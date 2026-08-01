/**
 * @jest-environment node
 */
const put = jest.fn();
const del = jest.fn();
jest.mock("@vercel/blob", () => ({ put: (...a: unknown[]) => put(...a), del: (...a: unknown[]) => del(...a) }));

const cookieGet = jest.fn();
jest.mock("next/headers", () => ({ cookies: () => ({ get: cookieGet }) }));
jest.mock("@/lib/auth", () => ({ verifyAuth: jest.fn() }));
jest.mock("@/lib/logger", () => ({ __esModule: true, default: { error: jest.fn() } }));

import { POST, DELETE } from "@/app/api/upload/route";
import { verifyAuth } from "@/lib/auth";

const authAs = (sub: string) => {
  cookieGet.mockReturnValue({ value: "tok" });
  (verifyAuth as jest.Mock).mockResolvedValue({ sub });
};

const postReq = (fd: FormData) => ({ formData: async () => fd }) as unknown as Request;
const fileReq = (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return postReq(fd);
};
const deleteReq = (body: unknown) => ({ json: async () => body }) as unknown as Request;

const jpeg = () => new File([new Uint8Array(10)], "moto.jpg", { type: "image/jpeg" });

beforeEach(() => {
  jest.clearAllMocks();
  process.env.BLOB_READ_WRITE_TOKEN = "blob-token";
});

describe("POST /api/upload", () => {
  it("retourne 401 sans authentification", async () => {
    cookieGet.mockReturnValue(undefined);
    const res = await POST(fileReq(jpeg()));
    expect(res.status).toBe(401);
  });

  it("retourne 401 si le jeton est invalide", async () => {
    cookieGet.mockReturnValue({ value: "tok" });
    (verifyAuth as jest.Mock).mockRejectedValue(new Error("expired"));
    const res = await POST(fileReq(jpeg()));
    expect(res.status).toBe(401);
  });

  it("retourne 501 si le stockage n'est pas configuré", async () => {
    authAs("u1");
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const res = await POST(fileReq(jpeg()));
    expect(res.status).toBe(501);
  });

  it("retourne 400 si aucun fichier n'est reçu", async () => {
    authAs("u1");
    const res = await POST(postReq(new FormData()));
    expect(res.status).toBe(400);
  });

  it("retourne 400 pour un format non accepté", async () => {
    authAs("u1");
    const gif = new File([new Uint8Array(10)], "x.gif", { type: "image/gif" });
    const res = await POST(fileReq(gif));
    expect(res.status).toBe(400);
  });

  it("retourne 400 pour une image de plus de 2 Mo", async () => {
    authAs("u1");
    const gros = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "gros.png", { type: "image/png" });
    const res = await POST(fileReq(gros));
    expect(res.status).toBe(400);
  });

  it("stocke le fichier sous un chemin cloisonné par utilisateur et renvoie l'URL (201)", async () => {
    authAs("u1");
    put.mockResolvedValue({ url: "https://blob.example/motos/u1/abc.jpg" });
    const res = await POST(fileReq(jpeg()));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ url: "https://blob.example/motos/u1/abc.jpg" });
    expect(put).toHaveBeenCalledWith(
      expect.stringMatching(/^motos\/u1\/.*\.jpg$/),
      expect.any(File),
      { access: "public" },
    );
  });

  it("retourne 500 si le stockage échoue", async () => {
    authAs("u1");
    put.mockRejectedValue(new Error("blob down"));
    const res = await POST(fileReq(jpeg()));
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/upload", () => {
  it("retourne 401 sans authentification", async () => {
    cookieGet.mockReturnValue(undefined);
    const res = await DELETE(deleteReq({ url: "https://blob.example/motos/u1/a.jpg" }));
    expect(res.status).toBe(401);
  });

  it("répond ok sans rien supprimer si le stockage n'est pas configuré", async () => {
    authAs("u1");
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const res = await DELETE(deleteReq({ url: "https://blob.example/motos/u1/a.jpg" }));
    expect(res.status).toBe(200);
    expect(del).not.toHaveBeenCalled();
  });

  it("retourne 400 si l'URL ne cible pas un fichier de l'utilisateur", async () => {
    authAs("u1");
    const res = await DELETE(deleteReq({ url: "https://blob.example/motos/autre/a.jpg" }));
    expect(res.status).toBe(400);
    expect(del).not.toHaveBeenCalled();
  });

  it("retourne 400 si l'URL est absente", async () => {
    authAs("u1");
    const res = await DELETE(deleteReq({}));
    expect(res.status).toBe(400);
  });

  it("supprime le fichier de l'utilisateur (200)", async () => {
    authAs("u1");
    const url = "https://blob.example/motos/u1/a.jpg";
    del.mockResolvedValue(undefined);
    const res = await DELETE(deleteReq({ url }));
    expect(res.status).toBe(200);
    expect(del).toHaveBeenCalledWith(url);
  });

  it("retourne 500 si la suppression échoue", async () => {
    authAs("u1");
    del.mockRejectedValue(new Error("blob down"));
    const res = await DELETE(deleteReq({ url: "https://blob.example/motos/u1/a.jpg" }));
    expect(res.status).toBe(500);
  });
});
