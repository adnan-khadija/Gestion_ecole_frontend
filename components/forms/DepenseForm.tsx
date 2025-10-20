// components/forms/DepenseForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DepenseRequest, DepenseResponse, StatutDepense, CategorieDepense } from '@/lib/types';
import { createDepense, updateDepense } from '@/lib/depense';
import { fetchEnseignants } from '@/lib/enseignant';
import { getUserById } from '@/lib/auth';
import { EnseignantResponse } from '@/lib/types';
import toast from 'react-hot-toast';

interface DepenseFormProps {
  // Nouvelles props (comme DiplomeForm)
  onSave?: (depense: any) => void;
  depenseInitial?: any;
  onCancel?: () => void;
  
  // Anciennes props (pour compatibilité)
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  editMode?: boolean;
  initialData?: DepenseResponse | null;
}

interface EnseignantOption {
  id: string;
  nomComplet: string;
  specialite: string;
}

const getCategoryText = (category: CategorieDepense) => {
  switch (category) {
    case CategorieDepense.SALAIRE_ENSEIGNANT:
      return 'Salaire Enseignant';
    case CategorieDepense.SALAIRE_PERSONNEL:
      return 'Salaire Personnel';
    case CategorieDepense.FACTURE_ELECTRICITE:
      return 'Facture Électricité';
    case CategorieDepense.FACTURE_EAU:
      return 'Facture Eau';
    case CategorieDepense.FACTURE_INTERNET:
      return 'Facture Internet';
    case CategorieDepense.MATERIEL_PEDAGOGIQUE:
      return 'Matériel Pédagogique';
    case CategorieDepense.MATERIEL_INFORMATIQUE:
      return 'Matériel Informatique';
    case CategorieDepense.MATERIEL_BUREAU:
      return 'Matériel Bureau';
    case CategorieDepense.MAINTENANCE:
      return 'Maintenance';
    case CategorieDepense.EVENEMENT:
      return 'Événement';
    case CategorieDepense.FORMATION:
      return 'Formation';
    case CategorieDepense.AUTRE:
      return 'Autre';
    default:
      return category;
  }
};

// Taux de conversion MAD vers XOF (approximatif)
const MAD_TO_XOF_RATE = 164.5;

const DepenseForm: React.FC<DepenseFormProps> = ({
  // Nouvelles props
  onSave,
  depenseInitial,
  onCancel,
  
  // Anciennes props
  open = true,
  onClose,
  onSuccess,
  editMode = false,
  initialData = null
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [enseignants, setEnseignants] = useState<EnseignantOption[]>([]);
  const [formData, setFormData] = useState<{
    categorieDepense: CategorieDepense;
    montantMAD: number; // Stocker en MAD
    dateDepense: string;
    libelle: string;
    description: string;
    enseignantId: string;
    beneficiaire: string;
    numeroPiece: string;
    statutDepense: StatutDepense;
    anneeAcademique: string;
    remarques: string;
  }>({
    categorieDepense: CategorieDepense.AUTRE,
    montantMAD: 0, // Utiliser MAD comme valeur d'entrée
    dateDepense: new Date().toISOString().split('T')[0],
    libelle: '',
    description: '',
    enseignantId: '',
    beneficiaire: '',
    numeroPiece: '',
    statutDepense: StatutDepense.EN_ATTENTE,
    anneeAcademique: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1),
    remarques: ''
  });

  // Déterminer le mode d'opération (nouveau vs ancien)
  const isNewAPI = onSave !== undefined;
  const actualEditMode = isNewAPI ? !!depenseInitial : editMode;
  const actualInitialData = isNewAPI ? depenseInitial : initialData;

  // Gérer la fermeture
  const handleCancel = () => {
    if (isNewAPI && onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  // Gérer le succès
  const handleSuccess = (response: any) => {
    if (isNewAPI && onSave) {
      onSave(response);
    } else if (onSuccess) {
      onSuccess();
    }
    if (onClose) onClose();
  };

  // Charger la liste des enseignants
  useEffect(() => {
    const loadEnseignants = async () => {
      try {
        setLoading(true);
        const enseignantsData = await fetchEnseignants();
        
        const enseignantsOptions: EnseignantOption[] = await Promise.all(
          enseignantsData.map(async (enseignant: EnseignantResponse) => {
            try {
              const user = await getUserById(enseignant.userId);
              return {
                id: enseignant.enseignantId,
                nomComplet: `${user.prenom} ${user.nom}`,
                specialite: enseignant.specialite
              };
            } catch (error) {
              console.error(`Erreur chargement user ${enseignant.userId}:`, error);
              return {
                id: enseignant.enseignantId,
                nomComplet: `Enseignant ${enseignant.enseignantId.substring(0, 8)}`,
                specialite: enseignant.specialite
              };
            }
          })
        );
        
        setEnseignants(enseignantsOptions);
      } catch (err: any) {
        console.error('Erreur chargement enseignants:', err);
        toast.error('Erreur lors du chargement de la liste des enseignants');
      } finally {
        setLoading(false);
      }
    };

    loadEnseignants();
  }, []);

  // Initialiser le formulaire avec les données existantes en mode édition
  useEffect(() => {
    if (actualInitialData) {
      console.log("=== INITIALISATION DU FORMULAIRE DÉPENSE ===");
      console.log("Dépense initiale:", actualInitialData);

      let enseignantIdToSet = "";
      if (actualInitialData.enseignantId) {
        enseignantIdToSet = actualInitialData.enseignantId.toString();
      }

      // Convertir le montant XOF en MAD pour l'affichage
      const montantMAD = actualInitialData.montant ? actualInitialData.montant / MAD_TO_XOF_RATE : 0;

      setFormData({
        categorieDepense: actualInitialData.categorieDepense || CategorieDepense.AUTRE,
        montantMAD: montantMAD,
        dateDepense: actualInitialData.dateDepense?.split('T')[0] || new Date().toISOString().split('T')[0],
        libelle: actualInitialData.libelle || '',
        description: actualInitialData.description || '',
        enseignantId: enseignantIdToSet,
        beneficiaire: actualInitialData.beneficiaire || '',
        numeroPiece: actualInitialData.numeroPiece || '',
        statutDepense: actualInitialData.statutDepense || StatutDepense.EN_ATTENTE,
        anneeAcademique: actualInitialData.anneeAcademique || new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1),
        remarques: actualInitialData.remarques || ''
      });
    }
  }, [actualInitialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setError('');

    if (type === 'number') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: parseFloat(value) || 0 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value 
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.libelle.trim()) {
      setError('Le libellé est requis');
      return false;
    }
    if (formData.montantMAD <= 0) {
      setError('Le montant doit être supérieur à 0');
      return false;
    }
    if (!formData.dateDepense) {
      setError('La date est requise');
      return false;
    }
    if (!formData.beneficiaire.trim()) {
      setError('Le bénéficiaire est requis');
      return false;
    }
    if (!formData.enseignantId.trim()) {
      setError("L'enseignant est requis");
      return false;
    }
    if (!formData.anneeAcademique.trim()) {
      setError("L'année académique est requise");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    console.log("=== VALIDATION DES DONNÉES DÉPENSE ===");
    console.log("Données avant envoi (MAD):", formData);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    try {
      // Convertir le montant MAD en XOF pour l'API
      const montantXOF = formData.montantMAD * MAD_TO_XOF_RATE;
      
      const dataForAPI: DepenseRequest = {
        ...formData,
        montant: montantXOF // Envoyer en XOF à l'API
      };

      let response;
      if (actualEditMode && actualInitialData && actualInitialData.idDepense) {
        const depenseId = actualInitialData.idDepense.toString();
        console.log("Mise à jour de la dépense ID:", depenseId);
        response = await updateDepense(depenseId, dataForAPI);
        toast.success("Dépense modifiée avec succès !");
      } else {
        console.log("Création d'une nouvelle dépense");
        response = await createDepense(dataForAPI);
        toast.success("Dépense ajoutée avec succès !");
      }
      handleSuccess(response);
    } catch (err: any) {
      console.error("Erreur détaillée:", err);
      const errorMessage = err.response?.data?.message || err.message || "Erreur lors de l'enregistrement";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEnseignant = enseignants.find(ens => ens.id === formData.enseignantId);

  // Si on utilise l'ancienne API avec Dialog, retourner null si non ouvert
  if (!isNewAPI && !open) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Libellé*</label>
            <input
              type="text"
              name="libelle"
              value={formData.libelle}
              onChange={handleChange}
              required
              placeholder="Ex: Achat matériel informatique, Paiement salaire, etc."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Montant (MAD)*</label>
            <input
              type="number"
              name="montantMAD"
              value={formData.montantMAD}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
            {formData.montantMAD > 0 && (
              <p className="text-xs text-green-600 mt-1">
                Équivalent XOF: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(formData.montantMAD * MAD_TO_XOF_RATE)}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Catégorie*</label>
            <select
              name="categorieDepense"
              value={formData.categorieDepense}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
              {Object.values(CategorieDepense).map((categorie) => (
                <option key={categorie} value={categorie}>
                  {getCategoryText(categorie)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Date de dépense*</label>
            <input
              type="date"
              name="dateDepense"
              value={formData.dateDepense}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Bénéficiaire et référence */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Bénéficiaire et référence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Bénéficiaire*</label>
            <input
              type="text"
              name="beneficiaire"
              value={formData.beneficiaire}
              onChange={handleChange}
              required
              placeholder="Nom du bénéficiaire"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Numéro de pièce</label>
            <input
              type="text"
              name="numeroPiece"
              value={formData.numeroPiece}
              onChange={handleChange}
              placeholder="Numéro de facture ou reçu"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Enseignant */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Enseignant associé
        </h3>
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-4 text-gray-500">
              Chargement des enseignants...
            </div>
          ) : enseignants.length === 0 ? (
            <div className="text-center py-4 text-red-500">
              Aucun enseignant disponible
            </div>
          ) : (
            <>
              <label className="block text-xs font-bold text-black">
                Sélectionnez l'enseignant*
              </label>
              <select
                name="enseignantId"
                value={formData.enseignantId || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
              >
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map((enseignant) => (
                  <option 
                    key={enseignant.id} 
                    value={enseignant.id}
                  >
                    {enseignant.nomComplet} - {enseignant.specialite}
                  </option>
                ))}
              </select>
              
              {selectedEnseignant && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-700">
                    <span className="font-semibold">Enseignant sélectionné:</span> {selectedEnseignant.nomComplet} - {selectedEnseignant.specialite}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Section Informations académiques */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Informations académiques
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Année académique*</label>
            <input
              type="text"
              name="anneeAcademique"
              value={formData.anneeAcademique}
              onChange={handleChange}
              required
              placeholder="Ex: 2024-2025"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Statut</label>
            <select
              name="statutDepense"
              value={formData.statutDepense}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
              <option value={StatutDepense.EN_ATTENTE}>En attente</option>
              <option value={StatutDepense.APPROUVEE}>Approuvée</option>
              <option value={StatutDepense.REJETEE}>Rejetée</option>
              <option value={StatutDepense.PAYEE}>Payée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section Description et remarques */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Description et remarques
        </h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Décrivez en détail la nature de cette dépense..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Remarques</label>
            <textarea
              name="remarques"
              value={formData.remarques}
              onChange={handleChange}
              rows={2}
              placeholder="Informations complémentaires, observations..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Aide pour les champs obligatoires */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-700">
          <strong>Note :</strong> Les champs marqués d'un astérisque (*) sont obligatoires.
        </p>
      </div>

      {/* Boutons de soumission */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={handleCancel}
          disabled={submitting}
          className="px-6 py-3 text-sm bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg hover:bg-[#B38C0F] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'En cours...' : actualEditMode ? 'Modifier' : 'Créer'} la dépense
        </button>
      </div>
    </form>
  );
};

export default DepenseForm;