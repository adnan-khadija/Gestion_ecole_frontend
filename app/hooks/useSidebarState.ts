import { useState, useEffect } from 'react';

export function useSidebarState() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Sauvegarder l'état dans le localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-open-menus');
    if (savedState) {
      setOpenMenus(JSON.parse(savedState));
    }
  }, []);

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => {
      const newState = {
        ...prev,
        [menuName]: !prev[menuName]
      };
      localStorage.setItem('sidebar-open-menus', JSON.stringify(newState));
      return newState;
    });
  };

  return { openMenus, toggleMenu };
}