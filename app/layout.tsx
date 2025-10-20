// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ToasterProvider } from "@/components/ToasterProvider";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export const metadata: Metadata = {
  title: "Gestion d'école",
  description: "Application de gestion d'école",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="h-screen">
        <AuthenticatedLayout>
          {children}
        </AuthenticatedLayout>
        <ToasterProvider />
      </body>
    </html>
  );
}