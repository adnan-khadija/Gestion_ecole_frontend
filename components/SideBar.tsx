"use client";

import { FiLogOut } from "react-icons/fi";
import { 
  FaThLarge, FaUsers, FaChalkboardTeacher, FaBook, 
  FaCalendar, FaCog, FaFileAlt, FaRegCalendarCheck, FaMoneyBillWave, 
  FaCreditCard,
  FaClipboardList
} from 'react-icons/fa';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

type MenuItem = {
  nom: string;
  icone: React.ReactNode;
  lien: string;
};

const PRIMARY_BROWN = "#A52A2A";
const ACCENT_GOLD = "#D4A017";
const TEXT_DARK = "#2C2C2C";

const elementsMenu: MenuItem[] = [
  { nom: "Tableau de bord", icone: <FaThLarge />, lien: "/dashboard" },
  { nom: "Étudiants", icone: <FaUsers />, lien: "/student" },
  { nom: "Professeurs", icone: <FaChalkboardTeacher />, lien: "/professeurs" },
  { nom: "Formations", icone: <FaBook />, lien: "/formations" },
  { nom: "Diplômes", icone: <FaFileAlt />, lien: "/diplomes" },
  { nom: "Emploi du temps", icone: <FaCalendar />, lien: "/emploi-du-temps" },
  {nom:" Programmes", icone:<FaClipboardList/>, lien:"/programmes"},
  { nom: "Absence", icone: <FaRegCalendarCheck />, lien: "/absence" },
  { nom: "Dépense", icone: <FaMoneyBillWave />, lien: "/depense" },
  { nom: "Paiement", icone: <FaCreditCard />, lien: "/paiement" }, 
  { nom: "Paramètres", icone: <FaCog />, lien: "/parametres" },
];

export default function Sidebar() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const handleDeconnexion = () => {
    router.push("/connexion");
  };

  return (
    <aside className="w-56 flex-shrink-0 h-screen bg-white shadow-xl flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4 flex items-center justify-center border-b border-gray-200">
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={120}
          height={40}
          className="h-10 object-contain"
        />
      </div>

      {/* Menu */}
      <nav className="p-6 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {elementsMenu.map((item) => {
            const actif = pathname === item.lien;
            return (
              <li key={item.lien} className="w-full">
                <Link
                  href={item.lien}
                  className={`flex items-center w-full p-3 rounded-xl transition-all select-none ${
                    actif ? "bg-[#F5E9DA] shadow-sm" : "hover:bg-[#F5E9DA]"
                  }`}
                >
                  <span className="mr-3 text-lg flex-shrink-0" style={{ color: PRIMARY_BROWN }}>
                    {item.icone}
                  </span>
                  <span
                    className="font-medium text-sm truncate"
                    style={{ color: actif ? PRIMARY_BROWN : TEXT_DARK }}
                  >
                    {item.nom}
                  </span>
                  {actif && (
                    <span
                      className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ACCENT_GOLD }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleDeconnexion}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#FFF7EE] border border-gray-200 hover:bg-[#F5E9DA] transition-all"
        >
          <FiLogOut className="text-md" style={{ color: PRIMARY_BROWN }} />
          <span className="font-medium text-sm" style={{ color: PRIMARY_BROWN }}>
            Déconnexion
          </span>
        </button>
      </div>
    </aside>
  );
}
