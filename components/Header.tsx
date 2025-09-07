"use client";

import { useState } from "react";
import { FiBell, FiUser, FiChevronDown } from "react-icons/fi";

export const Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifications = [
    { id: 1, text: "Nouveau message reçu", time: "10 min ago" },
    { id: 2, text: "Votre cours a été approuvé", time: "1h ago" },
  ];

  return (
    <header className="bg-white shadow-sm z-30 w-full">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Partie gauche vide car plus de bouton */}
        <div></div>

        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 rounded-full hover:bg-[#F5E9DA] text-[#D4A017]"
            >
              <FiBell className="text-xl" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#A52A2A]" />
              )}
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-1 z-50 border border-[#A52A2A]">
                <div className="px-4 py-2 border-b border-[#F5E9DA]">
                  <p className="text-sm font-medium text-[#A52A2A]">
                    Notifications
                  </p>
                </div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-[#F5E9DA]"
                  >
                    <p className="text-sm text-gray-800">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profil */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 hover:bg-[#F5E9DA] rounded-full p-1 pr-2"
            >
              <div className="w-8 h-8 rounded-full bg-[#A52A2A] flex items-center justify-center text-white">
                <FiUser />
              </div>
              <span className="text-sm font-medium text-[#2C2C2C]">Admin</span>
              <FiChevronDown
                className={`text-[#D4A017] transition-transform ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
