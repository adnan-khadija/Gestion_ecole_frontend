import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/SideBar";
import { Header } from "@/components/Header";
import { ToasterProvider } from "@/components/ToasterProvider"; // Créez ce composant

export const metadata: Metadata = {
  title: "Gestion d'école",
  description: "Application de gestion d'école",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="h-screen overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar fixe */}
          <Sidebar className="fixed top-0 left-0 h-screen" />

          {/* Contenu principal */}
          <div className="flex flex-col flex-1">
            <Header /> {/* Header fixe */}
            <main className="flex-1 overflow-auto bg-gray-50">
              
              {children}
            </main>
          </div>
        </div>
        <ToasterProvider />

      </body>
    </html>
  );
}
