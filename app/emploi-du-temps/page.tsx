"use client";

import { useState } from 'react';
import { FaSearch, FaTimes, FaFilter, FaChalkboardTeacher, FaBook, FaUniversity, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Date du jour par défaut
  const [dateFilterEnabled, setDateFilterEnabled] = useState(true); // Activé par défaut
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    professeur: '',
    formation: '',
    salle: ''
  });

  // États pour l'ajout d'activités
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{day: string, time: string} | null>(null);
  const [newActivity, setNewActivity] = useState({
    name: '',
    professeur: '',
    formation: '',
    salle: '',
    type: 'cours'
  });

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setDateFilterEnabled(true);
    } else {
      setDateFilterEnabled(false);
    }
  };

  const resetDateFilter = () => {
    setSelectedDate(null);
    setDateFilterEnabled(false);
  };

  // Fonction pour réinitialiser avec la date d'aujourd'hui
  const resetToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setDateFilterEnabled(true);
  };

  // Fonction pour obtenir les dates de la semaine
  const getWeekDates = (date: Date) => {
    const dates = [];
    const currentDate = new Date(date);
    
    // Trouver le lundi de la semaine
    const dayOfWeek = currentDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentDate.setDate(currentDate.getDate() + diffToMonday);
    
    // Générer les 7 jours de la semaine
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(currentDate);
      weekDate.setDate(currentDate.getDate() + i);
      dates.push(weekDate);
    }
    
    return dates;
  };

  // Données de l'emploi du temps adaptées au contexte scolaire
  const [scheduleData, setScheduleData] = useState({
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
        salle: 'A1',
        date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)) // Lundi de cette semaine
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
        salle: 'Labo',
        date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)) // Lundi de cette semaine
      },
      { 
        id: 3, 
        name: 'Pause', 
        time: '12h', 
        day: 'Mar', 
        type: 'pause', 
        color: colors.blanc,
        professeur: '',
        formation: '',
        salle: 'Café',
        date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 2)) // Mardi de cette semaine
      },
      { 
        id: 4, 
        name: 'Examen', 
        time: '14h', 
        day: 'Mer', 
        type: 'examen', 
        color: colors.rouge,
        professeur: 'M. Leroy',
        formation: 'Info',
        salle: 'Amphi B',
        date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 3)) // Mercredi de cette semaine
      },
      { 
        id: 5, 
        name: 'Réunion', 
        time: '16h', 
        day: 'Jeu', 
        type: 'reunion', 
        color: colors.marron,
        professeur: '',
        formation: 'Équipe',
        salle: 'Salle profs',
        date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 4)) // Jeudi de cette semaine
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
    resetDateFilter();
  };

  // Gestion de l'ajout d'activités
  const handleCellClick = (day: string, time: string) => {
    const activity = filteredActivities.find(a => a.day === day && a.time === time);
    if (!activity) {
      setSelectedCell({ day, time });
      setShowAddForm(true);
    }
  };

  const handleAddActivity = () => {
    if (!selectedCell || !newActivity.name) return;

    const newActivityData = {
      id: Math.max(...scheduleData.activities.map(a => a.id)) + 1,
      name: newActivity.name,
      time: selectedCell.time,
      day: selectedCell.day,
      type: newActivity.type,
      color: colors[newActivity.type as keyof typeof colors] || colors.marron,
      professeur: newActivity.professeur,
      formation: newActivity.formation,
      salle: newActivity.salle,
      date: weekDates[scheduleData.days.indexOf(selectedCell.day)]
    };

    setScheduleData(prev => ({
      ...prev,
      activities: [...prev.activities, newActivityData]
    }));

    setNewActivity({
      name: '',
      professeur: '',
      formation: '',
      salle: '',
      type: 'cours'
    });
    setShowAddForm(false);
    setSelectedCell(null);
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

    // Filtre par semaine en cours
    if (selectedDate) {
      const activityDate = activity.date;
      if (activityDate) {
        const weekDates = getWeekDates(selectedDate);
        const activityInWeek = weekDates.some(weekDate => {
          return activityDate.getDate() === weekDate.getDate() &&
                 activityDate.getMonth() === weekDate.getMonth() &&
                 activityDate.getFullYear() === weekDate.getFullYear();
        });
        
        if (!activityInWeek) {
          return false;
        }
      }
    }
    
    return true;
  });

  // Obtenir les dates de la semaine courante
  const weekDates = selectedDate ? getWeekDates(selectedDate) : getWeekDates(new Date());

  return (
    <div className="min-h-screen bg-[#FFF7EE] p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Barre de recherche, filtre de date et bouton de filtre sur la même ligne */}
        <div className="flex flex-col md:flex-row gap-3 mb-4 justify-end">
          {/* Barre de recherche - Largeur contrôlée */}
          <div className="w-full md:w-100">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              onReset={handleResetSearch}
              placeholder="Rechercher..."
            />
          </div>

          {/* Filtre de date - Même largeur que la barre de recherche */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-[#D4A017]" />
              </div>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="Sélectionner une date"
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md 
                          focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017]
                          transition-colors duration-200"
                isClearable
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
              />
            </div>
            {dateFilterEnabled && (
              <button
                onClick={resetDateFilter}
                className="p-2 text-sm bg-gray-100 text-[#A52A2A] rounded-md 
                          hover:bg-gray-200 transition-colors duration-200 flex items-center
                          focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                aria-label="Réinitialiser la date"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          {/* Bouton Filtres - Largeur fixe */}
          <div className="w-full md:w-auto">
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
        </div>

        {/* Filtres avancés */}
        {filtersVisible && (
          <div className="p-4 ">
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

        {/* Emploi du temps */}
        <div className="bg-white rounded-md shadow-md overflow-hidden border border-gray-200">
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
            <div className="p-2 font-semibold text-[#A52A2A]"></div>
            {scheduleData.days.map((day, index) => {
              // Utiliser les dates de la semaine calculées
              const dayDate = weekDates[index];
              
              // Formater la date
              const dayNumber = dayDate.getDate();
              const month = dayDate.toLocaleString('fr-FR', { month: 'short' });
              
              return (
                <div key={day} className="p-2 font-semibold text-[#A52A2A] text-center border-l border-gray-200">
                  <div className="text-sm font-bold uppercase tracking-wide">{day}</div>
                  <div className="flex flex-col items-center justify-center mt-1">
                    <span className="text-lg font-bold text-[#A52A2A]">{dayNumber}</span>
                    <span className="text-xs text-gray-500 lowercase">{month}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {scheduleData.timeSlots.map(timeSlot => (
            <div key={timeSlot} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 text-xs">
              <div className="p-2 font-medium bg-gray-50 text-[#A52A2A] border-r border-gray-200">
                {timeSlot}
              </div>
              
              {scheduleData.days.map((day, dayIndex) => {
                // Utiliser les dates de la semaine calculées
                const dayDate = weekDates[dayIndex];
                
                const activity = filteredActivities.find(a => {
                  // Comparer le jour, l'heure et la date
                  const activityDate = a.date;
                  return a.day === day && 
                         a.time === timeSlot && 
                         activityDate && 
                         activityDate.getDate() === dayDate.getDate() &&
                         activityDate.getMonth() === dayDate.getMonth() &&
                         activityDate.getFullYear() === dayDate.getFullYear();
                });
                
                return (
                  <div 
                    key={day} 
                    className="p-1 border-l border-gray-200 min-h-[60px] relative group"
                    onClick={() => handleCellClick(day, timeSlot)}
                  >
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
                      <div className="bg-gray-50 rounded-md h-full min-h-[60px] flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                        <FaPlus className="text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Formulaire d'ajout d'activité */}
        {showAddForm && selectedCell && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
              <h2 className="text-xl font-semibold text-[#A52A2A] mb-4">
                Ajouter une activité - {selectedCell.day} {selectedCell.time}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#A52A2A] mb-1">Nom de l'activité</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017]"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                    placeholder="Ex: Cours de mathématiques"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A52A2A] mb-1">Professeur</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017]"
                    value={newActivity.professeur}
                    onChange={(e) => setNewActivity({...newActivity, professeur: e.target.value})}
                    placeholder="Nom du professeur"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A52A2A] mb-1">Formation</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017]"
                    value={newActivity.formation}
                    onChange={(e) => setNewActivity({...newActivity, formation: e.target.value})}
                  >
                    <option value="">Sélectionner une formation</option>
                    {scheduleData.filterOptions.formations.map(formation => (
                      <option key={formation} value={formation}>{formation}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A52A2A] mb-1">Salle</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017]"
                    value={newActivity.salle}
                    onChange={(e) => setNewActivity({...newActivity, salle: e.target.value})}
                  >
                    <option value="">Sélectionner une salle</option>
                    {scheduleData.filterOptions.salles.map(salle => (
                      <option key={salle} value={salle}>{salle}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A52A2A] mb-1">Type d'activité</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017]"
                    value={newActivity.type}
                    onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                  >
                    <option value="cours">Cours</option>
                    <option value="tp">TP</option>
                    <option value="examen">Examen</option>
                    <option value="reunion">Réunion</option>
                    <option value="pause">Pause</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddActivity}
                  className="px-4 py-2 bg-[#D4A017] text-white rounded-md hover:bg-[#b88917] transition-colors"
                  disabled={!newActivity.name}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Schedule;