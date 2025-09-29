import React, { useState, useEffect } from 'react';
import {
  StatutEnseignant,
  Enseignant,
  RoleUtilisateur,
  EnseignantRequest,
  EnseignantResponse,
  Utilisateur,
  HoraireRequest,
  CustomFieldRequest,
  Diplome,
  Module,
} from '@/lib/types';
import { register, updateUser, fetchUserIdByEmail } from '@/lib/auth';
import { addEnseignant, updateEnseignant } from '@/lib/enseignant';
import { fetchDiplomes } from '@/lib/diplome';
import { fetchModules } from '@/lib/modules';
import toast from 'react-hot-toast';

interface EnseignantMultiStepFormProps {
  onSave: (enseignant: Enseignant) => void;
  onCancel?: () => void;
  enseignantToEdit?: Enseignant;
  isEditing?: boolean;
  userToEdit?: Utilisateur;
}

const EnseignantMultiStepForm: React.FC<EnseignantMultiStepFormProps> = ({ 
  onSave, 
  onCancel, 
  isEditing = false, 
  enseignantToEdit, 
  userToEdit 
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>(userToEdit?.id || '');
  const [enseignantId, setEnseignantId] = useState<string>(enseignantToEdit?.enseignantId || '');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // États pour les listes de sélection
  const [diplomes, setDiplomes] = useState<Diplome[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingDiplomes, setLoadingDiplomes] = useState<boolean>(false);
  const [loadingModules, setLoadingModules] = useState<boolean>(false);

  // Données utilisateur (étape 1)
  const [userData, setUserData] = useState({
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    password: 'Enseignant@1234',
    role: RoleUtilisateur.ENSEIGNANT as RoleUtilisateur,
    image: '',
  });

  // Données enseignant (étape 2)
  const [enseignantData, setEnseignantData] = useState({
    specialite: '',
    dateEmbauche: '',
    statusEnseignant: StatutEnseignant.CONTRACTUEL,
    heuresTravail: '',
    horaire: {
      jour: '',
      heureDebut: '',
      heureFin: '',
    },
    moduleIds: [] as string[],
    diplomeIds: [] as string[],
  });

  const [customFields, setCustomFields] = useState<CustomFieldRequest[]>([]);

  // Fonction pour traduire les jours de l'anglais vers le français
  const translateDayToFrench = (day: string): string => {
    const dayMap: { [key: string]: string } = {
      'Monday': 'Lundi',
      'Tuesday': 'Mardi',
      'Wednesday': 'Mercredi',
      'Thursday': 'Jeudi',
      'Friday': 'Vendredi',
      'Saturday': 'Samedi',
      'Sunday': 'Dimanche',
      'monday': 'Lundi',
      'tuesday': 'Mardi',
      'wednesday': 'Mercredi',
      'thursday': 'Jeudi',
      'friday': 'Vendredi',
      'saturday': 'Samedi',
      'sunday': 'Dimanche'
    };
    
    return dayMap[day] || day; // Retourne le jour traduit ou le jour original si non trouvé
  };

  // Fonction inverse pour envoyer au backend
  const translateDayToEnglish = (day: string): string => {
    const dayMap: { [key: string]: string } = {
      'Lundi': 'Monday',
      'Mardi': 'Tuesday',
      'Mercredi': 'Wednesday',
      'Jeudi': 'Thursday',
      'Vendredi': 'Friday',
      'Samedi': 'Saturday',
      'Dimanche': 'Sunday',
      'lundi': 'Monday',
      'mardi': 'Tuesday',
      'mercredi': 'Wednesday',
      'jeudi': 'Thursday',
      'vendredi': 'Friday',
      'samedi': 'Saturday',
      'dimanche': 'Sunday'
    };
    
    return dayMap[day] || day; // Retourne le jour en anglais ou le jour original si non trouvé
  };

  // Fonction pour formater les heures pour le backend
  const formatTimeForBackend = (time: string): string => {
    if (!time) return '';
    // Si l'heure est déjà au format HH:mm, la retourner telle quelle
    if (time.includes(':')) return time;
    // Sinon, formater en HH:mm (ex: "23" -> "23:00")
    return `${time.padStart(2, '0')}:00`;
  };

  // Fonction pour formater l'affichage des heures
  const formatTimeForDisplay = (time: string): string => {
    if (!time) return '';
    // Si l'heure est au format HH:mm:ss, ne prendre que HH:mm
    if (time.includes(':')) {
      const parts = time.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };

  // Fonction pour convertir les heures de travail en format ISO 8601
  const formatHeuresTravailForBackend = (heures: string): string => {
    if (!heures) return 'PT0H'; // Duration de 0 heures
    
    // Supprimer les espaces et convertir en majuscules
    const cleaned = heures.toUpperCase().replace(/\s/g, '');
    
    // Si c'est déjà au format ISO (PT...), le retourner tel quel
    if (cleaned.startsWith('PT')) return cleaned;
    
    // Si c'est un nombre simple, le convertir en PTXH
    if (/^\d+$/.test(cleaned)) {
      return `PT${cleaned}H`;
    }
    
    // Si c'est au format "Xh" ou "X h", le convertir
    if (/^\d+H$/.test(cleaned)) {
      return `PT${cleaned}`;
    }
    
    // Si c'est au format "XhYm", le convertir
    const match = cleaned.match(/^(\d+)H(\d+)M$/);
    if (match) {
      return `PT${match[1]}H${match[2]}M`;
    }
    
    // Retourner la valeur originale si le format n'est pas reconnu
    return heures;
  };

  // Charger les listes de diplômes et modules
  useEffect(() => {
    const loadSelectionData = async () => {
      try {
        setLoadingDiplomes(true);
        setLoadingModules(true);

        // Charger les diplômes
        const diplomesData = await fetchDiplomes();
        setDiplomes(diplomesData);

        // Charger les modules
        const modulesData = await fetchModules();
        setModules(modulesData);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des listes de sélection');
      } finally {
        setLoadingDiplomes(false);
        setLoadingModules(false);
      }
    };

    if (step === 2) {
      loadSelectionData();
    }
  }, [step]);

  // Pré-remplissage en mode édition
  useEffect(() => {
    if (isEditing && userToEdit) {
      setUserData({
        email: userToEdit.email || '',
        nom: userToEdit.nom || '',
        prenom: userToEdit.prenom || '',
        telephone: userToEdit.telephone || '',
        password: 'Enseignant@1234',
        role: userToEdit.role || RoleUtilisateur.ENSEIGNANT,
        image: userToEdit.image || '',
      });
      
      if (enseignantToEdit) {
        setEnseignantData({
          specialite: enseignantToEdit.specialite || '',
          dateEmbauche: enseignantToEdit.dateEmbauche || '',
          statusEnseignant: enseignantToEdit.statut || StatutEnseignant.CONTRACTUEL,
          heuresTravail: enseignantToEdit.heuresTravail || '',
          horaire: {
            jour: translateDayToFrench(enseignantToEdit.horaires?.day || ''),
            heureDebut: formatTimeForDisplay(enseignantToEdit.horaires?.startTime || ''),
            heureFin: formatTimeForDisplay(enseignantToEdit.horaires?.endTime || ''),
          },
          moduleIds: enseignantToEdit.modules?.map(m => m.idModule) || [],
          diplomeIds: enseignantToEdit.diplomes?.map(d => d.idDiplome) || [],
        });
        
        if (enseignantToEdit.customFields) {
          setCustomFields(
            enseignantToEdit.customFields.map(field => ({
              fieldName: field.fieldName,
              fieldValue: field.fieldValue
            }))
          );
        }
        
        setEnseignantId(enseignantToEdit.enseignantId);
        setUserId(userToEdit?.id || '');
      }
    }
  }, [isEditing, enseignantToEdit, userToEdit]);

  // Étape 1: Création/mise à jour utilisateur
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uid = userId;

      if (isEditing) {
        if (!uid && userData.email) {
          const fetchedId = await fetchUserIdByEmail(userData.email);
          if (!fetchedId) throw new Error('ID utilisateur introuvable via email');
          uid = fetchedId;
        }

        if (!uid) throw new Error('ID utilisateur manquant pour la mise à jour');

        await updateUser(uid, userData);
        toast.success('Utilisateur mis à jour avec succès !');
      } else {
        const newUser = await register(userData);
        uid = (newUser as any).userId ?? (newUser as any).id;
        if (!uid) throw new Error('userId non renvoyé par le serveur');
        toast.success('Utilisateur créé avec succès !');
      }

      setUserId(uid);
      setStep(2);

    } catch (error: any) {
      console.error('Erreur user:', error);
      toast.error(error?.message || "Erreur lors de la création/mise à jour de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  // Étape 2: Ajout/mise à jour enseignant
  const handleEnseignantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!userId) {
        throw new Error('ID utilisateur manquant');
      }

      const payload: EnseignantRequest = {
        userId: userId,
        specialite: enseignantData.specialite,
        dateEmbauche: enseignantData.dateEmbauche,
        statusEnseignant: enseignantData.statusEnseignant,
        heuresTravail: formatHeuresTravailForBackend(enseignantData.heuresTravail),
        horaire: {
          jour: translateDayToEnglish(enseignantData.horaire.jour),
          heureDebut: formatTimeForBackend(enseignantData.horaire.heureDebut),
          heureFin: formatTimeForBackend(enseignantData.horaire.heureFin),
        },
        moduleIds: enseignantData.moduleIds,
        diplomeIds: enseignantData.diplomeIds,
        customFields: customFields
          .filter((f) => f.fieldName && f.fieldName.trim() !== '')
          .map((f) => ({ 
            fieldName: f.fieldName.trim(), 
            fieldValue: f.fieldValue || '' 
          })),
      };

      console.log('Payload envoyé:', payload); // Pour debug

      let savedEnseignant: EnseignantResponse;

      if (isEditing && enseignantId) {
        savedEnseignant = await updateEnseignant(enseignantId, payload);
        toast.success("Enseignant mis à jour avec succès !");
      } else {
        savedEnseignant = await addEnseignant(payload);
        toast.success("Enseignant ajouté avec succès !");
      }

      // Réinitialiser le formulaire
      setStep(1);
      setUserData({ 
        email: '', 
        nom: '', 
        prenom: '', 
        telephone: '', 
        password: 'Enseignant@1234', 
        role: RoleUtilisateur.ENSEIGNANT,
        image: '' 
      });
      setImageFile(null);
      setEnseignantData({
        specialite: '',
        dateEmbauche: '',
        statusEnseignant: StatutEnseignant.CONTRACTUEL,
        heuresTravail: '',
        horaire: {
          jour: '',
          heureDebut: '',
          heureFin: '',
        },
        moduleIds: [],
        diplomeIds: [],
      });
      setCustomFields([]);
      setUserId('');
      setEnseignantId('');

      // Fermer le formulaire
      onSave(savedEnseignant as Enseignant);
      
    } catch (error: any) {
      console.error('Erreur enseignant:', error);
      const serverMsg = error?.response?.data?.message ?? error?.message;
      toast.error(serverMsg || "Erreur lors de l'ajout des détails enseignant");
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setUserData(prev => ({ ...prev, image: file.name }));
    }
  };

  const handleEnseignantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'statusEnseignant') {
      setEnseignantData((prev) => ({ ...prev, statusEnseignant: value as StatutEnseignant }));
      return;
    }

    if (name.startsWith('horaire.')) {
      const field = name.split('.')[1];
      setEnseignantData(prev => ({
        ...prev,
        horaire: {
          ...prev.horaire,
          [field]: value
        }
      }));
      return;
    }

    setEnseignantData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestion de la sélection des diplômes
  const handleDiplomeSelection = (diplomeId: string) => {
    setEnseignantData(prev => {
      const isSelected = prev.diplomeIds.includes(diplomeId);
      if (isSelected) {
        return {
          ...prev,
          diplomeIds: prev.diplomeIds.filter(id => id !== diplomeId)
        };
      } else {
        return {
          ...prev,
          diplomeIds: [...prev.diplomeIds, diplomeId]
        };
      }
    });
  };

  // Gestion de la sélection des modules
  const handleModuleSelection = (moduleId: string) => {
    setEnseignantData(prev => {
      const isSelected = prev.moduleIds.includes(moduleId);
      if (isSelected) {
        return {
          ...prev,
          moduleIds: prev.moduleIds.filter(id => id !== moduleId)
        };
      } else {
        return {
          ...prev,
          moduleIds: [...prev.moduleIds, moduleId]
        };
      }
    });
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { fieldName: '', fieldValue: '' }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: 'fieldName' | 'fieldValue', value: string) => {
    const updatedFields = [...customFields];
    updatedFields[index][field] = value;
    setCustomFields(updatedFields);
  };

  // Étape 1: Formulaire utilisateur
  const renderUserForm = () => (
    <form onSubmit={handleUserSubmit} className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-black mb-4">Étape 1: Informations de base</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Nom*</label>
            <input
              type="text"
              name="nom"
              value={userData.nom}
              onChange={handleUserChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Prénom*</label>
            <input
              type="text"
              name="prenom"
              value={userData.prenom}
              onChange={handleUserChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Email*</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleUserChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Téléphone*</label>
            <input
              type="tel"
              name="telephone"
              value={userData.telephone}
              onChange={handleUserChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-bold text-black">Photo de profil</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
            {imageFile && (
              <p className="text-sm text-gray-500 mt-1">Fichier sélectionné: {imageFile.name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#D4A017] text-white rounded-lg hover:bg-[#b38714] disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Suivant'}
        </button>
      </div>
    </form>
  );

  // Étape 2: Formulaire enseignant avec sélection améliorée
  const renderEnseignantForm = () => (
    <form onSubmit={handleEnseignantSubmit} className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-black mb-4">Étape 2: Informations enseignant</h2>
        
        {/* Section Informations professionnelles */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-black mb-4">Informations professionnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">Spécialité*</label>
              <input
                type="text"
                name="specialite"
                value={enseignantData.specialite}
                onChange={handleEnseignantChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                placeholder="Ex: Informatique, Mathématiques..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">Date d'embauche*</label>
              <input
                type="date"
                name="dateEmbauche"
                value={enseignantData.dateEmbauche}
                onChange={handleEnseignantChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">Statut*</label>
              <select
                name="statusEnseignant"
                value={enseignantData.statusEnseignant}
                onChange={handleEnseignantChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              >
                {Object.values(StatutEnseignant).map(statut => (
                  <option key={statut} value={statut}>{statut}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">Heures de travail</label>
              <input
                type="text"
                name="heuresTravail"
                value={enseignantData.heuresTravail}
                onChange={handleEnseignantChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                placeholder="Ex: 35h, PT35H, 8h30m"
              />
              <p className="text-xs text-gray-500">
                Format: 35h (converti automatiquement en PT35H)
              </p>
            </div>
          </div>
        </div>

        {/* Section Horaires */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-black mb-4">Horaire</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">Jour</label>
              <select
                name="horaire.jour"
                value={enseignantData.horaire.jour}
                onChange={handleEnseignantChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="">Sélectionner un jour</option>
                <option value="Lundi">Lundi</option>
                <option value="Mardi">Mardi</option>
                <option value="Mercredi">Mercredi</option>
                <option value="Jeudi">Jeudi</option>
                <option value="Vendredi">Vendredi</option>
                <option value="Samedi">Samedi</option>
                <option value="Dimanche">Dimanche</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">Heure de début</label>
              <input
                type="time"
                name="horaire.heureDebut"
                value={formatTimeForDisplay(enseignantData.horaire.heureDebut)}
                onChange={handleEnseignantChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">Heure de fin</label>
              <input
                type="time"
                name="horaire.heureFin"
                value={formatTimeForDisplay(enseignantData.horaire.heureFin)}
                onChange={handleEnseignantChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section Diplômes et Modules */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-black mb-4">Diplômes et Modules</h3>
          
          {/* Sélection des Diplômes */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-black mb-3">Diplômes assignés</label>
            {loadingDiplomes ? (
              <div className="text-gray-500">Chargement des diplômes...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {diplomes.length === 0 ? (
                  <div className="text-gray-500 col-span-2">Aucun diplôme disponible</div>
                ) : (
                  diplomes.map(diplome => (
                    <div key={diplome.idDiplome} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`diplome-${diplome.idDiplome}`}
                        checked={enseignantData.diplomeIds.includes(diplome.idDiplome)}
                        onChange={() => handleDiplomeSelection(diplome.idDiplome)}
                        className="w-4 h-4 text-[#D4A017] border-gray-300 rounded focus:ring-[#D4A017]"
                      />
                      <label 
                        htmlFor={`diplome-${diplome.idDiplome}`}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {diplome.nomDiplome} ({diplome.typeDiplome})
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              {enseignantData.diplomeIds.length} diplôme(s) sélectionné(s)
            </div>
          </div>

          {/* Sélection des Modules */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-black mb-3">Modules assignés</label>
            {loadingModules ? (
              <div className="text-gray-500">Chargement des modules...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {modules.length === 0 ? (
                  <div className="text-gray-500 col-span-2">Aucun module disponible</div>
                ) : (
                  modules.map(module => (
                    <div key={module.idModule} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`module-${module.idModule}`}
                        checked={enseignantData.moduleIds.includes(module.idModule)}
                        onChange={() => handleModuleSelection(module.idModule)}
                        className="w-4 h-4 text-[#D4A017] border-gray-300 rounded focus:ring-[#D4A017]"
                      />
                      <label 
                        htmlFor={`module-${module.idModule}`}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {module.nomModule}
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              {enseignantData.moduleIds.length} module(s) sélectionné(s)
            </div>
          </div>
        </div>

        {/* Champs personnalisés */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-black mb-4">Champs personnalisés</h3>
          {customFields.map((field, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nom du champ"
                value={field.fieldName}
                onChange={e => updateCustomField(index, 'fieldName', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Valeur"
                value={field.fieldValue}
                onChange={e => updateCustomField(index, 'fieldValue', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeCustomField(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addCustomField}
            className="px-4 py-2 bg-[#D4A017] text-white rounded hover:bg-[#b38714] text-sm"
          >
            + Ajouter un champ
          </button>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#D4A017] text-white rounded-lg hover:bg-[#b38714] disabled:opacity-50"
        >
          {loading ? 'Création...' : isEditing ? 'Mettre à jour' : "Créer l'enseignant"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? "Modifier l'enseignant" : 'Ajouter un nouvel enseignant'}
        </h1>
        <div className="flex items-center mt-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-[#D4A017] text-white' : 'bg-gray-300 text-gray-600'}`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#D4A017]' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-[#D4A017] text-white' : 'bg-gray-300 text-gray-600'}`}>
            2
          </div>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className={step >= 1 ? 'text-[#D4A017] font-medium' : 'text-gray-500'}>Informations de base</span>
          <span className={step >= 2 ? 'text-[#D4A017] font-medium' : 'text-gray-500'}>Détails enseignant</span>
        </div>
      </div>

      {step === 1 ? renderUserForm() : renderEnseignantForm()}
    </div>
  );
};

export default EnseignantMultiStepForm;