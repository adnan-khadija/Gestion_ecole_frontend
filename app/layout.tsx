import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/SideBar";
import { Header } from "@/components/Header";


export const metadata: Metadata = {
  title: "Gestion d'école",
  description: "Application de gestion d'école",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="h-screen overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header fixe en haut */}
          <Header />
          
          <div className="flex flex-1 overflow-hidden relative">
            {/* Sidebar en premier plan */}
            <Sidebar />
            
            {/* Contenu principal */}
            <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
