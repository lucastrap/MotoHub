import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

export async function GET() {
  const start = Date.now();

  try {
    // Probe DB with a lightweight query
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    logger.info("Health check passed", { db: "connected", latencyMs: latency });

    return NextResponse.json(
      {
        status: "ok",
        db: "connected",
        latencyMs: latency,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? "1.0.0",
      },
      { status: 200 }
    );
  } catch (error) {
    const latency = Date.now() - start;
    logger.error("Health check failed   DB unreachable", { error, latencyMs: latency });

    return NextResponse.json(
      {
        status: "error",
        db: "unreachable",
        latencyMs: latency,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
