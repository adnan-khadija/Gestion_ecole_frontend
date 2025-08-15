"use client";
import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { FaBook, FaThLarge, FaUsers, FaCog, FaCalendar, FaChalkboardTeacher } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MenuItem = {
  nom: string;
  icone: React.ReactNode;
  lien: string;
  sousMenu?: SousMenuItem[];
};

type SousMenuItem = {
  nom: string;
  lien: string;
};

const Sidebar = () => {
  const [elementActif, setElementActif] = useState("/");
  const router = useRouter();

  const elementsMenu: MenuItem[] = [
    { nom: "Tableau de bord", icone: <FaThLarge className="text-[#8A8A19]" />, lien: "/" },
    { nom: "Étudiants", icone: <FaUsers />, lien: "/student" },
    { nom: "Professeurs", icone: <FaChalkboardTeacher />, lien: "/professeurs" },
    { nom: "Cours", icone: <FaBook />, lien: "/cours" },
    { nom: "Emploi du temps", icone: <FaCalendar />, lien: "/emploi-du-temps" },
    { nom: "Paramètres", icone: <FaCog />, lien: "/parametres" },
  ];

  const handleDeconnexion = () => {
    console.log("Déconnexion");
    router.push("/connexion");
  };

  return (
    <div className="w-56 h-full bg-white shadow-xl flex flex-col">
      {/* Éléments du menu */}
      <nav className="p-8 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {elementsMenu.map((item) => (
            <li key={item.lien}>
              <Link
                href={item.lien}
                onClick={() => setElementActif(item.lien)}
                className={`flex items-center p-3 rounded-xl transition-all
                  ${elementActif === item.lien 
                    ? 'bg-gray-100 text-[#8A8A19]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#8A8A19]'}`}
              >
                <span className="mr-3 text-md text-[#8A8A19]">
                  {item.icone}
                </span>
                <span className="font-medium text-sm">{item.nom}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bouton de déconnexion */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleDeconnexion}
          className="w-full flex items-center justify-center p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-[#8A8A19] hover:text-white transition-all"
        >
          <FiLogOut className="mr-3 text-md" />
          <span className="font-medium text-sm">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;