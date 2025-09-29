"use client";

import React, { useState, useEffect } from 'react';
import { Formation, ModeFormation, Enseignant, FormationNom, NiveauAcces, FormationRequest, FormationResponse } from '@/lib/types';
import { fetchEnseignants } from '@/lib/enseignant';
import { addFormation, updateFormation } from '@/lib/formation';
import toast from 'react-hot-toast';

interface FormationFormProps {
  onSave: (formation: Formation) => void;
  formationInitial?: Formation;
  onCancel?: () => void;
}

const FormationForm = ({ onSave, formationInitial, onCancel }: FormationFormProps) => {
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [formation, setFormation] = useState<FormationRequest>({
    nom: FormationNom.ANIMATEUR_HSE,
    description: '',
    duree: 0,
    cout: 0,
    enseignantsIds: [],
    anneeFormation: new Date().getFullYear().toString(),
    estActive: true,
    modeFormation: ModeFormation.PRESENTIEL,
    niveauAcces: NiveauAcces.BAC,
    capaciteMax: 0,
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showCustomFormation, setShowCustomFormation] = useState<boolean>(false);
  const [customFormation, setCustomFormation] = useState<string>('');
  const [showCustomNiveau, setShowCustomNiveau] = useState<boolean>(false);
  const [customNiveau, setCustomNiveau] = useState<string>('');

  // Chargement des enseignants
  useEffect(() => {
    const loadEnseignants = async () => {
      try {
        setLoading(true);
        const response = await fetchEnseignants();
        console.log("fetchEnseignants response:", response);
        setEnseignants(response || []);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des enseignants");
      } finally {
        setLoading(false);
      }
    };
    loadEnseignants();
  }, []);

  // Initialisation si formationInitial existe
  useEffect(() => {
    if (formationInitial) {
      const initialData: FormationRequest = {
        nom: formationInitial.nom || FormationNom.ANIMATEUR_HSE,
        description: formationInitial.description || '',
        duree: formationInitial.duree || 0,
        cout: formationInitial.cout || 0,
        enseignantsIds: formationInitial.professeurs ? formationInitial.professeurs.map(p => p.id) : [],
        anneeFormation: formationInitial.anneeFormation || new Date().getFullYear().toString(),
        estActive: formationInitial.estActive !== undefined ? formationInitial.estActive : true,
        modeFormation: formationInitial.modeFormation || ModeFormation.PRESENTIEL,
        niveauAcces: formationInitial.niveauAcces || NiveauAcces.BAC,
        capaciteMax: formationInitial.capaciteMax || 0,
      };
      
      setFormation(initialData);
      
      // Vérifier si le nom de formation initial est dans l'enum
      const formationNames = Object.values(FormationNom);
      if (formationInitial.nom && !formationNames.includes(formationInitial.nom as FormationNom)) {
        setShowCustomFormation(true);
        setCustomFormation(formationInitial.nom);
      }
      
      // Vérifier si le niveau d'accès initial est dans l'enum
      const niveauNames = Object.values(NiveauAcces);
      if (formationInitial.niveauAcces && !niveauNames.includes(formationInitial.niveauAcces as NiveauAcces)) {
        setShowCustomNiveau(true);
        setCustomNiveau(formationInitial.niveauAcces);
      }
    }
  }, [formationInitial]);

  // Gestion des changements pour les champs standards
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormation(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
               type === 'number' ? (value === '' ? 0 : parseFloat(value)) :
               value
    }));
  };

  // Gestion du changement de sélection de formation
const handleFormationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value;

  if (value === FormationNom.AUTRE) {
    setShowCustomFormation(true);
    // Ne pas mettre customFormation encore
    setFormation(prev => ({ ...prev, nom: '' }));
  } else {
    setShowCustomFormation(false);
    setFormation(prev => ({ ...prev, nom: value }));
  }
};


  // Gestion du changement de formation personnalisée
const handleCustomFormationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setCustomFormation(value);
  setFormation(prev => ({ ...prev, nom: value }));
};


  // Gestion du changement de sélection de niveau d'accès
  const handleNiveauChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === NiveauAcces.AUTRE) {
      setShowCustomNiveau(true);
      setFormation(prev => ({ ...prev, niveauAcces: customNiveau || '' }));
    } else {
      setShowCustomNiveau(false);
      setFormation(prev => ({ ...prev, niveauAcces: value }));
    }
  };

  // Gestion du changement de niveau d'accès personnalisé
  const handleCustomNiveauChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomNiveau(value);
    setFormation(prev => ({ ...prev, niveauAcces: value }));
  };

  // Gestion spécifique pour les enseignants
  const handleEnseignantChange = (enseignantId: string) => {
    setFormation(prev => {
      const isSelected = prev.enseignantsIds.includes(enseignantId);
      let newEnseignantsIds;
      
      if (isSelected) {
        newEnseignantsIds = prev.enseignantsIds.filter(id => id !== enseignantId);
      } else {
        if (prev.enseignantsIds.length >= 2) {
          setError("Maximum 2 enseignants autorisés");
          return prev;
        }
        newEnseignantsIds = [...prev.enseignantsIds, enseignantId];
        setError('');
      }
      
      return {
        ...prev,
        enseignantsIds: newEnseignantsIds
      };
    });
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    if (!formation.nom.trim()) {
      setError("Le nom de la formation est requis");
      return false;
    }

    if (formation.duree <= 0) {
      setError("La durée doit être supérieure à 0");
      return false;
    }

    if (formation.cout < 0) {
      setError("Le coût ne peut pas être négatif");
      return false;
    }

    if (formation.enseignantsIds.length > 2) {
      setError("Maximum 2 enseignants autorisés");
      return false;
    }

    setError('');
    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      let response: FormationResponse;

      if (formationInitial && formationInitial.idFormation) {
        // Modification
        response = await updateFormation(formationInitial.idFormation, formation);
        toast.success("Formation modifiée avec succès !");
      } else {
        // Création
        response = await addFormation(formation);
        toast.success("Formation ajoutée avec succès !");
      }

      // Convertir la réponse en Formation pour onSave
      const formationComplete: Formation = {
        idFormation: response.idFormation,
        nomFormation: response.nom,
        duree: response.duree,
        cout: response.cout,
        description: response.description,
        anneeFormation: response.anneeFormation,
        estActive: response.estActive,
        modeFormation: response.modeFormation,
        niveauAcces: response.niveauAcces,
        capaciteMax: response.capaciteMax,
        professeurs: enseignants.filter(e => response.enseignantsIds.includes(e.enseignantId))
      };

      onSave(formationComplete);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Section Informations de base */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Informations de base
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Nom de la formation*</label>
            <select
              name="nom"
              value={showCustomFormation ? FormationNom.AUTRE : formation.nom}
              onChange={handleFormationChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
              {Object.values(FormationNom).map((nom) => (
                <option key={nom} value={nom}>{nom}</option>
              ))}
            </select>
            
            {showCustomFormation && (
              <div className="mt-2">
                <label className="block text-xs font-bold text-black">Précisez le nom de la formation*</label>
                <input
                  type="text"
                  value={customFormation}
                  onChange={handleCustomFormationChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all mt-1"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Description</label>
            <textarea
              name="description"
              value={formation.description}
              onChange={handleChange}
              rows={1}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Durée (mois)*</label>
            <input
              type="number"
              name="duree"
              value={formation.duree}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Coût (FCFA)*</label>
            <input
              type="number"
              name="cout"
              value={formation.cout}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Configuration */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Mode de formation*</label>
            <select
              name="modeFormation"
              value={formation.modeFormation}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
              {Object.values(ModeFormation).map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Niveau d'accès requis</label>
            <select
              name="niveauAcces"
              value={showCustomNiveau ? NiveauAcces.AUTRE : formation.niveauAcces}
              onChange={handleNiveauChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
              {Object.values(NiveauAcces).map((niveau) => (
                <option key={niveau} value={niveau}>{niveau}</option>
              ))}
            </select>
            
            {showCustomNiveau && (
              <div className="mt-2">
                <label className="block text-xs font-bold text-black">Précisez le niveau requis</label>
                <input
                  type="text"
                  value={customNiveau}
                  onChange={handleCustomNiveauChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all mt-1"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Capacité maximale</label>
            <input
              type="number"
              name="capaciteMax"
              value={formation.capaciteMax}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Année de formation</label>
            <input
              type="number"
              name="anneeFormation"
              value={formation.anneeFormation}
              onChange={handleChange}
              min="2000"
              max="2100"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Enseignants */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Enseignants assignés
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
                Sélectionnez les enseignants (max 2)
              </label>
              
              <div className="max-h-60 overflow-y-auto pr-2 py-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {enseignants.map((enseignant) => {
                    const checked = formation.enseignantsIds.includes(enseignant.enseignantId);
                    return (
                      <label
                        key={enseignant.enseignantId}
                        className={`flex items-center gap-2 p-2 rounded-lg border ${
                          checked 
                            ? 'border-[#D4A017] bg-[#FFF8E6]' 
                            : 'border-gray-200 bg-white'
                        } cursor-pointer transition-colors min-h-12`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleEnseignantChange(enseignant.enseignantId)}
                          className="h-4 w-4 text-[#D4A017] border-gray-300 rounded focus:ring-[#D4A017]"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-black truncate">
                            {enseignant.user?.prenom} {enseignant.user?.nom}
                          </p>
                          <p className="text-xs text-gray-600 truncate">{enseignant.specialite}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              {error && (
                <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                {formation.enseignantsIds.length} / 2 enseignants sélectionnés
              </p>
            </>
          )}
        </div>
      </div>

      {/* Section Statut */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Statut
        </h3>
        <div className="flex items-center space-x-6">
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                name="estActive"
                checked={formation.estActive}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A017]"></div>
            </div>
            <span className="text-sm font-medium text-black">Formation active</span>
          </label>
        </div>
      </div>

      {/* Message d'erreur général */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Boutons de soumission */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-3 text-sm bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg hover:bg-[#B8860B] transition-all disabled:opacity-50"
        >
          {submitting ? 'En cours...' : formationInitial ? 'Modifier' : 'Créer'} la formation
        </button>
      </div>
    </form>
  );
};

export default FormationForm;