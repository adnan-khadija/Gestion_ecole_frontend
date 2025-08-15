"use client";
import Image from "next/image";
import { useState } from "react";
import { FiBell, FiUser, FiChevronDown } from "react-icons/fi";

export const Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Données simulées
  const notifications = [
    { id: 1, text: "Nouveau message reçu", time: "10 min ago" },
    { id: 2, text: "Votre cours a été approuvé", time: "1h ago" },
  ];

  return (
    <header className="bg-white shadow-sm z-30 w-full">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Partie gauche (vide ou pour recherche) */}
        <div>
            <Image src="/images/logo.png" alt="Logo" width={150} height={50} className="h-10 ml-8" />
        </div>

        {/* Partie droite avec icônes */}
        <div className="flex items-center space-x-6">
          {/* Bouton Notifications */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 rounded-full hover:bg-gray-100 relative text-[#8A8A19]"
            >
              <FiBell className="text-xl" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>

            {/* Dropdown Notifications */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-[#8A8A19]">Notifications</p>
                </div>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm text-gray-800">{notification.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-gray-500">Aucune notification</p>
                )}
                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-xs text-[#8A8A19] hover:underline">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profil Utilisateur */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-full p-1 pr-2"
            >
              <div className="w-8 h-8 rounded-full bg-[#8A8A19] flex items-center justify-center text-white">
                <FiUser />
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
              <FiChevronDown className={`text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm text-gray-800">Connecté en tant que</p>
                  <p className="text-sm font-medium text-[#0d68ae]">admin@example.com</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Mon profil
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Paramètres
                </button>
                <div className="border-t border-gray-200">
                  <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50">
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};