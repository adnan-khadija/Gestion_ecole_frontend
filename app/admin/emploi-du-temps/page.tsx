// components/Schedule.tsx
"use client";

import { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaSync, FaPlus, FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { useEmploiDuTemps } from '../../hooks/useEmploiDuTemps';
import { EmploiDuTempsResponse, JourSemaine, TypeSeance, EnseignantResponse, ModuleResponse, UserResponse } from '@/lib/types';
import { fetchModules } from '@/lib/modules';
import { fetchEnseignants } from "@/lib/enseignant";
import { deleteEmploiDuTemps, updateEmploiDuTemps } from '@/lib/emploiDuTemps';
import { getUserById } from '@/lib/auth';
import { EmploiDuTempsForm } from '@/components/forms/EmploiDuTempsForm';

// Mapping des jours de la semaine
const JOURS_SEMAINE: Record<JourSemaine, string> = {
  LUNDI: 'Lun',
  MARDI: 'Mar',
  MERCREDI: 'Mer',
  JEUDI: 'Jeu',
  VENDREDI: 'Ven',
  SAMEDI: 'Sam',
  DIMANCHE: 'Dim'
};

// Mapping des types de séance vers les couleurs
const TYPE_SEANCE_COLORS: Record<TypeSeance, string> = {
  COURS: "#A52A2A",
  TD: "#D4A017",
  TP: "#C0C0C0",
  ATELIER: "#FF0000",
  CONFERENCE: "#8B4513",
};

// Composant Menu d'actions pour chaque cours
interface ActionMenuProps {
  emploi: EmploiDuTempsResponse;
  onEdit: (emploi: EmploiDuTempsResponse) => void;
  onDelete: (id: string) => void;
}

const ActionMenu = ({ emploi, onEdit, onDelete }: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEdit = () => {
    onEdit(emploi);
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le cours "${emploi.moduleName}" ?`)) {
      onDelete(emploi.idEmploi);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
      >
        <FaEllipsisV className="text-white text-xs" />
      </button>
      
      {isOpen && (
        <>
          {/* Overlay pour fermer le menu en cliquant ailleurs */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 top-6 z-20 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[120px]">
            <button
              onClick={handleEdit}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-t-lg"
            >
              <FaEdit className="text-blue-600" />
              Modifier
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
            >
              <FaTrash className="text-red-600" />
              Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Composant principal modifié
const Schedule = () => {
  // États pour le type de recherche
  const [searchType, setSearchType] = useState<'groupe' | 'enseignant' | 'module' | 'all'>('groupe');
  const [groupeSearch, setGroupeSearch] = useState('');
  const [enseignantSearch, setEnseignantSearch] = useState('');
  const [moduleSearch, setModuleSearch] = useState('');
  const [anneeAcademique, setAnneeAcademique] = useState('2025-2026');

  // États pour les listes
  const [enseignants, setEnseignants] = useState<EnseignantResponse[]>([]);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [enseignantsWithUsers, setEnseignantsWithUsers] = useState<(EnseignantResponse & { user?: UserResponse })[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // États pour l'interface
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmploi, setEditingEmploi] = useState<EmploiDuTempsResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Utilisation du hook emploi du temps
  const { emplois, loading, error, refetch } = useEmploiDuTemps({
    type: searchType,
    groupe: groupeSearch,
    anneeAcademique: anneeAcademique,
    enseignantId: enseignantSearch,
    moduleId: moduleSearch
  });

  // Charger les listes d'enseignants et modules avec les données utilisateur
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingLists(true);
        const [profsResponse, modulesResponse] = await Promise.all([
          fetchEnseignants(),
          fetchModules()
        ]);
        
        setEnseignants(profsResponse);
        setModules(modulesResponse);

        // Charger les données utilisateur pour chaque enseignant
        const enseignantsWithUserData = await Promise.all(
          profsResponse.map(async (enseignant) => {
            try {
              const userData = await getUserById(enseignant.userId);
              return {
                ...enseignant,
                user: userData
              };
            } catch (error) {
              console.error(`Erreur lors du chargement de l'utilisateur ${enseignant.userId}:`, error);
              return {
                ...enseignant,
                user: undefined
              };
            }
          })
        );

        setEnseignantsWithUsers(enseignantsWithUserData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoadingLists(false);
      }
    };
    fetchData();
  }, []);

  // Réinitialiser les sélections quand le type de recherche change
  useEffect(() => {
    setEnseignantSearch('');
    setModuleSearch('');
    setGroupeSearch('');
  }, [searchType]);

  // Fonction pour lancer la recherche selon le type
  const handleSearchSubmit = () => {
    refetch();
  };

  // Fonction pour réinitialiser la recherche
  const handleResetSearch = () => {
    setSearchTerm('');
    setGroupeSearch('');
    setEnseignantSearch('');
    setModuleSearch('');
  };

  // Fonction pour gérer l'ajout d'un nouvel emploi du temps
  const handleAddEmploiDuTemps = () => {
    setEditingEmploi(null);
    setShowForm(true);
  };

  // Fonction pour gérer la modification d'un emploi du temps
  const handleEditEmploiDuTemps = (emploi: EmploiDuTempsResponse) => {
    setEditingEmploi(emploi);
    setShowForm(true);
  };

  // Fonction pour gérer la suppression d'un emploi du temps
  const handleDeleteEmploiDuTemps = async (id: string) => {
    try {
      setIsDeleting(id);
      await deleteEmploiDuTemps(id);
      await refetch(); // Recharger les données après suppression
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'emploi du temps');
    } finally {
      setIsDeleting(null);
    }
  };

  // Fonction pour fermer le formulaire
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmploi(null);
  };

  // Fonction appelée après la sauvegarde réussie
  const handleSaveSuccess = (emploi: EmploiDuTempsResponse) => {
    console.log('Emploi du temps sauvegardé:', emploi);
    setShowForm(false);
    setEditingEmploi(null);
    refetch(); // Recharger les données pour afficher les modifications
  };

  // Convertir les emplois du temps en activités pour l'affichage
  const convertEmploisToActivities = (emplois: EmploiDuTempsResponse[]) => {
    return emplois.map(emploi => ({
      id: emploi.idEmploi,
      name: emploi.moduleName,
      time: `${emploi.heureDebut} - ${emploi.heureFin}`,
      day: JOURS_SEMAINE[emploi.jour] || emploi.jour,
      type: emploi.typeSeance.toLowerCase(),
      color: TYPE_SEANCE_COLORS[emploi.typeSeance] || "#A52A2A",
      professeur: emploi.enseignantName,
      formation: emploi.groupe,
      salle: emploi.salle,
      date: new Date(),
      remarques: emploi.remarques,
      originalEmploi: emploi // Garder une référence à l'objet original
    }));
  };

  // Filtrer les activités selon la recherche textuelle
  const filteredActivities = convertEmploisToActivities(emplois).filter(activity => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      activity.name.toLowerCase().includes(term) ||
      activity.professeur.toLowerCase().includes(term) ||
      activity.formation.toLowerCase().includes(term) ||
      activity.salle.toLowerCase().includes(term) ||
      activity.remarques?.toLowerCase().includes(term)
    );
  });

  // Obtenir les créneaux horaires uniques
  const getUniqueTimeSlots = () => {
    const timeSlots = new Set<string>();
    emplois.forEach(emploi => {
      timeSlots.add(`${emploi.heureDebut} - ${emploi.heureFin}`);
    });
    return Array.from(timeSlots).sort();
  };

  // Données pour l'affichage du calendrier
  const scheduleData = {
    days: Object.values(JOURS_SEMAINE),
    timeSlots: getUniqueTimeSlots().length > 0 ? getUniqueTimeSlots() : ['8h-10h', '10h-12h', '14h-16h', '16h-18h'],
    activities: filteredActivities
  };

  return (
    <div className="min-h-screen bg-[#FFF7EE] p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Conteneur principal avec tous les contrôles de recherche */}
        <div className="mb-6 p-4 bg-white rounded-md shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Partie gauche : Type de recherche et critères */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
              <div>
                <label className="block text-sm font-medium text-[#A52A2A] mb-1">Type de recherche</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A017] w-40"
                >
                   <option value="all">Tous les emplois du temps</option>
                  <option value="groupe">Par Groupe</option>
                  <option value="enseignant">Par Enseignant</option>
                  <option value="module">Par Module</option>
                 
                </select>
              </div>

              {searchType === 'groupe' && (
                <div>
                  <label className="block text-sm font-medium text-[#A52A2A] mb-1">Groupe</label>
                  <input
                    type="text"
                    value={groupeSearch}
                    onChange={(e) => setGroupeSearch(e.target.value)}
                    placeholder="Nom du groupe"
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A017] w-48"
                  />
                </div>
              )}

              {searchType === 'enseignant' && (
                <div>
                  <label className="block text-sm font-medium text-[#A52A2A] mb-1">Enseignant</label>
                  <select
                    value={enseignantSearch}
                    onChange={(e) => setEnseignantSearch(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A017] w-64"
                    disabled={loadingLists}
                  >
                    <option value="">Sélectionner un enseignant</option>
                    {enseignantsWithUsers.map(enseignant => (
                      <option key={enseignant.enseignantId} value={enseignant.enseignantId}>
                        {enseignant.user ? `${enseignant.user.nom} ${enseignant.user.prenom}` : 'Chargement...'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {searchType === 'module' && (
                <div>
                  <label className="block text-sm font-medium text-[#A52A2A] mb-1">Module</label>
                  <select
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A017] w-64"
                    disabled={loadingLists}
                  >
                    <option value="">Sélectionner un module</option>
                    {modules.map(module => (
                      <option key={module.idModule} value={module.idModule}>
                        {module.nom} 
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#A52A2A] mb-1">Année académique</label>
                <input
                  type="text"
                  value={anneeAcademique}
                  onChange={(e) => setAnneeAcademique(e.target.value)}
                  placeholder="2025-2026"
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#D4A017] w-32"
                />
              </div>

              <button
                onClick={handleSearchSubmit}
                disabled={loading || loadingLists ||
                  (searchType === 'groupe' && !groupeSearch) ||
                  (searchType === 'enseignant' && !enseignantSearch) ||
                  (searchType === 'module' && !moduleSearch)
                }
                className="mt-6 px-4 py-2 bg-[#D4A017] text-white rounded-md hover:bg-[#b88917] disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <FaSync className="animate-spin" /> : <FaSearch />}
                {loading ? 'Chargement...' : 'Rechercher'}
              </button>
            </div>

            {/* Partie droite : Bouton Ajouter un emploi du temps */}
            <div className="w-full lg:w-auto mt-4 lg:mt-0">
              <button
                onClick={handleAddEmploiDuTemps}
                className="w-full lg:w-auto px-6 py-3 bg-[#A52A2A] text-white rounded-md hover:bg-[#8B1A1A] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <FaPlus className="h-4 w-4" />
                <span>Ajouter un emploi du temps</span>
              </button>
            </div>
          </div>

       

          {/* Affichage des sélections */}
          <div className="mt-3 text-sm text-gray-600">
            {searchType === 'enseignant' && enseignantSearch && (
              <p>
                Enseignant sélectionné: {
                  enseignantsWithUsers.find(e => e.enseignantId === enseignantSearch)?.user 
                    ? `${enseignantsWithUsers.find(e => e.enseignantId === enseignantSearch)?.user?.nom} ${enseignantsWithUsers.find(e => e.enseignantId === enseignantSearch)?.user?.prenom}`
                    : 'Chargement...'
                }
              </p>
            )}
            {searchType === 'module' && moduleSearch && (
              <p>
                Module sélectionné: {
                  modules.find(m => m.idModule === moduleSearch)?.nom
                }
              </p>
            )}
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Indicateur de chargement */}
        {(loading || loadingLists) && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md text-center">
            <FaSync className="animate-spin inline mr-2" />
            {loadingLists ? 'Chargement des listes...' : 'Chargement des emplois du temps...'}
          </div>
        )}

        {/* Emploi du temps */}
        {!loading && !loadingLists && emplois.length > 0 && (
          <div className="bg-white rounded-md shadow-md overflow-hidden border border-gray-200">
            {/* En-tête avec les jours de la semaine */}
            <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
              <div className="p-3 font-semibold text-[#A52A2A] text-center">Heure</div>
              {scheduleData.days.map((day) => (
                <div key={day} className="p-3 font-semibold text-[#A52A2A] text-center border-l border-gray-200">
                  <div className="text-sm font-bold uppercase tracking-wide">{day}</div>
                </div>
              ))}
            </div>

            {/* Corps du calendrier */}
            {scheduleData.timeSlots.map(timeSlot => (
              <div key={timeSlot} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 text-xs">
                <div className="p-3 font-medium bg-gray-50 text-[#A52A2A] border-r border-gray-200 flex items-center justify-center">
                  {timeSlot}
                </div>
                
                {scheduleData.days.map((day) => {
                  const activity = scheduleData.activities.find(a => 
                    a.day === day && a.time === timeSlot
                  );
                  
                  return (
                    <div key={day} className="p-2 border-l border-gray-200 min-h-[100px] relative group">
                      {activity ? (
                        <div 
                          className="p-3 rounded-md text-white h-full flex flex-col justify-between shadow-sm relative"
                          style={{ backgroundColor: activity.color }}
                        >
                          {/* Menu d'actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ActionMenu
                              emploi={activity.originalEmploi}
                              onEdit={handleEditEmploiDuTemps}
                              onDelete={handleDeleteEmploiDuTemps}
                            />
                          </div>

                          {/* Indicateur de suppression */}
                          {isDeleting === activity.id && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                              <FaSync className="animate-spin text-white text-lg" />
                            </div>
                          )}

                          <div className="font-semibold text-sm mb-2 pr-6">{activity.name}</div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs">👨‍🏫</span>
                              <span className="text-xs truncate">{activity.professeur}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs">🏫</span>
                              <span className="text-xs">{activity.salle}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs">👥</span>
                              <span className="text-xs">{activity.formation}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-md h-full min-h-[100px] flex items-center justify-center">
                          <span className="text-gray-300 text-xs">-</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Message si aucun résultat */}
        {!loading && !loadingLists && emplois.length === 0 && !error && (
          <div className="text-center p-8 bg-white rounded-md shadow-md">
            <p className="text-gray-500">Aucun emploi du temps trouvé</p>
            <p className="text-sm text-gray-400 mt-2">
              {searchType === 'groupe' && 'Vérifiez le nom du groupe et l\'année académique'}
              {searchType === 'enseignant' && 'Vérifiez la sélection de l\'enseignant'}
              {searchType === 'module' && 'Vérifiez la sélection du module'}
            </p>
          </div>
        )}

        {/* Formulaire d'ajout/modification d'emploi du temps */}
        {showForm && (
          <EmploiDuTempsForm
            onSave={handleSaveSuccess}
            onCancel={handleCloseForm}
            isEditing={!!editingEmploi}
            initialData={editingEmploi || undefined}
          />
        )}
        
      </div>
    </div>
  );
};

export default Schedule;