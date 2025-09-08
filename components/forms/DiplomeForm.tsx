"use client";

import React, { useState, useEffect } from 'react';
import { Diplome, MentionDiplome, ModeRemiseDiplome, TypeDiplome, Etudiant, Professeur } from '@/lib/types';
import { addDiplome, updateDiplome, getEtudiants, getProfesseurs } from '@/lib/services';
import toast from 'react-hot-toast';

interface DiplomeFormProps {
  onSave: (diplome: Diplome) => void;
  diplomeInitial?: Diplome;
  onCancel?: () => void;
}

const DiplomeForm = ({ onSave, diplomeInitial, onCancel }: DiplomeFormProps) => {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [diplome, setDiplome] = useState<Omit<Diplome, 'id'>>({
    typeDiplome: TypeDiplome.LICENCE,
    nomDiplome: '',
    niveau: '',
    nombreProf: 0,
    anneeObtention: new Date().getFullYear(),
    estValide: false,
    etudiant: null,
    mention: MentionDiplome.PASSABLE,
    dateDelivrance: '',
    signatureAdmin: null,
    qrCode: '',
    fichierDiplome: '',
    commentaire: '',
    modeRemise: ModeRemiseDiplome.PRESENTIEL,
    professeurs: [],
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Chargement des étudiants et professeurs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [etudiantsResponse, professeursResponse] = await Promise.all([
          getEtudiants(),
          getProfesseurs()
        ]);
        setEtudiants(etudiantsResponse.data);
        setProfesseurs(professeursResponse.data);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Initialisation si diplomeInitial existe
  useEffect(() => {
    if (diplomeInitial) {
      setDiplome({
        typeDiplome: diplomeInitial.typeDiplome || TypeDiplome.LICENCE,
        nomDiplome: diplomeInitial.nomDiplome || '',
        niveau: diplomeInitial.niveau || '',
        nombreProf: diplomeInitial.nombreProf || 0,
        anneeObtention: diplomeInitial.anneeObtention || new Date().getFullYear(),
        estValide: diplomeInitial.estValide || false,
        etudiant: diplomeInitial.etudiant || null,
        mention: diplomeInitial.mention || MentionDiplome.PASSABLE,
        dateDelivrance: diplomeInitial.dateDelivrance || '',
        signatureAdmin: diplomeInitial.signatureAdmin || null,
        qrCode: diplomeInitial.qrCode || '',
        fichierDiplome: diplomeInitial.fichierDiplome || '',
        commentaire: diplomeInitial.commentaire || '',
        modeRemise: diplomeInitial.modeRemise || ModeRemiseDiplome.PRESENTIEL,
        professeurs: diplomeInitial.professeurs ? diplomeInitial.professeurs.map(p => p.id) : [],
      });
    }
  }, [diplomeInitial]);

  // Gestion spécifique pour les professeurs
  const handleProfesseurChange = (professeurId: number) => {
    setDiplome(prev => {
      const isSelected = prev.professeurs.includes(professeurId);
      let newProfesseurs;
      
      if (isSelected) {
        newProfesseurs = prev.professeurs.filter(id => id !== professeurId);
        setError(''); // Réinitialiser l'erreur lors de la désélection
      } else {
        if (prev.professeurs.length >= 2) {
          setError("Maximum 2 professeurs autorisés");
          return prev;
        }
        newProfesseurs = [...prev.professeurs, professeurId];
        setError('');
      }
      
      return {
        ...prev,
        professeurs: newProfesseurs
      };
    });
  };

  // Gestion des changements pour les autres champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "etudiant") {
  if (value === "") {
    // Si aucune sélection (valeur vide)
    setDiplome(prev => ({ ...prev, etudiant: null }));
  } else {
    const selectedId = parseInt(value);
    const selectedEtudiant = etudiants.find(e => e.id === selectedId) || null;
    setDiplome(prev => ({ ...prev, etudiant: selectedEtudiant }));
  }
}
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (diplome.professeurs.length > 2) {
      setError("Maximum 2 professeurs autorisés");
      setSubmitting(false);
      return;
    }
  if (!diplome.etudiant) {
    setError("Veuillez sélectionner un étudiant");
    setSubmitting(false);
    return;
  }

 

    try {
      const selectedProfesseurs = professeurs.filter(p => diplome.professeurs.includes(p.id));
      
      if (diplomeInitial && diplomeInitial.id) {
        const diplomeToUpdate = {
          ...diplome,
          professeurs: selectedProfesseurs,
          id: diplomeInitial.id,
        };
        const response = await updateDiplome(diplomeInitial.id, diplomeToUpdate);
        onSave(response.data);
        toast.success("Diplôme modifié avec succès !");
      } else {
        const newDiplome = {
          ...diplome,
          professeurs: selectedProfesseurs,
        };
        const response = await addDiplome(newDiplome);
        onSave(response.data);
        toast.success("Diplôme ajouté avec succès !");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Section Informations de base */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Informations du diplôme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Type de diplôme*</label>
            <select
              name="typeDiplome"
              value={diplome.typeDiplome}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
             {Object.values(TypeDiplome).map(type => (
  <option key={`type-${type}`} value={type}>{type}</option>
))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Nom du diplôme*</label>
            <input
              type="text"
              name="nomDiplome"
              value={diplome.nomDiplome}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Niveau</label>
            <input
              type="text"
              name="niveau"
              value={diplome.niveau}
              onChange={handleChange}
              placeholder="Ex: Bac+3, Bac+5"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Année d'obtention</label>
            <input
              type="number"
              name="anneeObtention"
              value={diplome.anneeObtention}
              onChange={handleChange}
              min="2000"
              max="2100"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Détails du diplôme */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Détails du diplôme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Mention</label>
            <select
              name="mention"
              value={diplome.mention}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
             {Object.values(MentionDiplome).map(mention => (
  <option key={`mention-${mention}`} value={mention}>{mention}</option>
))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Date de délivrance</label>
            <input
              type="date"
              name="dateDelivrance"
              value={diplome.dateDelivrance}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Mode de remise</label>
            <select
              name="modeRemise"
              value={diplome.modeRemise}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
            {Object.values(ModeRemiseDiplome).map(mode => (
  <option key={`mode-${mode}`} value={mode}>{mode}</option>
))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Nombre de professeurs</label>
            <input
              type="number"
              name="nombreProf"
              value={diplome.nombreProf}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

     {/* Section Étudiant */}
<div className="bg-white rounded-xl p-4 border border-gray-200">
  <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
    Étudiant diplômé
  </h3>
  <div className="space-y-2">
    {loading ? (
      <div className="text-center py-4 text-gray-500">
        Chargement des étudiants...
      </div>
    ) : etudiants.length === 0 ? (
      <div className="text-center py-4 text-red-500">
        Aucun étudiant disponible
      </div>
    ) : (
      <>
        <label className="block text-xs font-bold text-black">
          Sélectionnez l'étudiant
        </label>
        <select
          name="etudiant"
          value={diplome.etudiant?.id || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
        >
          <option value="">Sélectionner un étudiant</option>
          {etudiants.map((etudiant) => (
            <option key={etudiant.id} value={etudiant.id}>
              {etudiant.nom} {etudiant.prenom}
            </option>
          ))}
        </select>
        
        {/* Affichage de l'étudiant sélectionné */}
        {diplome.etudiant && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs text-green-700">
              <span className="font-semibold">Étudiant sélectionné:</span> {diplome.etudiant.nom} {diplome.etudiant.prenom}
            </p>
          </div>
        )}
      </>
    )}
  </div>
</div>

      {/* Section Professeurs */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Professeurs assignés
        </h3>
        <div className="space-y-2">
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
              <label className="block text-xs font-bold text-black">
                Sélectionnez les professeurs (max 2)
              </label>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {professeurs.map((prof) => {
                  const checked = diplome.professeurs.includes(prof.id);
                  return (
                    <label
                      key={prof.id}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                        checked ? 'bg-[#D4A017] text-white' : 'bg-white text-gray-700'
                      } hover:bg-[#F5E9DA] transition-colors`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleProfesseurChange(prof.id)}
                        className="form-checkbox h-4 w-4 text-[#D4A017] border-gray-300 rounded"
                      />
                      {prof.nom} {prof.prenom} - {prof.specialite}
                    </label>
                  );
                })}
              </div>
              
              {/* Message d'erreur en rouge pour la sélection des professeurs */}
              {error && (
                <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                {diplome.professeurs.length} / 2 professeurs sélectionnés
              </p>
            </>
          )}
        </div>
      </div>

      {/* Section Statut et Commentaires */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Statut et informations supplémentaires
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="estValide"
                  checked={diplome.estValide}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A017]"></div>
              </div>
              <span className="text-sm font-medium text-black">Diplôme validé</span>
            </label>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Commentaire</label>
            <textarea
              name="commentaire"
              value={diplome.commentaire}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
              placeholder="Notes supplémentaires sur le diplôme..."
            />
          </div>
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
          {submitting ? 'En cours...' : diplomeInitial ? 'Modifier' : 'Créer'} le diplôme
        </button>
      </div>
    </form>
  );
};

export default DiplomeForm;