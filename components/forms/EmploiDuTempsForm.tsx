"use client";

import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaSync } from 'react-icons/fa';
import { EmploiDuTempsRequest, EmploiDuTempsResponse, JourSemaine, TypeSeance, EnseignantResponse, ModuleResponse, UserResponse } from '@/lib/types';
import { fetchModules, fetchModulesByEnseignant } from '@/lib/modules';
import { fetchEnseignants } from "@/lib/enseignant";
import { getUserById } from '@/lib/auth';
import { createEmploiDuTemps, updateEmploiDuTemps } from '@/lib/emploiDuTemps';
import toast from 'react-hot-toast';

interface EmploiDuTempsFormProps {
  onSave: (emploi: EmploiDuTempsResponse) => void;
  onCancel: () => void;
  isEditing?: boolean;
  initialData?: EmploiDuTempsResponse;
}

const JOURS_SEMAINE_OPTIONS = [
  { value: JourSemaine.LUNDI, label: 'Lundi' },
  { value: JourSemaine.MARDI, label: 'Mardi' },
  { value: JourSemaine.MERCREDI, label: 'Mercredi' },
  { value: JourSemaine.JEUDI, label: 'Jeudi' },
  { value: JourSemaine.VENDREDI, label: 'Vendredi' },
  { value: JourSemaine.SAMEDI, label: 'Samedi' },
  { value: JourSemaine.DIMANCHE, label: 'Dimanche' }
];

const TYPE_SEANCE_OPTIONS = [
  { value: TypeSeance.COURS, label: 'Cours' },
  { value: TypeSeance.TD, label: 'TD' },
  { value: TypeSeance.TP, label: 'TP' },
  { value: TypeSeance.ATELIER, label: 'Atelier' },
  { value: TypeSeance.CONFERENCE, label: 'Conférence' }
];

const HEURES_DISPO = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

export const EmploiDuTempsForm: React.FC<EmploiDuTempsFormProps> = ({
  onSave,
  onCancel,
  isEditing = false,
  initialData
}) => {
  // États pour les données du formulaire
  const [formData, setFormData] = useState<EmploiDuTempsRequest>({
    moduleId: '',
    enseignantId: '',
    jour: JourSemaine.LUNDI,
    heureDebut: '08:00',
    heureFin: '09:00',
    salle: '',
    typeSeance: TypeSeance.COURS,
    groupe: '',
    anneeAcademique: '2025-2026',
    remarques: ''
  });

  // États pour les listes
  const [enseignants, setEnseignants] = useState<EnseignantResponse[]>([]);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [modulesEnseignant, setModulesEnseignant] = useState<ModuleResponse[]>([]);
  const [enseignantsWithUsers, setEnseignantsWithUsers] = useState<(EnseignantResponse & { user?: UserResponse })[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingModulesEnseignant, setLoadingModulesEnseignant] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les listes d'enseignants et modules
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
        setError("Erreur lors du chargement des données");
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoadingLists(false);
      }
    };
    fetchData();
  }, []);

  // Charger les modules de l'enseignant sélectionné
  useEffect(() => {
    const fetchModulesEnseignant = async () => {
      if (!formData.enseignantId) {
        setModulesEnseignant([]);
        setFormData(prev => ({ ...prev, moduleId: '' }));
        return;
      }

      try {
        setLoadingModulesEnseignant(true);
        const modules = await fetchModulesByEnseignant(formData.enseignantId);
        setModulesEnseignant(modules);
        
        // Si on est en mode édition et que le module actuel n'est pas dans la liste, on le réinitialise
        if (isEditing && initialData && !modules.some(m => m.idModule === initialData.moduleId)) {
          setFormData(prev => ({ ...prev, moduleId: '' }));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des modules de l'enseignant:", error);
        setModulesEnseignant([]);
        setFormData(prev => ({ ...prev, moduleId: '' }));
      } finally {
        setLoadingModulesEnseignant(false);
      }
    };

    fetchModulesEnseignant();
  }, [formData.enseignantId, isEditing, initialData]);

  // Initialiser le formulaire avec les données existantes en mode édition
  useEffect(() => {
    if (initialData) {
      setFormData({
        moduleId: initialData.moduleId,
        enseignantId: initialData.enseignantId,
        jour: initialData.jour,
        heureDebut: initialData.heureDebut,
        heureFin: initialData.heureFin,
        salle: initialData.salle,
        typeSeance: initialData.typeSeance,
        groupe: initialData.groupe,
        anneeAcademique: initialData.anneeAcademique,
        remarques: initialData.remarques || ''
      });
    }
  }, [initialData]);

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'enseignantId') {
      // Réinitialiser le module quand l'enseignant change
      setFormData(prev => ({
        ...prev,
        enseignantId: value,
        moduleId: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    if (!formData.moduleId) {
      setError("Veuillez sélectionner un module");
      return false;
    }
    if (!formData.enseignantId) {
      setError("Veuillez sélectionner un enseignant");
      return false;
    }
    if (!formData.salle) {
      setError("Veuillez saisir une salle");
      return false;
    }
    if (!formData.groupe) {
      setError("Veuillez saisir un groupe");
      return false;
    }
    if (formData.heureDebut >= formData.heureFin) {
      setError("L'heure de fin doit être après l'heure de début");
      return false;
    }
    
    // Validation de l'année académique (format: 2024-2025)
    const anneeRegex = /^\d{4}-\d{4}$/;
    if (!anneeRegex.test(formData.anneeAcademique)) {
      setError("Le format de l'année académique est invalide (ex: 2024-2025)");
      return false;
    }

    setError(null);
    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let result: EmploiDuTempsResponse;
      
      if (isEditing && initialData) {
        result = await updateEmploiDuTemps(initialData.idEmploi, formData);
        toast.success("Emploi du temps modifié avec succès !");
      } else {
        result = await createEmploiDuTemps(formData);
        toast.success("Emploi du temps créé avec succès !");
      }

      onSave(result);
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      const errorMessage = err.message || "Une erreur est survenue lors de l'enregistrement";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les heures de fin disponibles
  const getHeuresFinDispo = () => {
    const startIndex = HEURES_DISPO.indexOf(formData.heureDebut);
    return startIndex === -1 ? HEURES_DISPO : HEURES_DISPO.slice(startIndex + 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden transition-opacity duration-300">
      {/* Overlay transparent au lieu de bg-black bg-opacity-50 */}
      <div
        className="absolute inset-0 bg-transparent transition-opacity duration-300"
        onClick={onCancel}
      ></div>
      
      {/* Panneau latéral */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-2xl transform transition-transform duration-300 ease-in-out">
          <div className="h-full flex flex-col bg-white shadow-xl">
            {/* En-tête */}
            <div className=" text-[#A52A2A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">
                    {isEditing ? 'Modifier' : 'Créer'} un emploi du temps
                  </h2>
                  
                </div>
                <button
                  onClick={onCancel}
                  className="rounded-md p-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Fermer"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Formulaire */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Section Informations principales */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                    Informations principales
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Enseignant */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">
                        Enseignant *
                      </label>
                      <select
                        name="enseignantId"
                        value={formData.enseignantId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                        disabled={loadingLists}
                        required
                      >
                        <option value="">Sélectionner un enseignant</option>
                        {enseignantsWithUsers.map(enseignant => (
                          <option key={enseignant.enseignantId} value={enseignant.enseignantId}>
                            {enseignant.user ? `${enseignant.user.nom} ${enseignant.user.prenom}` : 'Chargement...'} 
                          </option>
                        ))}
                      </select>
                      {loadingLists && (
                        <span className="text-xs text-gray-500 mt-1">Chargement des enseignants...</span>
                      )}
                    </div>

                    {/* Module */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">
                        Module *
                      </label>
                      <select
                        name="moduleId"
                        value={formData.moduleId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                        disabled={!formData.enseignantId || loadingModulesEnseignant}
                        required
                      >
                        <option value="">
                          {!formData.enseignantId 
                            ? 'Sélectionnez d\'abord un enseignant' 
                            : loadingModulesEnseignant 
                              ? 'Chargement des modules...' 
                              : 'Sélectionner un module'
                          }
                        </option>
                        {modulesEnseignant.map(module => (
                          <option key={module.idModule} value={module.idModule}>
                            {module.nom}
                          </option>
                        ))}
                      </select>
                      {formData.enseignantId && modulesEnseignant.length === 0 && !loadingModulesEnseignant && (
                        <span className="text-xs text-gray-500 mt-1">Aucun module disponible pour cet enseignant</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Planning */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                    Planning
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Jour */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">
                        Jour *
                      </label>
                      <select
                        name="jour"
                        value={formData.jour}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                        required
                      >
                        {JOURS_SEMAINE_OPTIONS.map(jour => (
                          <option key={jour.value} value={jour.value}>
                            {jour.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Heure de début */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">
                        Heure de début *
                      </label>
                      <select
                        name="heureDebut"
                        value={formData.heureDebut}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                        required
                      >
                        {HEURES_DISPO.map(heure => (
                          <option key={heure} value={heure}>
                            {heure}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Heure de fin */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">
                        Heure de fin *
                      </label>
                      <select
                        name="heureFin"
                        value={formData.heureFin}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                        required
                      >
                        {getHeuresFinDispo().map(heure => (
                          <option key={heure} value={heure}>
                            {heure}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section Détails de la séance */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                    Détails de la séance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type de séance */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">
                        Type de séance *
                      </label>
                      <select
                        name="typeSeance"
                        value={formData.typeSeance}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                        required
                      >
                        {TYPE_SEANCE_OPTIONS.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Salle */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">
                        Salle *
                      </label>
                      <input
                        type="text"
                        name="salle"
                        value={formData.salle}
                        onChange={handleChange}
                        placeholder="Ex: A101, Labo Informatique"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    {/* Groupe */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">
                        Groupe *
                      </label>
                      <input
                        type="text"
                        name="groupe"
                        value={formData.groupe}
                        onChange={handleChange}
                        placeholder="Ex: Groupe A, Licence 1"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    {/* Année académique */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">
                        Année académique *
                      </label>
                      <input
                        type="text"
                        name="anneeAcademique"
                        value={formData.anneeAcademique}
                        onChange={handleChange}
                        placeholder="Ex: 2025-2026"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                        required
                        pattern="\d{4}-\d{4}"
                        title="Format: 2024-2025"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Remarques */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                    Informations supplémentaires
                  </h3>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-black">
                      Remarques
                    </label>
                    <textarea
                      name="remarques"
                      value={formData.remarques}
                      onChange={handleChange}
                      placeholder="Notes supplémentaires..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-6 py-3 text-sm bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaTimes />
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg hover:bg-[#B38C0F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? <FaSync className="animate-spin" /> : <FaSave />}
                    {loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};