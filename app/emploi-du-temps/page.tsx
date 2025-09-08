"use client";

import { useState } from 'react';
import { FaSearch, FaTimes, FaFilter, FaChalkboardTeacher, FaBook, FaUniversity, FaCalendarAlt } from 'react-icons/fa';

// Composant Barre de Recherche
interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit: () => void;
  onReset: () => void;
  placeholder?: string;
  className?: string;
  showReset?: boolean;
}

const SearchBar = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onReset,
  placeholder = 'Rechercher un cours, professeur, salle...',
  className = '',
  showReset = true
}: SearchBarProps) => {
  return (
    <div className={`relative flex-1 min-w-[100px] ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        className="pl-10 pr-16 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A017] shadow-sm"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit()} 
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className="text-gray-400" />
      </div>
      <button
        onClick={onSearchSubmit}
        className="absolute inset-y-0 right-0 px-4 flex items-center bg-[#D4A017] text-white hover:bg-[#b88917] shadow-sm rounded-r-md transition-colors"
      >
        <FaSearch />
      </button>
      {showReset && searchTerm && (
        <button
          onClick={onReset}
          className="absolute inset-y-0 right-12 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

// Composant principal
const Schedule = () => {
  // Utilisation de votre palette de couleurs
  const colors = {
    marron: "#A52A2A",
    or: "#D4A017",
    blanc: "#FFF7EE",
    rouge: "#FF0000",
    argent: "#C0C0C0"
  };

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    professeur: '',
    formation: '',
    salle: ''
  });

  // Données de l'emploi du temps adaptées au contexte scolaire
  const [scheduleData] = useState({
    filters: [
      { id: 'all', name: 'Tous', color: colors.or, icon: <FaCalendarAlt className="text-xs" /> },
      { id: 'cours', name: 'Cours', color: colors.marron, icon: <FaBook className="text-xs" /> },
      { id: 'td', name: 'TD', color: colors.or, icon: <FaChalkboardTeacher className="text-xs" /> },
      { id: 'tp', name: 'TP', color: colors.argent, icon: <FaUniversity className="text-xs" /> },
      { id: 'examen', name: 'Examens', color: colors.rouge, icon: <span className="text-xs">📝</span> },
      { id: 'reunion', name: 'Réunions', color: colors.marron, icon: <span className="text-xs">👥</span> }
    ],
    days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam','Dim'],
    timeSlots: ['8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h'],
    activities: [
      { 
        id: 1, 
        name: 'Maths', 
        time: '8h', 
        day: 'Lun', 
        type: 'cours', 
        color: colors.marron,
        professeur: 'Dr. Dupont',
        formation: 'Maths',
        salle: 'A1'
      },
      { 
        id: 2, 
        name: 'TP Physique', 
        time: '9h', 
        day: 'Lun', 
        type: 'tp', 
        color: colors.argent,
        professeur: 'Mme. Martin',
        formation: 'Physique',
        salle: 'Labo'
      },
      { 
        id: 3, 
        name: 'Pause', 
        time: '12h', 
        day: 'Lun', 
        type: 'pause', 
        color: colors.blanc,
        professeur: '',
        formation: '',
        salle: 'Café'
      },
      { 
        id: 4, 
        name: 'Examen', 
        time: '14h', 
        day: 'Lun', 
        type: 'examen', 
        color: colors.rouge,
        professeur: 'M. Leroy',
        formation: 'Info',
        salle: 'Amphi B'
      },
      { 
        id: 5, 
        name: 'Réunion', 
        time: '16h', 
        day: 'Lun', 
        type: 'reunion', 
        color: colors.marron,
        professeur: '',
        formation: 'Équipe',
        salle: 'Salle profs'
      },
    ],
    // Options pour les filtres avancés
    filterOptions: {
      professeurs: ['Dr. Dupont', 'Mme. Martin', 'M. Leroy', 'Mme. Bernard'],
      formations: ['Maths', 'Physique', 'Info', 'Éco'],
      salles: ['A1', 'Labo', 'Café', 'Amphi B', 'Salle profs']
    }
  });

  // Gestion de la recherche
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleSearchSubmit = () => {
    console.log('Recherche effectuée:', searchTerm);
    // Ici vous pourriez ajouter la logique de recherche réelle
  };

  const handleResetSearch = () => {
    setSearchTerm('');
  };

  // Gestion des filtres avancés
  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetAllFilters = () => {
    setSelectedFilters({
      professeur: '',
      formation: '',
      salle: ''
    });
    setActiveFilter('all');
    setSearchTerm('');
  };

  // Filtrer les activités selon les critères
  const filteredActivities = scheduleData.activities.filter(activity => {
    // Filtre par type
    if (activeFilter !== 'all' && activity.type !== activeFilter) {
      return false;
    }
    
    // Filtre par recherche textuelle
    if (searchTerm && !activity.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !activity.professeur.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !activity.formation.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !activity.salle.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtres avancés
    if (selectedFilters.professeur && activity.professeur !== selectedFilters.professeur) {
      return false;
    }
    
    if (selectedFilters.formation && activity.formation !== selectedFilters.formation) {
      return false;
    }
    
    if (selectedFilters.salle && activity.salle !== selectedFilters.salle) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FFF7EE] p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            onReset={handleResetSearch}
            placeholder="Rechercher..."
          />
          
          <button
            type="button"
            onClick={() => setFiltersVisible(prev => !prev)}
            aria-pressed={filtersVisible}
            className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4A017] ${
              filtersVisible 
                ? 'bg-[#A52A2A] text-white border-[#A52A2A]' 
                : 'bg-white text-[#A52A2A] border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FaFilter className="h-3 w-3" />
            <span className="text-sm">Filtres</span>
          </button>
        </div>

        {/* Filtres avancés */}
        {filtersVisible && (
          <div className="bg-white p-4 rounded-md shadow-md mb-4 border border-gray-200">
            <h2 className="text-md font-semibold text-[#A52A2A] mb-3">Filtres avancés</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#A52A2A] mb-1 flex items-center gap-1">
                  <FaChalkboardTeacher className="text-[#D4A017]" />
                  Professeur
                </label>
                <select 
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#D4A017] focus:border-[#D4A017]"
                  value={selectedFilters.professeur}
                  onChange={(e) => handleFilterChange('professeur', e.target.value)}
                >
                  <option value="">Tous</option>
                  {scheduleData.filterOptions.professeurs.map(prof => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-[#A52A2A] mb-1 flex items-center gap-1">
                  <FaBook className="text-[#D4A017]" />
                  Formation
                </label>
                <select 
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#D4A017] focus:border-[#D4A017]"
                  value={selectedFilters.formation}
                  onChange={(e) => handleFilterChange('formation', e.target.value)}
                >
                  <option value="">Toutes</option>
                  {scheduleData.filterOptions.formations.map(formation => (
                    <option key={formation} value={formation}>{formation}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-[#A52A2A] mb-1 flex items-center gap-1">
                  <FaUniversity className="text-[#D4A017]" />
                  Salle
                </label>
                <select 
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#D4A017] focus:border-[#D4A017]"
                  value={selectedFilters.salle}
                  onChange={(e) => handleFilterChange('salle', e.target.value)}
                >
                  <option value="">Toutes</option>
                  {scheduleData.filterOptions.salles.map(salle => (
                    <option key={salle} value={salle}>{salle}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetAllFilters}
                className="px-3 py-1 text-sm bg-gray-100 text-[#A52A2A] rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <FaTimes className="text-xs" />
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        {/* Filtres par type d'activité */}
        <div className="flex flex-wrap gap-2 mb-4">
          {scheduleData.filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all text-xs ${
                activeFilter === filter.id 
                  ? 'ring-1 ring-offset-1 ring-[#D4A017] shadow-md' 
                  : 'shadow-sm hover:shadow-md'
              }`}
              style={{
                backgroundColor: activeFilter === filter.id ? filter.color : 'white',
                color: activeFilter === filter.id ? 'white' : filter.color,
                border: `1px solid ${filter.color}`
              }}
            >
              <span>{filter.icon}</span>
              <span className="font-medium">{filter.name}</span>
            </button>
          ))}
        </div>

        {/* Emploi du temps */}
        <div className="bg-white rounded-md shadow-md overflow-hidden border border-gray-200">
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50 text-xs">
            <div className="p-2 font-semibold text-[#A52A2A]"></div>
            {scheduleData.days.map(day => (
              <div key={day} className="p-2 font-semibold text-[#A52A2A] text-center border-l border-gray-200">
                {day}
              </div>
            ))}
          </div>

          {scheduleData.timeSlots.map(timeSlot => (
            <div key={timeSlot} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 text-xs">
              <div className="p-2 font-medium bg-gray-50 text-[#A52A2A] border-r border-gray-200">
                {timeSlot}
              </div>
              
              {scheduleData.days.map(day => {
                const activity = filteredActivities.find(
                  a => a.day === day && a.time === timeSlot
                );
                
                return (
                  <div key={day} className="p-1 border-l border-gray-200 min-h-[60px]">
                    {activity ? (
                      <div 
                        className="p-2 rounded-md text-white h-full flex flex-col justify-between shadow-sm"
                        style={{ backgroundColor: activity.color }}
                      >
                        <div className="font-semibold truncate">{activity.name}</div>
                        <div className="mt-1">
                          {activity.professeur && (
                            <div className="truncate">👨‍🏫 {activity.professeur.split(' ').pop()}</div>
                          )}
                          {activity.salle && (
                            <div className="truncate">🏫 {activity.salle}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-md h-full min-h-[60px] flex items-center justify-center">
                        <span className="text-gray-300 text-xs">-</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-8 text-[#A52A2A] bg-white rounded-md shadow-sm mt-4 border border-gray-200 text-sm">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-medium mb-1">Aucun cours correspondant</h3>
            <p>Aucune activité ne correspond à vos critères.</p>
            <button
              onClick={resetAllFilters}
              className="mt-3 px-3 py-1 bg-[#D4A017] text-white rounded-md hover:bg-[#b88917] transition-colors text-xs"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;