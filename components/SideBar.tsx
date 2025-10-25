"use client";
import { FiLogOut } from "react-icons/fi";
import {
  FaHome, FaUsers, FaGraduationCap, FaCalendar,
  FaPuzzlePiece, FaMoneyBillWave, FaFileAlt, FaCog,
  FaBook, FaTasks, FaUserGraduate, FaFileUpload,
  FaCreditCard, FaDownload, FaChartLine
} from 'react-icons/fa';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { fetchCurrentUser } from '@/lib/auth';

type MenuItem = {
  nom: string;
  icone: React.ReactNode;
  lien: string;
};

type UserRole = 'ADMINISTRATION' | 'ENSEIGNANT' | 'ETUDIANT';

const PRIMARY_COLOR = "#A52A2A";
const ACTIVE_BG = "#F5E9DA";
const TEXT_DARK = "#2C2C2C";

// Configuration des menus par rôle - TOUS LES LIENS DIRECTS
const elementsMenuParRole: Record<UserRole, MenuItem[]> = {
  ADMINISTRATION: [
    { 
      nom: "Tableau de bord", 
      icone: <FaHome className="text-lg" />, 
      lien: "/admin/dashboard"
    },
    { 
      nom: "Étudiants", 
      icone: <FaUsers className="text-lg" />, 
      lien: "/admin/students"
    },
    { 
      nom: "Enseignants", 
      icone: <FaGraduationCap className="text-lg" />, 
      lien: "/admin/professeurs"
    },
    { 
      nom: "Formations", 
      icone: <FaGraduationCap className="text-lg" />, 
      lien: "/admin/formations"
    },
    { 
      nom: "Modules", 
      icone: <FaBook className="text-lg" />, 
      lien: "/admin/modules"
    },
    { 
      nom: "Programmes", 
      icone: <FaChartLine className="text-lg" />, 
      lien: "/admin/programmes"
    },
    { 
      nom: "Emploi du temps", 
      icone: <FaCalendar className="text-lg" />, 
      lien: "/admin/emploi-du-temps"
    },
    { 
      nom: "Notes", 
      icone: <FaPuzzlePiece className="text-lg" />, 
      lien: "/admin/notes"
    },
    { 
      nom: "Absences", 
      icone: <FaTasks className="text-lg" />, 
      lien: "/admin/absences"
    },
    { 
      nom: "Dépenses", 
      icone: <FaMoneyBillWave className="text-lg" />, 
      lien: "/admin/depenses"
    },
    { 
      nom: "Paiements", 
      icone: <FaCreditCard className="text-lg" />, 
      lien: "/admin/paiement"
    },
    { 
      nom: "Diplômes", 
      icone: <FaFileAlt className="text-lg" />, 
      lien: "/admin/diplomes"
    },
    { 
      nom: "Paramètres", 
      icone: <FaCog className="text-lg" />, 
      lien: "/admin/parametres"
    },
  ],
  
  ENSEIGNANT: [
    { 
      nom: "Accueil", 
      icone: <FaHome className="text-lg" />, 
      lien: "/enseignant/dashboard"
    },
  
    { 
      nom: "Emploi du temps", 
      icone: <FaCalendar className="text-lg" />, 
      lien: "/enseignant/emploi-du-temps"
    },
    { 
      nom: "Saisie des notes", 
      icone: <FaPuzzlePiece className="text-lg" />, 
      lien: "/enseignant/notes"
    },
    { 
      nom: "Gestion des absences", 
      icone: <FaTasks className="text-lg" />, 
      lien: "/enseignant/absences"
    },
    
  
  ],
  
  ETUDIANT: [
    { 
      nom: "Tableau de bord", 
      icone: <FaHome className="text-lg" />, 
      lien: "/etudiant/dashboard"
    },
    { 
      nom: "Mes Cours", 
      icone: <FaBook className="text-lg" />, 
      lien: "/etudiant/mes-cours"
    },
    { 
      nom: "Emploi du temps", 
      icone: <FaCalendar className="text-lg" />, 
      lien: "/etudiant/emploi-du-temps"
    },
    { 
      nom: "Mes Notes", 
      icone: <FaPuzzlePiece className="text-lg" />, 
      lien: "/etudiant/notes"
    },
    { 
      nom: "Mes Absences", 
      icone: <FaTasks className="text-lg" />, 
      lien: "/etudiant/mes-absences"
    },
    { 
      nom: "Mes Paiements", 
      icone: <FaCreditCard className="text-lg" />, 
      lien: "/etudiant/paiements"
    },
    { 
      nom: "Mes Documents", 
      icone: <FaDownload className="text-lg" />, 
      lien: "/etudiant/documents"
    },
  ]
};

export default function Sidebar() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupérer uniquement le rôle pour la sidebar
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = Cookies.get('token');
        
        if (!token) {
          router.push('/');
          return;
        }

        const response = await fetchCurrentUser();
        const userDataFromApi = response.data || response;
        
        setUserRole(userDataFromApi.role as UserRole);

      } catch (err: any) {
        console.error('Erreur lors de la récupération du rôle:', err);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [router]);

  const handleDeconnexion = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('userId');
    Cookies.remove('email');
    router.push('/');
  };

  // Obtenir les éléments du menu selon le rôle
  const getMenuItems = (): MenuItem[] => {
    if (!userRole) return [];
    return elementsMenuParRole[userRole] || [];
  };

  if (loading) {
    return (
      <aside className="w-64 flex-shrink-0 h-screen bg-white shadow-xl flex flex-col border-r border-gray-200">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A52A2A]"></div>
        </div>
      </aside>
    );
  }

  if (!userRole) {
    return null;
  }

  const menuItems = getMenuItems();
  const isActiveRoute = (lien: string) => pathname === lien;

  return (
    <aside className="w-64 flex-shrink-0 h-screen bg-white shadow-xl flex flex-col border-r border-gray-200">
      {/* En-tête simplifié avec logo */}
      <div className="px-6 py-4 flex items-center justify-center border-b border-gray-200">
        <Image 
          src="/images/logo.png" 
          alt="Logo" 
          width={140} 
          height={36} 
          className="h-8 object-contain" 
          priority
        />
      </div>

      {/* Navigation - TOUS LES ÉLÉMENTS VISIBLES DIRECTEMENT */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = isActiveRoute(item.lien);
              
              return (
                <li key={item.lien} className="w-full">
                  <Link
                    href={item.lien}
                    className={`flex items-center w-full p-3 rounded-xl transition-all select-none border ${
                      isActive 
                        ? "bg-[#F5E9DA] shadow-sm border-[#A52A2A]/30" 
                        : "hover:bg-[#F5E9DA] hover:border-[#A52A2A]/10 border-transparent"
                    }`}
                  >
                    <span 
                      className="mr-3 flex-shrink-0"
                      style={{ color: PRIMARY_COLOR }}
                    >
                      {item.icone}
                    </span>
                    <span 
                      className="font-medium text-sm flex-1 text-left"
                      style={{ color: isActive ? PRIMARY_COLOR : TEXT_DARK }}
                    >
                      {item.nom}
                    </span>
                    {isActive && (
                      <span
                        className="ml-2 w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Section déconnexion */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleDeconnexion}
          className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-white border border-gray-300 hover:bg-red-50 hover:border-red-200 transition-all group"
        >
          <FiLogOut 
            className="text-md group-hover:text-red-600 transition-colors" 
            style={{ color: PRIMARY_COLOR }} 
          />
          <span 
            className="font-medium text-sm group-hover:text-red-700 transition-colors"
          >
            Déconnexion
          </span>
        </button>
        
        {/* Information de version */}
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500">
            {userRole === 'ADMINISTRATION' ? 'Admin' : 
             userRole === 'ENSEIGNANT' ? 'Enseignant' : 'Étudiant'} • v1.0
          </span>
        </div>
      </div>
    </aside>
  );
}