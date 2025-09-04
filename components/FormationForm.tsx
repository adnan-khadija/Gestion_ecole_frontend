"use client";

import React, { useState, useEffect } from 'react';
import { Formation, ModeFormation, Professeur } from '@/lib/types';
import { addFormation, getProfesseurs, updateFormation } from '@/lib/services';
import toast from 'react-hot-toast';

interface FormationFormProps {
  onSave: (formation: Formation) => void;
  formationInitial?: Formation;
  onCancel?: () => void;
}

const FormationForm = ({ onSave, formationInitial, onCancel }: FormationFormProps) => {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [formation, setFormation] = useState<Omit<Formation, 'id'>>({
    nom: '',
    description: '',
    duree: 0,
    cout: 0,
    professeurs: [],
    emploiDuTempsId: null,
    anneeFormation: new Date().getFullYear(),
    estActive: true,
    modeFormation: ModeFormation.Presentiel,
    niveauAcces: '',
    capaciteMax: 0,
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfesseurs = async () => {
      try {
        setLoading(true);
        const response = await getProfesseurs();
        console.log("API response:", response.data);
        setProfesseurs(response.data);
      } catch (error) {
        console.error("Erreur chargement professeurs:", error);
        toast.error("Erreur lors du chargement des professeurs");
      } finally {
        setLoading(false);
      }
    };

    fetchProfesseurs();
  }, []);

  useEffect(() => {
    if (formationInitial) {
      setFormation({
        nom: formationInitial.nom || '',
        description: formationInitial.description || '',
        duree: formationInitial.duree || 0,
        cout: formationInitial.cout || 0,
        professeurs: formationInitial.professeurs ? formationInitial.professeurs.map(p => p.id) : [],
        emploiDuTempsId: formationInitial.emploiDuTempsId || null,
        anneeFormation: formationInitial.anneeFormation || new Date().getFullYear(),
        estActive: formationInitial.estActive !== undefined ? formationInitial.estActive : true,
        modeFormation: formationInitial.modeFormation || ModeFormation.Presentiel,
        niveauAcces: formationInitial.niveauAcces || '',
        capaciteMax: formationInitial.capaciteMax || 0,
      });
    }
  }, [formationInitial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "professeurs") {
      const selectedIds = Array.from((e.target as HTMLSelectElement).selectedOptions).map(opt => parseInt(opt.value));

      if (selectedIds.length > 2) {
        setError("Maximum 2 professeurs autorisés");
        return;
      } else {
        setError("");
      }

      setFormation(prev => ({
        ...prev,
        professeurs: selectedIds
      }));
    } else {
      setFormation(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked :
                 type === 'number' ? parseFloat(value) || 0 :
                 value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (formation.professeurs.length > 2) {
      setError("Maximum 2 professeurs autorisés");
      setSubmitting(false);
      return;
    }

    const selectedProfesseurs = professeurs.filter(p => formation.professeurs.includes(p.id));

    try {
      if (formationInitial && formationInitial.id) {
        // Mise à jour d'une formation existante
        const formationToUpdate = {
          ...formation,
          professeurs: selectedProfesseurs,
          id: formationInitial.id,
          dateCreation: formationInitial.dateCreation,
          dateModification: new Date().toISOString(),
        };

        const response = await updateFormation(formationInitial.id, formationToUpdate);
        onSave(response.data);
        toast.success("Formation modifiée avec succès !");
      } else {
        // Création d'une nouvelle formation
        const now = new Date().toISOString();
        const newFormation = {
          ...formation,
          professeurs: selectedProfesseurs,
          dateCreation: now,
          dateModification: now,
        };

        const response = await addFormation(newFormation);
        onSave(response.data);
        toast.success("Formation ajoutée avec succès !");
      }
    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement:", error);
      
      if (error.response?.status === 404) {
        toast.error("La formation n'a pas été trouvée. Vérifiez l'URL.");
      } else if (error.response?.status === 500) {
        toast.error("Erreur serveur. Veuillez réessayer plus tard.");
      } else {
        toast.error("Erreur lors de l'enregistrement de la formation");
      }
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
            <input
              type="text"
              name="nom"
              value={formation.nom}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Description</label>
            <textarea
              name="description"
              value={formation.description}
              onChange={handleChange}
              rows={3}
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
            <input
              type="text"
              name="niveauAcces"
              value={formation.niveauAcces}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
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

      {/* Section Professeurs */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Professeurs assignés
        </h3>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-black">
            Sélectionnez les professeurs (max 2)
            {loading && <span className="text-gray-500 ml-2">(Chargement...)</span>}
          </label>
          
          {loading ? (
            <div className="text-center py-4 text-gray-500">
              Chargement des professeurs...
            </div>
          ) : professeurs.length === 0 ? (
            <div className="text-center py-4 text-red-500">
              Aucun professeur disponible
            </div>
          ) : (
            <>
              <select
                name="professeurs"
                multiple
                value={formation.professeurs.map(id => id.toString())}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                size={4}
              >
                {professeurs.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nom} {prof.prenom} - {prof.specialite}
                  </option>
                ))}
              </select>
              {error && (
                <p className="text-xs text-[#FF0000] mt-1 font-medium">{error}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs professeurs
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
            <span className="text-xs font-bold text-black">Formation active</span>
          </label>
        </div>
      </div>

      {/* Boutons de soumission */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-3 text-sm bg-[#C0C0C0] text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:ring-opacity-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'En cours...' : formationInitial ? 'Modifier' : 'Créer'} la formation
        </button>
      </div>
    </form>
  );
};

export default FormationForm;