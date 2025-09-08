"use client";

import React, { useEffect, useState } from "react";
import { Professeur, StatutProfesseur, Diplome, Formation, Horaire } from "@/lib/types";
import { addProfesseur, getDiplomes, getFormations } from "@/lib/services";
import toast from "react-hot-toast";

interface ProfesseurFormProps {
  onSave: (professeur: Professeur) => void;
  onCancel: () => void;
  professeurInitial?: Professeur;
}

// Liste des jours de la semaine
const JOURS_SEMAINE = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const ProfesseurForm = ({ onSave, onCancel, professeurInitial }: ProfesseurFormProps) => {
  const [diplomesList, setDiplomesList] = useState<Diplome[]>([]);
  const [formationsList, setFormationsList] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [horaires, setHoraires] = useState<Horaire[]>([]);

  const [prof, setProf] = useState<Omit<Professeur, "id">>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    specialite: "",
    dateEmbauche: "",
    statut: Object.values(StatutProfesseur)[0] as StatutProfesseur,
    photo: "",
    heuresTravail: 0,
    horaires: [],
    diplomes: [],
    formations: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [diplomesResponse, formationsResponse] = await Promise.all([
          getDiplomes(),
          getFormations()
        ]);
        setDiplomesList(diplomesResponse.data || []);
        setFormationsList(formationsResponse.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (professeurInitial) {
      setProf({
        nom: professeurInitial.nom || "",
        prenom: professeurInitial.prenom || "",
        email: professeurInitial.email || "",
        telephone: professeurInitial.telephone || "",
        specialite: professeurInitial.specialite || "",
        dateEmbauche: professeurInitial.dateEmbauche || "",
        statut: professeurInitial.statut || Object.values(StatutProfesseur)[0] as StatutProfesseur,
        photo: professeurInitial.photo || "",
        heuresTravail: professeurInitial.heuresTravail || 0,
        horaires: professeurInitial.horaires || [],
        diplomes: professeurInitial.diplomes || [],
        formations: professeurInitial.formations || [],
      });
      
      // Initialiser les horaires si disponibles
      if (Array.isArray(professeurInitial.horaires) && professeurInitial.horaires.length > 0) {
        setHoraires(professeurInitial.horaires);
      } else {
        setHoraires([]);
      }
    }
  }, [professeurInitial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setProf(prev => ({
      ...prev,
      [name]: type === "number" ? (Number(value) || 0) : value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProf(prev => ({ ...prev, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleDiplomeChange = (diplomeId: number) => {
    setProf(prev => {
      const selectedDiplome = diplomesList.find(d => d.id === diplomeId);
      if (!selectedDiplome) return prev;
      
      const isSelected = prev.diplomes?.some(d => d.id === diplomeId);
      
      if (isSelected) {
        return {
          ...prev,
          diplomes: prev.diplomes?.filter(d => d.id !== diplomeId) || []
        };
      } else {
        return {
          ...prev,
          diplomes: [...(prev.diplomes || []), selectedDiplome]
        };
      }
    });
  };

  const handleFormationChange = (formationId: number) => {
    setProf(prev => {
      const selectedFormation = formationsList.find(f => f.id === formationId);
      if (!selectedFormation) return prev;
      
      const isSelected = prev.formations?.some(f => f.id === formationId);
      
      if (isSelected) {
        return {
          ...prev,
          formations: prev.formations?.filter(f => f.id !== formationId) || []
        };
      } else {
        return {
          ...prev,
          formations: [...(prev.formations || []), selectedFormation]
        };
      }
    });
  };

  // Gestion des horaires
  const addHoraire = () => {
    setHoraires(prev => [...prev, { jour: "Lundi", debut: "08:00", fin: "12:00" }]);
  };

  const updateHoraire = (index: number, field: keyof Horaire, value: string) => {
    setHoraires(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  };

  const removeHoraire = (index: number) => {
    setHoraires(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const professeurComplet: Professeur = {
      ...prof,
      id: professeurInitial?.id || Date.now(),
      horaires: horaires,
    } as Professeur;

    try {
      if (!professeurInitial) {
        await addProfesseur(professeurComplet);
      }
      onSave(professeurComplet);
      toast.success(`Professeur ${professeurInitial ? "modifié" : "ajouté"} avec succès !`);
    } catch (err) {
      console.error("Erreur ajout professeur:", err);
      toast.error("Erreur lors de l'opération");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Informations personnelles */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Nom*</label>
            <input 
              name="nom" 
              value={prof.nom} 
              onChange={handleChange} 
              required 
              placeholder="Nom"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Prénom*</label>
            <input 
              name="prenom" 
              value={prof.prenom} 
              onChange={handleChange} 
              required 
              placeholder="Prénom"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Email*</label>
            <input 
              name="email" 
              type="email" 
              value={prof.email} 
              onChange={handleChange} 
              required 
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Téléphone</label>
            <input 
              name="telephone" 
              value={prof.telephone} 
              onChange={handleChange} 
              placeholder="Téléphone"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all" 
            />
          </div>
        </div>
      </div>

      {/* Informations professionnelles */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Informations professionnelles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Spécialité</label>
            <input 
              name="specialite" 
              value={prof.specialite} 
              onChange={handleChange} 
              placeholder="Spécialité"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Date d'embauche</label>
            <input 
              name="dateEmbauche" 
              value={prof.dateEmbauche} 
              onChange={handleChange} 
              type="date"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Statut</label>
            <select 
              name="statut" 
              value={prof.statut || ""} 
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
              <option value="">Sélectionnez un statut</option>
              {Object.values(StatutProfesseur).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Heures / semaine</label>
            <input 
              name="heuresTravail" 
              type="number" 
              min={0} 
              value={prof.heuresTravail} 
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all" 
            />
          </div>
        </div>
      </div>

      {/* Plages horaires */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Emploi du temps
        </h3>
        <div className="space-y-4">
          {horaires.map((horaire, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-3 border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black">Jour</label>
                  <select
                    value={horaire.jour}
                    onChange={(e) => updateHoraire(index, 'jour', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  >
                    {JOURS_SEMAINE.map(jour => (
                      <option key={jour} value={jour}>{jour}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black">Début</label>
                  <input
                    type="time"
                    value={horaire.debut}
                    onChange={(e) => updateHoraire(index, 'debut', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black">Fin</label>
                  <input
                    type="time"
                    value={horaire.fin}
                    onChange={(e) => updateHoraire(index, 'fin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeHoraire(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Supprimer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addHoraire}
            className="px-4 py-2 bg-[#D4A017] text-white rounded-lg text-sm hover:bg-[#b38712] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:ring-opacity-50"
          >
            + Ajouter une plage horaire
          </button>
        </div>
      </div>

      {/* Diplômes */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">Diplômes</h3>
        {loading ? (
          <div className="text-center py-4 text-gray-500">
            Chargement des diplômes...
          </div>
        ) : diplomesList.length === 0 ? (
          <div className="text-center py-4 text-red-500">
            Aucun diplôme disponible
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-black">
              Sélectionnez les diplômes
            </label>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {diplomesList.map((diplome) => {
                const checked = prof.diplomes?.some(d => d.id === diplome.id);
                return (
                  <label
                    key={diplome.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                      checked ? 'bg-[#D4A017] text-white' : 'bg-white text-gray-700'
                    } hover:bg-[#F5E9DA] transition-colors`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleDiplomeChange(diplome.id)}
                      className="form-checkbox h-4 w-4 text-[#D4A017] border-gray-300 rounded"
                    />
                    {diplome.nomDiplome} - {diplome.typeDiplome}
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {prof.diplomes?.length || 0} diplôme(s) sélectionné(s)
            </p>
          </div>
        )}
      </div>

      {/* Formations */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">Formations</h3>
        {loading ? (
          <div className="text-center py-4 text-gray-500">
            Chargement des formations...
          </div>
        ) : formationsList.length === 0 ? (
          <div className="text-center py-4 text-red-500">
            Aucune formation disponible
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-black">
              Sélectionnez les formations
            </label>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {formationsList.map((formation) => {
                const checked = prof.formations?.some(f => f.id === formation.id);
                return (
                  <label
                    key={formation.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                      checked ? 'bg-[#D4A017] text-white' : 'bg-white text-gray-700'
                    } hover:bg-[#F5E9DA] transition-colors`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleFormationChange(formation.id)}
                      className="form-checkbox h-4 w-4 text-[#D4A017] border-gray-300 rounded"
                    />
                    {formation.nom} - {formation.description}
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {prof.formations?.length || 0} formation(s) sélectionnée(s)
            </p>
          </div>
        )}
      </div>

      {/* Photo */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">Photo</h3>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-black">Photo de profil</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all" 
          />
        </div>
      </div>

      {/* Submit avec bouton Annuler */}
      <div className="flex justify-end space-x-4 mt-8">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-6 py-3 text-sm bg-[#C0C0C0] text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-all transform hover:scale-105"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:ring-opacity-50 transition-all transform hover:scale-105"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
};

export default ProfesseurForm;