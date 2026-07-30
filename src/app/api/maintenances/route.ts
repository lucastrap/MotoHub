import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import z from "zod";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";
import logger from "@/lib/logger";

const maintenanceSchema = z.object({
  motorcycleId: z.string().uuid(),
  type: z.enum([
    "OIL_CHANGE", 
    "TIRE_CHANGE", 
    "BRAKE_SERVICE", 
    "CHAIN_SERVICE", 
    "GENERAL_SERVICE", 
    "REPAIR", 
    "OTHER"
  ]),
  date: z.string(),
  mileage: z.coerce.number().min(0),
  description: z.string().min(1),
  cost: z.coerce.number().optional()
});

async function getUser() {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch (err) {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const motorcycleId = searchParams.get("motoId");

    const whereClause: Prisma.MaintenanceWhereInput = {
      motorcycle: {
        userId: user.sub as string,
      },
    };

    if (motorcycleId) {
      whereClause.motorcycleId = motorcycleId;
    }

    const maintenances = await prisma.maintenance.findMany({
      where: whereClause,
      include: {
        motorcycle: {
          select: { brand: true, model: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(maintenances, { status: 200 });
  } catch (error) {
    logger.error("GET /api/maintenances a échoué", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = maintenanceSchema.parse(body);

    // Verify motorcycle belongs to user
    const motoOwnership = await prisma.motorcycle.findFirst({
        where: { id: parsedData.motorcycleId, userId: user.sub as string }
    });
    
    if(!motoOwnership) {
        return NextResponse.json({ error: "Motorcycle not found or unauthorized" }, { status: 403 });
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        ...parsedData,
        date: new Date(parsedData.date),
      },
    });
    
    // Update the motorcycle's current mileage if this service mileage is higher
    if (parsedData.mileage > motoOwnership.currentMileage) {
      await prisma.motorcycle.update({
        where: { id: motoOwnership.id },
        data: { currentMileage: parsedData.mileage }
      });
    }

    return NextResponse.json(maintenance, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logger.error("POST /api/maintenances a échoué", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
