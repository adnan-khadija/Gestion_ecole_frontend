"use client";

import React, { useEffect, useState } from "react";
import { Professeur, StatutProfesseur } from "@/lib/types";
import { addProfesseur } from "@/lib/services";
import toast from "react-hot-toast";

interface ProfesseurFormProps {
  onSave: (professeur: Professeur) => void;
  professeurInitial?: Omit<Professeur, "id">;
}

const ProfesseurForm = ({ onSave, professeurInitial }: ProfesseurFormProps) => {
  const initialDiplomes = Array.isArray(professeurInitial?.diplomes)
    ? professeurInitial.diplomes.map(d => (d as any).nom || "")
    : [];

  const [diplomes, setDiplomes] = useState<string[]>(initialDiplomes);

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
    if (professeurInitial) {
      setProf({
        ...professeurInitial,
        diplomes: Array.isArray(professeurInitial.diplomes) ? professeurInitial.diplomes : [],
      });

      setDiplomes(Array.isArray(professeurInitial.diplomes)
        ? professeurInitial.diplomes.map(d => (d as any).nom || "")
        : []);
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

  const addDiplomeField = () => setDiplomes(d => [...d, ""]);
  const updateDiplome = (i: number, v: string) => setDiplomes(d => d.map((x, idx) => idx === i ? v : x));
  const removeDiplome = (i: number) => setDiplomes(d => d.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const professeurComplet: Professeur = {
      ...(prof as Professeur),
      id: professeurInitial ? (professeurInitial as any).id : Date.now(),
      diplomes: diplomes.map(name => ({ id: Date.now() + Math.random(), nom: name } as any)),
    };

    try {
      if (!professeurInitial) await addProfesseur(professeurComplet);
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
      <div className="bg-white rounded-xl px-2">
        <h3 className="text-sm font-semibold text-[#0d68ae] mb-2 pb-2 border-b border-gray-100 flex items-center">
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#8a8a19]">Nom*</label>
            <input name="nom" value={prof.nom} onChange={handleChange} required placeholder="Nom"
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a8a19]" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#8a8a19]">Prénom*</label>
            <input name="prenom" value={prof.prenom} onChange={handleChange} required placeholder="Prénom"
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a8a19]" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#8a8a19]">Email*</label>
            <input name="email" type="email" value={prof.email} onChange={handleChange} required placeholder="Email"
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a8a19]" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#8a8a19]">Téléphone</label>
            <input name="telephone" value={prof.telephone} onChange={handleChange} placeholder="Téléphone"
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a8a19]" />
          </div>
        </div>
      </div>

      {/* Informations professionnelles */}
      <div className="bg-white rounded-xl p-2">
        <h3 className="text-sm font-semibold text-[#0d68ae] mb-2 pb-2 border-b border-gray-100 flex items-center">
          Informations professionnelles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#8a8a19]">Spécialité</label>
            <input name="specialite" value={prof.specialite} onChange={handleChange} placeholder="Spécialité"
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a8a19]" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#8a8a19]">Date d'embauche</label>
            <input name="dateEmbauche" value={prof.dateEmbauche} onChange={handleChange} type="date"
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a8a19]" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#8a8a19]">Statut</label>
            <select name="statut" value={prof.statut || ""} onChange={handleChange}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a8a19]">
              <option value="">Sélectionnez un statut</option>
              {Object.values(StatutProfesseur).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#8a8a19]">Heures / semaine</label>
            <input name="heuresTravail" type="number" min={0} value={prof.heuresTravail} onChange={handleChange}
              className="w-full px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a8a19]" />
          </div>
        </div>
      </div>

      {/* Diplômes */}
      <div className="bg-white rounded-xl p-2">
        <h3 className="text-sm font-semibold text-[#0d68ae] mb-2 pb-2 border-b border-gray-100 flex items-center">Diplômes</h3>
        {Array.isArray(diplomes) && diplomes.map((d, i) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <input value={d} onChange={(e) => updateDiplome(i, e.target.value)} placeholder="Nom du diplôme"
              className="flex-1 px-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a8a19]" />
            <button type="button" onClick={() => removeDiplome(i)} className="text-red-600 px-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={addDiplomeField} className="px-3 py-1 bg-[#0d68ae] text-white rounded text-sm hover:bg-[#0274be] transition">+ Ajouter un diplôme</button>
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-4 mt-8">
        <button type="submit" className="px-6 py-3 text-sm bg-[#0d68ae] text-white rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0d68ae] transition-all transform hover:scale-105">
          Enregistrer
        </button>
      </div>
    </form>
  );
};

export default ProfesseurForm;
