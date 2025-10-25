'use client';

import React from 'react';
import { FaClipboardList, FaBook, FaClock } from "react-icons/fa";
import Link from 'next/link';

const PRIMARY_BROWN = "#A52A2A";
const ACCENT_GOLD = "#D4A017";
const CREAM = "#F5E9DA";

const navigationModules = [
  {
    title: "Gestion des Absences",
    description: "Marquer et gérer les absences des étudiants",
    icon: <FaClipboardList size={24} />,
    href: "/enseignant/absences",
    color: "#A52A2A"
  },
  {
    title: "Gestion des Notes",
    description: "Saisir et consulter les notes des étudiants",
    icon: <FaBook size={24} />,
    href: "/enseignant/notes",
    color: "#D4A017"
  },
  {
    title: "Emploi du Temps",
    description: "Consulter l'emploi du temps des cours",
    icon: <FaClock size={24} />,
    href: "/enseignant/emploi-du-temps",
    color: "#8B4513"
  }
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-4xl w-full">
        {/* Message de bienvenue */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: PRIMARY_BROWN }}>
            Bienvenue sur votre Tableau de Bord
          </h1>
          <p className="text-xl" style={{ color: ACCENT_GOLD }}>
            Gérez vos activités pédagogiques en toute simplicité
          </p>
        </div>

        {/* Modules de navigation centrés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {navigationModules.map((module, index) => (
            <Link key={index} href={module.href} className="block">
              <div 
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] cursor-pointer text-center h-full flex flex-col items-center"
              >
                <div 
                  className="p-4 rounded-full mb-4"
                  style={{ backgroundColor: `${module.color}15` }}
                >
                  {React.cloneElement(module.icon, { 
                    style: { color: module.color } 
                  })}
                </div>
                
                <h3 
                  className="text-lg font-semibold mb-3"
                  style={{ color: PRIMARY_BROWN }}
                >
                  {module.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed flex-grow">
                  {module.description}
                </p>
                
                <div 
                  className="mt-4 text-sm px-4 py-2 rounded-full font-medium transition-colors"
                  style={{ 
                    backgroundColor: `${module.color}15`, 
                    color: module.color 
                  }}
                >
                  Accéder
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;