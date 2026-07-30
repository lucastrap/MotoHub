"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCircleNotch, faTrash } from "@fortawesome/free-solid-svg-icons";

type Props = {
  /** URL actuelle de la photo, ou null si la moto n'en a pas. */
  value: string | null;
  onChange: (url: string | null) => void;
};

export function PhotoField({ value, onChange }: Props) {
  const champ = useRef<HTMLInputElement>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyer(fichier: File) {
    setErreur(null);
    setEnvoiEnCours(true);
    try {
      const corps = new FormData();
      corps.append("file", fichier);
      const res = await fetch("/api/upload", { method: "POST", body: corps });
      const donnees = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(donnees.error ?? "L'envoi a échoué.");
      onChange(donnees.url);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "L'envoi a échoué.");
    } finally {
      setEnvoiEnCours(false);
      if (champ.current) champ.current.value = "";
    }
  }

  async function retirer() {
    const ancienne = value;
    onChange(null);
    if (ancienne) {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ancienne }),
      }).catch(() => {});
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={champ}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        id="photo"
        onChange={(e) => {
          const fichier = e.target.files?.[0];
          if (fichier) void envoyer(fichier);
        }}
      />

      {value ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/[0.08]">
          <Image src={value} alt="Photo de la moto" fill className="object-cover" sizes="(max-width: 768px) 100vw, 40rem" />
          <button
            type="button"
            onClick={retirer}
            className="absolute right-2 top-2 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/90"
          >
            <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
            Retirer
          </button>
        </div>
      ) : (
        <label
          htmlFor="photo"
          className="flex aspect-[16/10] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] text-white/40 transition-colors hover:border-white/25 hover:text-white/70"
        >
          <FontAwesomeIcon
            icon={envoiEnCours ? faCircleNotch : faCamera}
            className={`h-6 w-6 ${envoiEnCours ? "animate-spin" : ""}`}
          />
          <span className="text-sm">{envoiEnCours ? "Envoi en cours" : "Ajouter une photo"}</span>
          <span className="text-xs text-white/25">JPEG, PNG ou WebP, 2 Mo maximum</span>
        </label>
      )}

      {erreur && <p className="text-xs text-destructive">{erreur}</p>}
    </div>
  );
}
