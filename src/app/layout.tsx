import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import OfflineGuard from "@/components/pwa/OfflineGuard";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "MotoTrack",
  description: "Suivi d'entretien moto : carnet, historique kilométrique et échéances.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    // iOS ignore les icônes du manifest : sans apple-touch-icon, l'ajout à
    // l'écran d'accueil utilise une capture de la page.
    apple: "/icons/icon-192x192.png",
  },

  appleWebApp: {
    capable: true,
    title: "MotoTrack",
    statusBarStyle: "black-translucent",
  },
  // Équivalent standard (non-Apple) de apple-mobile-web-app-capable.
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#e60026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${barlowCondensed.variable} font-sans`}>
        {children}
        <ServiceWorkerRegister />
        <OfflineGuard />
        <SpeedInsights />
      </body>
    </html>
  );
}
