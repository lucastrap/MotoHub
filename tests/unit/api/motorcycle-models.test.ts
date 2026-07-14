/**
 * @jest-environment node
 */
import { GET } from "@/app/api/motorcycle-models/route";

const makeReq = (url: string) => ({ url }) as Request;

describe("GET /api/motorcycle-models", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("retourne 400 si la marque est absente", async () => {
    const res = await GET(makeReq("http://localhost/api/motorcycle-models"));
    expect(res.status).toBe(400);
  });

  it("retourne la liste triée des modèles pour une marque + année", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        Results: [{ Model_Name: "R1" }, { Model_Name: "MT-07" }, { Model_Name: null }],
      }),
    }) as unknown as typeof fetch;

    const res = await GET(
      makeReq("http://localhost/api/motorcycle-models?brand=Yamaha&year=2022")
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.models).toEqual(["MT-07", "R1"]);
  });

  it("interroge l'API sans année si le paramètre year est absent", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ Results: [{ Model_Name: "Panigale" }] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await GET(makeReq("http://localhost/api/motorcycle-models?brand=Ducati"));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("GetModelsForMake/DUCATI"),
      expect.anything()
    );
  });

  it("retourne un tableau vide (200) si l'API NHTSA échoue", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
    const res = await GET(makeReq("http://localhost/api/motorcycle-models?brand=Yamaha"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ models: [] });
  });

  it("retourne un tableau vide si fetch lève une exception", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network")) as unknown as typeof fetch;
    const res = await GET(makeReq("http://localhost/api/motorcycle-models?brand=Honda"));
    expect(await res.json()).toEqual({ models: [] });
  });
});
