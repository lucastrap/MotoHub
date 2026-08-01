import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import z from "zod";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";
import logger from "@/lib/logger";

/** Seul champ modifiable pour l'instant. Validé pour ne pas transmettre
 *  n'importe quelle valeur à Prisma, qui lèverait une 500. */
const patchSchema = z.object({
  isPrimary: z.boolean(),
});

async function getUser() {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch {
    return null;
  }
}

// PATCH /api/motorcycles/[id]   set as primary or update fields
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = patchSchema.parse(await req.json());

    // Verify ownership
    const moto = await prisma.motorcycle.findFirst({
      where: { id: params.id, userId: user.sub as string },
    });
    if (!moto) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.isPrimary === true) {
      // Remove primary from all other motos of this user
      await prisma.motorcycle.updateMany({
        where: { userId: user.sub as string },
        data: { isPrimary: false },
      });
    }

    const updated = await prisma.motorcycle.update({
      where: { id: params.id },
      data: { isPrimary: body.isPrimary },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logger.error("PATCH /api/motorcycles/[id] a échoué", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}