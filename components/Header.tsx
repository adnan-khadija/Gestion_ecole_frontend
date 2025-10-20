"use client";

import { useState, useEffect } from "react";
import { FiBell, FiUser, FiChevronDown, FiLogOut, FiSettings, FiHelpCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { fetchCurrentUser } from '@/lib/auth';

interface UserData {
  userId: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  telephone?: string;
}

interface Notification {
  id: number;
  text: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
}

export const Header = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  // Récupérer les données utilisateur complètes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          router.push('/');
          return;
        }

        const response = await fetchCurrentUser();
        const userDataFromApi = response.data || response;
        
        setUserData({
          userId: userDataFromApi.userId || userDataFromApi.id,
          email: userDataFromApi.email,
          nom: userDataFromApi.nom,
          prenom: userDataFromApi.prenom,
          role: userDataFromApi.role,
          telephone: userDataFromApi.telephone
        });

        // Simuler des notifications
        setNotifications([
          { 
            id: 1, 
            text: "Bienvenue dans votre espace " + getRoleTitle(userDataFromApi.role), 
            time: "Maintenant", 
            type: 'success', 
            read: false 
          },
          { 
            id: 2, 
            text: "Votre dernier cours a été enregistré", 
            time: "10 min ago", 
            type: 'info', 
            read: false 
          },
        ]);

      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const getRoleTitle = (role: string): string => {
    const roles: { [key: string]: string } = {
      'ADMINISTRATION': 'Administrateur',
      'ENSEIGNANT': 'Enseignant',
      'ETUDIANT': 'Étudiant'
    };
    return roles[role] || 'Utilisateur';
  };

  const getInitials = (prenom: string, nom: string): string => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      info: "🔵",
      warning: "🟡",
      success: "🟢",
      error: "🔴"
    };
    return icons[type as keyof typeof icons] || "🔵";
  };

  const handleDeconnexion = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('userId');
    Cookies.remove('email');
    router.push('/');
  };

  const handleProfileAction = (action: string) => {
    setIsProfileOpen(false);
    switch (action) {
      case 'profile':
        router.push('/profile');
        break;
      case 'settings':
        router.push('/parametres');
        break;
      case 'help':
        router.push('/aide');
        break;
      case 'logout':
        handleDeconnexion();
        break;
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Fermer les dropdowns en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-button')) {
        setIsNotificationOpen(false);
      }
      if (!target.closest('.profile-dropdown') && !target.closest('.profile-button')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <header className="bg-white shadow-sm z-30 w-full border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex-1">
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mt-1"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm z-30 w-full border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Partie gauche - Titre contextuel avec nom et prénom */}
        <div className="flex-1">
         
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="notification-button p-2 rounded-full hover:bg-[#F5E9DA] text-[#D4A017] relative transition-colors"
            >
              <FiBell className="text-xl" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#A52A2A] text-white text-xs flex items-center justify-center font-medium">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            
            {isNotificationOpen && (
              <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-[#F5E9DA] to-[#FFF7EE]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#A52A2A]">
                      Notifications
                    </p>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-xs bg-[#A52A2A] text-white px-2 py-1 rounded-full">
                        {unreadNotificationsCount} non lue(s)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-sm mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 leading-tight">
                              {notification.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <FiBell className="text-3xl text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Aucune notification</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profil avec nom et prénom complets */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="profile-button flex items-center space-x-3 hover:bg-[#F5E9DA] rounded-lg px-3 py-2 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A52A2A] to-[#D4A017] flex items-center justify-center text-white font-semibold text-sm">
                {userData ? getInitials(userData.prenom, userData.nom) : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800 leading-tight">
                  {userData?.prenom} {userData?.nom}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                  {getRoleTitle(userData?.role || '')}
                </p>
              </div>
              <FiChevronDown
                className={`text-[#D4A017] transition-transform ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                {/* En-tête du profil avec informations complètes */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-[#F5E9DA] to-[#FFF7EE]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A52A2A] to-[#D4A017] flex items-center justify-center text-white font-semibold">
                      {userData ? getInitials(userData.prenom, userData.nom) : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {userData?.prenom} {userData?.nom}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {userData?.email}
                      </p>
                      <p className="text-xs text-[#A52A2A] font-medium mt-1">
                        {getRoleTitle(userData?.role || '')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions du profil */}
                <div className="py-1">
                  <button
                    onClick={() => handleProfileAction('profile')}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FiUser className="text-gray-400" />
                    <span>Mon profil</span>
                  </button>
                  
                  <button
                    onClick={() => handleProfileAction('settings')}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FiSettings className="text-gray-400" />
                    <span>Paramètres</span>
                  </button>
                  
                  <button
                    onClick={() => handleProfileAction('help')}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FiHelpCircle className="text-gray-400" />
                    <span>Aide & Support</span>
                  </button>
                </div>

                {/* Déconnexion */}
                <div className="border-t border-gray-200 py-1">
                  <button
                    onClick={() => handleProfileAction('logout')}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="text-red-500" />
                    <span>Déconnexion</span>
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