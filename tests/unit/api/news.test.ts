/**
 * @jest-environment node
 */
const mockParseURL = jest.fn();
jest.mock("rss-parser", () =>
  jest.fn().mockImplementation(() => ({
    // closure paresseuse : mockParseURL n'est lue qu'à l'appel, pas à la construction
    parseURL: (...args: unknown[]) => mockParseURL(...args),
  }))
);

import { GET } from "@/app/api/news/route";

describe("GET /api/news", () => {
  beforeEach(() => jest.clearAllMocks());

  it("agrège les flux RSS et dédoublonne par lien", async () => {
    mockParseURL.mockResolvedValue({
      items: [
        {
          title: "Nouvelle Yamaha 2025",
          link: "https://news.example/1",
          guid: "g1",
          pubDate: new Date("2026-01-02").toISOString(),
          contentSnippet: "Un essai complet",
          "media:content": { $: { url: "https://img.example/1.jpg" } },
        },
      ],
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    // 4 flux renvoient le même lien -> dédoublonné en 1 article
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(1);
    expect(json[0]).toMatchObject({
      title: "Nouvelle Yamaha 2025",
      link: "https://news.example/1",
      thumbnail: "https://img.example/1.jpg",
    });
  });

  it("reste résilient si un flux échoue (Promise.allSettled)", async () => {
    mockParseURL.mockRejectedValue(new Error("feed down"));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("extrait la vignette depuis le HTML de description à défaut de média", async () => {
    mockParseURL.mockResolvedValue({
      items: [
        {
          title: "Article",
          link: "https://news.example/2",
          pubDate: new Date().toISOString(),
          description: 'texte <img src="https://img.example/2.png"> suite',
        },
      ],
    });
    const res = await GET();
    const json = await res.json();
    expect(json[0].thumbnail).toBe("https://img.example/2.png");
  });
});
