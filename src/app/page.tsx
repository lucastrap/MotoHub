import Link from "next/link";
import { Button } from "@/components/ui/button";
import MotorcycleScene from "@/components/3d/MotorcycleScene";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMotorcycle, faWrench, faCogs, faGaugeHigh, faShieldHalved } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar Minimaliste */}
      <header className="px-6 lg:px-14 h-20 flex items-center border-b bg-background/95 backdrop-blur z-50 sticky top-0 justify-between">
        <Link className="flex items-center justify-center gap-3" href="/">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/30">
            <FontAwesomeIcon icon={faMotorcycle} className="h-6 w-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase">Moto<span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Tracker</span> Pro</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild className="hidden sm:inline-flex rounded-full">
            <Link href="/login">Connexion</Link>
          </Button>
          <Button asChild className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
            <Link href="/register">Commencer</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Section Hero */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden relative">
          <div className="absolute top-0 right-0 -z-10 w-full h-[800px] opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/40 via-background to-background" />
          
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] items-center">
              
              {/* Contenu Texte */}
              <div className="flex flex-col justify-center space-y-8 z-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center rounded-full border px-3 py-1 font-semibold text-primary text-sm shadow-sm">
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                    La nouvelle référence pour votre garage
                  </div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-[1.1]">
                    Gérez votre <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500 drop-shadow-sm">bécane</span> <br />
                    comme un pro.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Le tableau de bord ultime pour le suivi de vos entretiens, des coûts et pour dénicher les meilleures pièces détachées de votre marque.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 transition-transform hover:scale-105" asChild>
                    <Link href="/register">Créer mon garage</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full" asChild>
                    <Link href="/login">Accéder à mon tableau de bord</Link>
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-muted/50">
                  <div className="flex items-center gap-2">
                     <FontAwesomeIcon icon={faWrench} className="text-primary h-5 w-5" />
                     <span className="text-sm font-medium">Carnet d'entretien</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <FontAwesomeIcon icon={faCogs} className="text-primary h-5 w-5" />
                     <span className="text-sm font-medium">Pièces détachées</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <FontAwesomeIcon icon={faGaugeHigh} className="text-primary h-5 w-5" />
                     <span className="text-sm font-medium">Suivi kilométrage</span>
                  </div>
                </div>
              </div>

              {/* Scène 3D */}
              <div className="flex justify-center xl:justify-end relative rounded-2xl">
                 <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-3xl blur-3xl -z-10"></div>
                 <MotorcycleScene />
              </div>
            </div>
          </div>
        </section>

        {/* Section Features */}
        <section className="w-full py-24 bg-muted/40 border-y">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Pourquoi MotoTracker ?</h2>
              <p className="text-muted-foreground md:text-xl max-w-2xl mx-auto text-balance">
                Des outils pensés pour les passionnés. Ne perdez plus jamais l'historique de vos factures et interventions.
              </p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center p-8 bg-card rounded-3xl shadow-sm border transform hover:-translate-y-2 transition-all duration-300">
                <div className="bg-primary/10 p-5 rounded-full mb-6">
                  <FontAwesomeIcon icon={faShieldHalved} className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-wide">Suivi Sécurisé</h3>
                <p className="text-muted-foreground">Enregistrez toutes vos interventions, réparations et factures dans un espace sûr accessible partout.</p>
              </div>

              <div className="flex flex-col items-center text-center p-8 bg-card rounded-3xl shadow-sm border transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0"></div>
                <div className="bg-primary p-5 rounded-full mb-6 shadow-lg shadow-primary/30 z-10 text-primary-foreground">
                  <FontAwesomeIcon icon={faCogs} className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-wide z-10">Recherche de Pièces</h3>
                <p className="text-muted-foreground z-10">Accédez directement aux meilleurs sites de revendeurs de pièces détachées adaptés à la marque de votre précieuse.</p>
              </div>

              <div className="flex flex-col items-center text-center p-8 bg-card rounded-3xl shadow-sm border transform hover:-translate-y-2 transition-all duration-300">
                <div className="bg-primary/10 p-5 rounded-full mb-6">
                  <FontAwesomeIcon icon={faGaugeHigh} className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-wide">Rappels Automatiques</h3>
                <p className="text-muted-foreground">Soyez notifié pour l'entretien de votre kit chaîne ou de votre prochaine révision moteur.*</p>
                <div className="mt-4 text-[10px] text-muted-foreground/60 w-full text-right">*À venir</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 text-center border-t bg-card text-muted-foreground text-sm flex items-center justify-center gap-2">
         © {new Date().getFullYear()} MotoTracker Pro <span className="mx-2">•</span> Conçu pour les pilotes passionnés
         <FontAwesomeIcon icon={faMotorcycle} className="text-primary/50 ml-1" />
      </footer>
    </div>
  );
}
