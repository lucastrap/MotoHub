import Link from "next/link";
import { Button } from "@/components/ui/button";
import MotorcycleScene from "@/components/3d/MotorcycleScene";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMotorcycle,
  faWrench,
  faCogs,
  faGaugeHigh,
  faShieldHalved,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#090909] text-white overflow-x-hidden">
      {/* Barre d'accent en haut */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />

      {/* Navbar */}
      <header className="px-6 lg:px-16 h-[72px] flex items-center z-50 sticky top-0 justify-between bg-[#090909]/80 backdrop-blur-md border-b border-white/[0.06]">
        <Link className="flex items-center gap-3" href="/">
          <div className="bg-primary p-2 rounded text-white shadow-lg shadow-primary/40">
            <FontAwesomeIcon icon={faMotorcycle} className="h-5 w-5" />
          </div>
          <span className="font-display font-black text-xl tracking-tight uppercase">
            Moto<span className="text-primary">Track</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          <Button
            variant="ghost"
            asChild
            className="text-white/50 hover:text-white hover:bg-white/5 rounded"
          >
            <Link href="/login">Connexion</Link>
          </Button>
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-white rounded shadow-lg shadow-primary/20 border-0 font-bold"
          >
            <Link href="/register">Commencer</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* ── HERO ── */}
        <section className="relative min-h-[calc(100vh-72px)] grid lg:grid-cols-[1fr_1fr] items-center overflow-hidden">
          {/* Effets de fond */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[140px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-900/8 rounded-full blur-[100px]" />
            {/* Lignes de vitesse */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.025] to-transparent"
                style={{ top: `${20 + i * 18}%` }}
              />
            ))}
          </div>

          {/* Contenu gauche */}
          <div className="flex flex-col justify-center gap-8 px-8 lg:px-16 xl:px-24 py-20 z-10">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 text-primary text-xs font-bold tracking-[0.2em] uppercase w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Tableau de bord moto nouvelle génération
            </div>

            {/* Titre principal */}
            <div>
              <h1 className="font-display font-black uppercase leading-[0.88] tracking-tight text-[clamp(3.8rem,8.5vw,7.5rem)] text-white">
                Ton garage.
              </h1>
              <h1 className="font-display font-black uppercase leading-[0.88] tracking-tight text-[clamp(3.8rem,8.5vw,7.5rem)] text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                Ton contrôle.
              </h1>
            </div>

            <p className="text-white/45 text-lg max-w-md leading-relaxed">
              Suivi d&apos;entretien, historique complet, recherche de pièces et rappels
              intelligents. Tout ce qu&apos;il faut pour garder ta moto au top.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                size="lg"
                asChild
                className="bg-primary hover:bg-primary/90 text-white h-14 px-8 text-base font-bold rounded group border-0 shadow-2xl shadow-primary/20"
              >
                <Link href="/register" className="flex items-center gap-3">
                  Créer mon garage
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-14 px-8 text-base rounded border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 bg-transparent"
              >
                <Link href="/login">Accéder au dashboard</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-10 pt-6 border-t border-white/[0.08]">
              {[
                { value: "100%", label: "Gratuit" },
                { value: "∞", label: "Motos" },
                { value: "24/7", label: "Accès" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-2xl font-black text-white">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-white/35 uppercase tracking-widest mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scène 3D droite */}
          <div className="relative h-[480px] lg:h-full min-h-[480px] lg:min-h-[calc(100vh-72px)]">
            {/* Dégradé de fondu vers la gauche */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#090909] to-transparent z-10 pointer-events-none" />
            <MotorcycleScene />
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-28 px-8 lg:px-16 xl:px-24">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14">
              <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-4">
                Fonctionnalités
              </p>
              <h2 className="font-display font-black uppercase text-[clamp(2.2rem,5vw,3.8rem)] text-white leading-[0.92]">
                Tout ce dont
                <br />
                tu as besoin.
              </h2>
            </div>

            {/* Grille de features — séparations fines */}
            <div className="grid gap-px bg-white/[0.06] rounded-2xl overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: faShieldHalved,
                  title: "Carnet d'entretien",
                  desc: "Historique complet de toutes tes interventions, réparations et factures. Sécurisé, accessible partout.",
                  highlight: false,
                },
                {
                  icon: faCogs,
                  title: "Pièces détachées",
                  desc: "Accès direct aux meilleurs revendeurs de pièces adaptés à la marque de ta moto.",
                  highlight: true,
                },
                {
                  icon: faGaugeHigh,
                  title: "Rappels intelligents",
                  desc: "Notifications pour ton kit chaîne, l'huile moteur et ta prochaine révision. Ne rate plus rien.",
                  highlight: false,
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className={`p-8 lg:p-10 flex flex-col gap-6 transition-colors ${
                    feature.highlight
                      ? "bg-primary/10 hover:bg-primary/15"
                      : "bg-[#0e0e0e] hover:bg-white/[0.04]"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      feature.highlight
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    <FontAwesomeIcon icon={feature.icon} className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-base font-bold uppercase tracking-widest text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/45 leading-relaxed text-sm">{feature.desc}</p>
                  </div>

                  <div
                    className={`pt-4 border-t ${
                      feature.highlight ? "border-primary/20" : "border-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        feature.highlight ? "text-primary" : "text-white/20"
                      }`}
                    >
                      {feature.highlight ? "Disponible →" : "Inclus →"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 px-8 lg:px-16 xl:px-24 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-orange-900/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
            <h2 className="font-display font-black uppercase text-[clamp(3rem,7vw,6rem)] text-white leading-[0.88]">
              Prêt à tout
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                maîtriser ?
              </span>
            </h2>
            <p className="text-white/45 text-lg max-w-md">
              Rejoins les passionnés qui ne laissent plus rien au hasard.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-primary hover:bg-primary/90 text-white h-16 px-14 text-lg font-bold rounded shadow-2xl shadow-primary/25 border-0"
            >
              <Link href="/register">Démarrer maintenant →</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-8 lg:px-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white/20 text-sm">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faMotorcycle} className="text-primary/40" />
            <span>© {new Date().getFullYear()} MotoTrack</span>
          </div>
          <span>Conçu pour les pilotes passionnés</span>
        </div>
      </footer>
    </div>
  );
}
