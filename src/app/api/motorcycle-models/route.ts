import { NextResponse } from "next/server";

// API NHTSA (National Highway Traffic Safety Administration) — gratuite, sans clé
// https://vpic.nhtsa.dot.gov/api/

// Correspondance nom affiché → nom NHTSA
const BRAND_ALIASES: Record<string, string> = {
  // Japonaises
  "Yamaha":          "YAMAHA",
  "Honda":           "HONDA",
  "Kawasaki":        "KAWASAKI",
  "Suzuki":          "SUZUKI",
  // Européennes
  "BMW":             "BMW",
  "Ducati":          "DUCATI",
  "KTM":             "KTM",
  "Triumph":         "TRIUMPH",
  "Aprilia":         "APRILIA",
  "Husqvarna":       "HUSQVARNA",
  "MV Agusta":       "MV AGUSTA",
  "Beta":            "BETA",
  // Américaines
  "Harley-Davidson": "HARLEY-DAVIDSON",
  // Indiennes
  "Royal Enfield":   "ROYAL ENFIELD",
  // Chinoises / Taïwanaises
  "CFMoto":          "CFMOTO",
  "Zontes":          "ZONTES",
  "Benelli":         "BENELLI",
  "Voge":            "VOGE",
  "Kove":            "KOVE",
  "QJ Motor":        "QJ MOTOR",
  "Keeway":          "KEEWAY",
  "Loncin":          "LONCIN",
  "Lifan":           "LIFAN",
  "Niu":             "NIU",
  "Kymco":           "KYMCO",
  "SYM":             "SYM",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get("brand");
  const year  = searchParams.get("year");

  if (!brand) {
    return NextResponse.json({ error: "brand is required" }, { status: 400 });
  }

  const nhtsaBrand = BRAND_ALIASES[brand] ?? brand.toUpperCase();

  try {
    let url: string;

    if (year) {
      url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(nhtsaBrand)}/modelyear/${year}/vehicleType/motorcycle?format=json`;
    } else {
      url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(nhtsaBrand)}?format=json`;
    }

    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
    if (!res.ok) throw new Error("NHTSA fetch failed");

    const data = await res.json();
    const models: string[] = (data.Results ?? [])
      .map((r: any) => r.Model_Name as string)
      .filter(Boolean)
      .sort();

    return NextResponse.json({ models });
  } catch (err) {
    console.error("[motorcycle-models]", err);
    return NextResponse.json({ models: [] }, { status: 200 });
  }
}