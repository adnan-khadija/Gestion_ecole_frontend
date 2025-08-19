"use client";
import { useState } from "react";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { FaBook, FaThLarge, FaUsers, FaCog, FaCalendar } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MenuItem = {
  nom: string;
  icone: React.ReactNode;
  lien: string;
};

const Sidebar = () => {
  const [estOuvert, setEstOuvert] = useState(true);
  const [elementActif, setElementActif] = useState("/");
  const router = useRouter();

  const elementsMenu: MenuItem[] = [
    { nom: "Tableau de bord", icone: <FaThLarge />, lien: "/" },
    { nom: "Étudiants", icone: <FaUsers />, lien: "/student" },
    { nom: "Cours", icone: <FaBook />, lien: "/cours" },
    { nom: "Emploi du temps", icone: <FaCalendar />, lien: "/emploi-du-temps" },
    { nom: "Paramètres", icone: <FaCog />, lien: "/parametres" },
  ];

  const handleDeconnexion = () => {
    console.log("Déconnexion");
    router.push("/connexion");
  };

  return (
    <>
      <button
        onClick={() => setEstOuvert(!estOuvert)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#0d68ae] text-white shadow-md hover:bg-opacity-90 transition-all"
      >
        {estOuvert ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <div
        className={`${estOuvert ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 fixed md:relative w-64 h-full bg-white shadow-xl z-40
          transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-center bg-[#f8fafc]">
          <Link href="/">
            <Image 
              src="/images/logo.png" 
              alt="Logo" 
              width={160} 
              height={60} 
              className="object-contain hover:scale-105 transition-transform"
              priority
            />
          </Link>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {elementsMenu.map((item) => (
              <li key={item.lien}>
                <Link
                  href={item.lien}
                  onClick={() => setElementActif(item.lien)}
                  className={`flex items-center p-3 rounded-xl transition-all
                    ${elementActif === item.lien 
                      ? 'bg-[#00d084] text-white shadow-md'
                      : 'text-[#8A8A19] hover:bg-[#f8fafc] hover:text-[#00d084]'}`}
                >
                  <span className={`mr-3 text-lg ${elementActif === item.lien ? 'text-white' : 'text-current'}`}>
                    {item.icone}
                  </span>
                  <span className="font-medium">{item.nom}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleDeconnexion}
            className="w-full flex items-center justify-center p-3 rounded-xl bg-[#f8fafc] text-[#8A8A19] hover:bg-[#caf880] hover:text-[#0d68ae] transition-all"
          >
            <FiLogOut className="mr-3 text-lg" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
