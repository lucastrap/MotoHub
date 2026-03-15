import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import z from "zod";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";

const motorcycleSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().optional(),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  currentMileage: z.number().int().min(0).default(0),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
});

async function getUser() {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  try {
    const verified = await verifyAuth(token);
    return verified;
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

    const motorcycles = await prisma.motorcycle.findMany({
      where: { userId: user.sub as string },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(motorcycles, { status: 200 });
  } catch (error) {
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
    const parsedData = motorcycleSchema.parse(body);

    const motorcycle = await prisma.motorcycle.create({
      data: {
        ...parsedData,
        userId: user.sub as string,
        purchaseDate: parsedData.purchaseDate ? new Date(parsedData.purchaseDate) : null,
      },
    });

    return NextResponse.json(motorcycle, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
