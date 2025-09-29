"use client";

import React, { useState, useEffect } from 'react';
import { Mention, ModeRemise, TypeDiplome, Student, Enseignant, DiplomeRequest } from '@/lib/types';
import { fetchStudents } from '@/lib/students';
import { addDiplome, updateDiplome } from '@/lib/diplome';
import { fetchEnseignants } from "@/lib/enseignant";
import toast from 'react-hot-toast';

interface DiplomeFormProps {
  onSave: (diplome: any) => void;
  diplomeInitial?: any;
  onCancel?: () => void;
}

const DiplomeForm = ({ onSave, diplomeInitial, onCancel }: DiplomeFormProps) => {
  const [etudiants, setStudents] = useState<Student[]>([]);
  const [professeurs, setEnseignants] = useState<Enseignant[]>([]);
  const [diplome, setDiplome] = useState<DiplomeRequest>({
    typeDiplome: TypeDiplome.LICENCE,
    nomDiplome: '',
    niveau: '',
    anneeObtention: new Date().getFullYear(),
    estValide: false,
    studentId: "",
    mention: Mention.PASSABLE,
    dateDelivrance: '',
    commentaire: '',
    modeRemise: ModeRemise.PRESENTIEL,
    professeursIds: [],
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
          fetchStudents(),
          fetchEnseignants()
        ]);
        
        console.log("Étudiants chargés:", etudiantsResponse);
        console.log("Professeurs chargés:", professeursResponse);
        
        setStudents(etudiantsResponse);
        setEnseignants(professeursResponse);
      } catch (err) {
        console.error("Erreur chargement données:", err);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // CORRECTION : Initialisation simplifiée et robuste
  useEffect(() => {
    if (diplomeInitial && etudiants.length > 0 && professeurs.length > 0) {
      console.log("=== INITIALISATION DU FORMULAIRE ===");
      console.log("Diplôme initial:", diplomeInitial);

      // CORRECTION : Gestion simplifiée de studentId
      let studentIdToSet = "";
      if (diplomeInitial.studentId) {
        studentIdToSet = diplomeInitial.studentId.toString();
      } else if (diplomeInitial.student?.idStudent) {
        studentIdToSet = diplomeInitial.student.idStudent.toString();
      }

      // CORRECTION : Validation que l'étudiant existe
      if (studentIdToSet) {
        const studentExists = etudiants.some(e => 
          e.idStudent?.toString() === studentIdToSet || e.id?.toString() === studentIdToSet
        );
        if (!studentExists) {
          console.warn("Étudiant initial non trouvé dans la liste:", studentIdToSet);
          studentIdToSet = "";
        }
      }

      // CORRECTION : Gestion simplifiée des professeurs
      let professeursIdsToSet: string[] = [];
      
      if (diplomeInitial.professeursIds && Array.isArray(diplomeInitial.professeursIds)) {
        professeursIdsToSet = diplomeInitial.professeursIds
          .map((id: any) => id?.toString())
          .filter((id: string) => id && id !== "null" && id !== "undefined")
          .filter((id: string) => 
            professeurs.some(p => p.enseignantId?.toString() === id || p.id?.toString() === id)
          );
      } else if (diplomeInitial.enseignants && Array.isArray(diplomeInitial.enseignants)) {
        professeursIdsToSet = diplomeInitial.enseignants
          .map((prof: any) => prof.enseignantId?.toString() || prof.id?.toString())
          .filter((id: string) => id && id !== "null" && id !== "undefined")
          .filter((id: string) => 
            professeurs.some(p => p.enseignantId?.toString() === id || p.id?.toString() === id)
          );
      }

      console.log("StudentId final:", studentIdToSet);
      console.log("ProfesseursIds final:", professeursIdsToSet);

      setDiplome({
        typeDiplome: diplomeInitial.typeDiplome || TypeDiplome.LICENCE,
        nomDiplome: diplomeInitial.nomDiplome || '',
        niveau: diplomeInitial.niveau || '',
        anneeObtention: diplomeInitial.anneeObtention || new Date().getFullYear(),
        estValide: diplomeInitial.estValide || false,
        studentId: studentIdToSet,
        mention: diplomeInitial.mention || Mention.PASSABLE,
        dateDelivrance: diplomeInitial.dateDelivrance || '',
        commentaire: diplomeInitial.commentaire || '',
        modeRemise: diplomeInitial.modeRemise || ModeRemise.PRESENTIEL,
        professeursIds: professeursIdsToSet,
      });
    }
  }, [diplomeInitial, etudiants, professeurs]);

  // CORRECTION : Gestion des professeurs avec validation
  const handleEnseignantChange = (professeurId: string) => {
    if (!professeurId || professeurId === "null" || professeurId === "undefined") {
      console.error("ID professeur invalide:", professeurId);
      return;
    }

    setDiplome(prev => {
      const isSelected = prev.professeursIds.includes(professeurId);
      let newEnseignants: string[];
      
      if (isSelected) {
        newEnseignants = prev.professeursIds.filter(id => id !== professeurId);
      } else {
        if (prev.professeursIds.length >= 2) {
          setError("Maximum 2 professeurs autorisés");
          return prev;
        }
        newEnseignants = [...prev.professeursIds, professeurId];
        setError('');
      }
      
      return {
        ...prev,
        professeursIds: newEnseignants
      };
    });
  };

  // CORRECTION : Gestion des changements avec validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setDiplome(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setDiplome(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else if (name === "studentId") {
      // CORRECTION : Validation de l'ID étudiant
      const studentId = value && value !== "" ? value : "";
      setDiplome(prev => ({ ...prev, studentId }));
    } else {
      setDiplome(prev => ({ ...prev, [name]: value }));
    }
  };

  // CORRECTION : Soumission avec validation renforcée
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    console.log("=== VALIDATION DES DONNÉES ===");
    console.log("Données avant nettoyage:", diplome);

    // CORRECTION : Validation stricte des données
    if (!diplome.studentId || diplome.studentId === "") {
      setError("Veuillez sélectionner un étudiant");
      setSubmitting(false);
      return;
    }

    if (!diplome.nomDiplome.trim()) {
      setError("Le nom du diplôme est obligatoire");
      setSubmitting(false);
      return;
    }

    // CORRECTION : Nettoyage des IDs
    const cleanProfesseursIds = diplome.professeursIds
      .filter((id: string) => id && id !== "" && id !== "null" && id !== "undefined")
      .map((id: string) => id.toString());

    // CORRECTION : Préparation des données finales
    const diplomeToSend = {
      typeDiplome: diplome.typeDiplome,
      nomDiplome: diplome.nomDiplome.trim(),
      niveau: diplome.niveau,
      anneeObtention: diplome.anneeObtention,
      estValide: diplome.estValide,
      studentId: diplome.studentId.toString(), // Assurer que c'est un string
      mention: diplome.mention,
      dateDelivrance: diplome.dateDelivrance,
      modeRemise: diplome.modeRemise,
      commentaire: diplome.commentaire,
      professeursIds: cleanProfesseursIds,
    };

    console.log("Données après nettoyage:", diplomeToSend);

    try {
      let response;
      if (diplomeInitial && (diplomeInitial.idDiplome || diplomeInitial.id)) {
        const diplomeId = (diplomeInitial.idDiplome || diplomeInitial.id).toString();
        console.log("Mise à jour du diplôme ID:", diplomeId);
        response = await updateDiplome(diplomeId, diplomeToSend);
        toast.success("Diplôme modifié avec succès !");
      } else {
        console.log("Création d'un nouveau diplôme");
        response = await addDiplome(diplomeToSend);
        toast.success("Diplôme ajouté avec succès !");
      }
      onSave(response);
    } catch (err: any) {
      console.error("Erreur détaillée:", err);
      const errorMessage = err.response?.data?.message || err.message || "Erreur lors de l'enregistrement";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudent = etudiants.find(e => 
    e.idStudent?.toString() === diplome.studentId || e.id?.toString() === diplome.studentId
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

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
              {Object.values(Mention).map(mention => (
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
              {Object.values(ModeRemise).map(mode => (
                <option key={`mode-${mode}`} value={mode}>{mode}</option>
              ))}
            </select>
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
                Sélectionnez l'étudiant*
              </label>
              <select
                name="studentId"
                value={diplome.studentId || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
              >
                <option value="">Sélectionner un étudiant</option>
                {etudiants.map((etudiant) => (
                  <option 
                    key={etudiant.idStudent || etudiant.id} 
                    value={etudiant.idStudent || etudiant.id}
                  >
                    {etudiant.nom} {etudiant.prenom} - {etudiant.matricule}
                  </option>
                ))}
              </select>
              
              {selectedStudent && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-700">
                    <span className="font-semibold">Étudiant sélectionné:</span> {selectedStudent.nom} {selectedStudent.prenom} - {selectedStudent.matricule}
                  </p>
                </div>
              )}
            </>
          )}
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
                  const profId = prof.enseignantId || prof.id;
                  const checked = diplome.professeursIds.includes(profId?.toString() || '');
                  
                  return (
                    <label
                      key={profId}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                        checked ? 'bg-[#D4A017] text-white' : 'bg-white text-gray-700'
                      } hover:bg-[#F5E9DA] transition-colors`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleEnseignantChange(profId?.toString() || '')}
                        className="form-checkbox h-4 w-4 text-[#D4A017] border-gray-300 rounded focus:ring-[#D4A017]"
                      />
                      {prof.user?.nom} {prof.user?.prenom} - {prof.specialite}
                    </label>
                  );
                })}
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                {diplome.professeursIds.length} / 2 professeurs sélectionnés
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
          className="px-6 py-3 text-sm bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg hover:bg-[#B38C0F] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'En cours...' : diplomeInitial ? 'Modifier' : 'Créer'} le diplôme
        </button>
      </div>
    </form>
  );
};

export default DiplomeForm;