import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";
import logger from "@/lib/logger";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const TAILLE_MAX = 2 * 1024 * 1024; // 2 Mo

async function utilisateurCourant() {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch {
    return null;
  }
}

/** Envoie une photo de moto vers le stockage et renvoie son URL publique. */
export async function POST(request: Request) {
  const utilisateur = await utilisateurCourant();
  if (!utilisateur) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "L'envoi de photos n'est pas configuré sur cet environnement." },
      { status: 501 },
    );
  }

  try {
    const formulaire = await request.formData();
    const fichier = formulaire.get("file");

    if (!(fichier instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    const extension = EXTENSIONS[fichier.type];
    if (!extension) {
      return NextResponse.json(
        { error: "Format accepté : JPEG, PNG ou WebP." },
        { status: 400 },
      );
    }

    if (fichier.size > TAILLE_MAX) {
      return NextResponse.json({ error: "Image trop lourde (2 Mo maximum)." }, { status: 400 });
    }

    // Le chemin est construit côté serveur : le client ne choisit pas où écrire.
    const blob = await put(
      `motos/${utilisateur.sub}/${randomUUID()}.${extension}`,
      fichier,
      { access: "public" },
    );

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    logger.error("POST /api/upload a échoué", { error });
    return NextResponse.json({ error: "L'envoi de l'image a échoué." }, { status: 500 });
  }
}

/** Supprime une photo du stockage. Réservée aux fichiers de l'utilisateur. */
export async function DELETE(request: Request) {
  const utilisateur = await utilisateurCourant();
  if (!utilisateur) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: true });
  }

  try {
    const { url } = (await request.json()) as { url?: string };
    if (!url || !url.includes(`/motos/${utilisateur.sub}/`)) {
      return NextResponse.json({ error: "Fichier introuvable." }, { status: 400 });
    }

    await del(url);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("DELETE /api/upload a échoué", { error });
    return NextResponse.json({ error: "La suppression a échoué." }, { status: 500 });
  }
}
