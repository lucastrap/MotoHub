"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWifi, faRotateRight } from "@fortawesome/free-solid-svg-icons";


export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#090909] px-8 text-center text-white">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 text-white/40">
        <FontAwesomeIcon icon={faWifi} className="h-9 w-9" />
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-[clamp(2.5rem,10vw,4rem)] font-black uppercase leading-[0.9] tracking-tight">
          Hors <span className="text-primary">ligne</span>
        </h1>
        <p className="max-w-sm text-white/45 leading-relaxed">
          Aucune connexion Internet détectée. Reconnecte-toi pour retrouver ton
          garage, ton carnet d&apos;entretien et tes échéances.
        </p>
      </div>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-3 rounded bg-primary px-8 py-4 text-base font-bold text-white shadow-2xl shadow-primary/20 transition-colors hover:bg-primary/90"
      >
        <FontAwesomeIcon icon={faRotateRight} className="h-4 w-4" />
        Réessayer
      </button>
    </div>
  );
}
