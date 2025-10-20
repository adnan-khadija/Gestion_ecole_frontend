"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/SideBar";
import { Header } from "@/components/Header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const noLayoutPages = ["/", "/connexion", "/inscription"];
  
  const showLayout = !noLayoutPages.includes(pathname);

  if (!showLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="flex flex-col flex-1 "> {}
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}