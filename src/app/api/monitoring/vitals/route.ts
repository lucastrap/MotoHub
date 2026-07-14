import { NextResponse } from "next/server";
import z from "zod";
import logger from "@/lib/logger";

// Supervision de la performance réelle (Real User Monitoring).
// Le client transmet les Core Web Vitals (LCP, CLS, INP, FCP, TTFB) mesurés
// dans le navigateur des utilisateurs ; ils sont journalisés de façon structurée
// (Winston) pour être agrégés et suivis dans le temps.
const metricSchema = z.object({
  name: z.string().min(1),
  value: z.number(),
  id: z.string().min(1),
  rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  navigationType: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const metric = metricSchema.parse(await req.json());

    logger.info("web-vitals", {
      metric: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating ?? "n/a",
      id: metric.id,
    });

    // 204 : accusé de réception sans corps (appelé via navigator.sendBeacon).
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
