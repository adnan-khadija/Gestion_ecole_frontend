"use client";
import React, { useState, useEffect } from "react";
import { updateNote } from "@/lib/notes";
import { NoteResponse, TypeNote, NoteRequest, EnseignantResponse } from "@/lib/types";
import toast from 'react-hot-toast';
import { fetchUserIdByEmail } from "@/lib/auth";
import { fetchEnseignants } from "@/lib/enseignant";

interface NoteUpdateFormProps {
  note: NoteResponse | null;
  onSave: (updatedNote: NoteResponse) => void;
  onCancel: () => void;
  currentUserEmail?: string;
}

export default function NoteUpdateForm({ note, onSave, onCancel, currentUserEmail }: NoteUpdateFormProps) {
  const [selectedTypeNote, setSelectedTypeNote] = useState<TypeNote>(TypeNote.C1);
  const [valeurNote, setValeurNote] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [enseignants, setEnseignants] = useState<EnseignantResponse[]>([]);
  const [currentEnseignantId, setCurrentEnseignantId] = useState<string>("");

  // Charger la liste des enseignants et déterminer l'enseignant connecté
  useEffect(() => {
    const loadEnseignantsAndCurrent = async () => {
      try {
        const enseignantsList = await fetchEnseignants();
        setEnseignants(enseignantsList);
        console.log("Enseignants chargés:", enseignantsList);

        // Trouver l'enseignant correspondant à l'utilisateur connecté
        if (currentUserEmail) {
          try {
            const user = await fetchUserIdByEmail(currentUserEmail);
            console.log("Utilisateur trouvé pour email:", currentUserEmail, user);
            
            if (user?.idUser) {
              const currentEnseignant = enseignantsList.find(ens => ens.userId === user.idUser);
              if (currentEnseignant) {
                setCurrentEnseignantId(currentEnseignant.enseignantId);
                console.log("Enseignant connecté trouvé:", currentEnseignant.enseignantId);
              } else {
                console.warn("Aucun enseignant trouvé pour userId:", user.idUser);
                // Utiliser le premier enseignant disponible comme fallback
                if (enseignantsList.length > 0) {
                  setCurrentEnseignantId(enseignantsList[0].enseignantId);
                  console.log("Utilisation du premier enseignant disponible:", enseignantsList[0].enseignantId);
                }
              }
            }
          } catch (userError) {
            console.error("Erreur lors de la recherche de l'utilisateur:", userError);
            // Fallback: utiliser le premier enseignant
            if (enseignantsList.length > 0) {
              setCurrentEnseignantId(enseignantsList[0].enseignantId);
            }
          }
        } else {
          console.warn("Aucun email utilisateur fourni, utilisation du premier enseignant");
          if (enseignantsList.length > 0) {
            setCurrentEnseignantId(enseignantsList[0].enseignantId);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des enseignants:", error);
        toast.error("Impossible de charger la liste des enseignants");
      }
    };

    loadEnseignantsAndCurrent();
  }, [currentUserEmail]);

  // Charger les données de la note quand elle change
  useEffect(() => {
    if (note) {
      console.log("Note reçue pour modification:", note);
      setSelectedTypeNote(note.typeNote);
      setValeurNote(note.valeur);
      setSelectedYear(note.anneeScolaire);
    }
  }, [note]);

  // Fonction pour trouver l'enseignantId à partir de l'email (saisiePar)
  const findEnseignantIdByEmail = async (email: string): Promise<string | null> => {
    if (!email) return null;

    try {
      // Étape 1: Trouver l'userId à partir de l'email
      const user = await fetchUserIdByEmail(email);
      if (!user?.idUser) {
        console.warn("Utilisateur non trouvé pour l'email:", email);
        return null;
      }

      // Étape 2: Trouver l'enseignantId à partir de l'userId
      const enseignant = enseignants.find(ens => ens.userId === user.idUser);
      if (enseignant) {
        console.log("Enseignant trouvé pour l'email:", email, "->", enseignant.enseignantId);
        return enseignant.enseignantId;
      } else {
        console.warn("Aucun enseignant trouvé pour l'userId:", user.idUser);
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de l'enseignant par email:", error);
      return null;
    }
  };

  const handleUpdateNote = async () => {
    if (!note) {
      toast.error("Aucune note sélectionnée");
      return;
    }

    try {
      setLoading(true);

      // Vérification des données requises
      if (!valeurNote || valeurNote > 20 || !selectedYear) {
        toast.error("Veuillez remplir tous les champs obligatoires avec des valeurs valides");
        return;
      }

      let enseignantIdToUse = currentEnseignantId;

      // Si l'enseignant connecté n'est pas disponible, essayer de trouver l'enseignant original
      if (!enseignantIdToUse && note.saisiePar) {
        console.log("Recherche de l'enseignant original par email:", note.saisiePar);
        const originalEnseignantId = await findEnseignantIdByEmail(note.saisiePar);
        if (originalEnseignantId) {
          enseignantIdToUse = originalEnseignantId;
          console.log("Utilisation de l'enseignant original:", enseignantIdToUse);
        }
      }

      // Fallback: utiliser le premier enseignant disponible
      if (!enseignantIdToUse && enseignants.length > 0) {
        enseignantIdToUse = enseignants[0].enseignantId;
        console.log("Utilisation du premier enseignant disponible:", enseignantIdToUse);
      }

      if (!enseignantIdToUse) {
        toast.error("Impossible de déterminer l'enseignant pour la modification");
        return;
      }

      // Vérifier que tous les IDs requis sont présents
      if (!note.studentId || !note.moduleId) {
        toast.error("Données de note incomplètes (studentId ou moduleId manquant)");
        return;
      }

      // 🔹 Préparer NoteRequest avec validation
      const noteRequest: NoteRequest = {
        studentId: note.studentId,
        moduleId: note.moduleId,
        typeNote: selectedTypeNote,
        valeur: valeurNote,
        enseignantId: enseignantIdToUse,
        anneeScolaire: selectedYear,
      };

      console.log("=== DONNÉES DE MISE À JOUR ===");
      console.log("ID Note:", note.idNote);
      console.log("EnseignantId utilisé:", enseignantIdToUse);
      console.log("Email enseignant original (saisiePar):", note.saisiePar);
      console.log("NoteRequest:", noteRequest);

      // Appel API de mise à jour
      const updatedNote = await updateNote(note.idNote, noteRequest);
      
      console.log("Note mise à jour avec succès:", updatedNote);
      onSave(updatedNote);
      toast.success("Note modifiée avec succès!");
    } catch (error: any) {
      console.error("Erreur détaillée lors de la modification de la note:", error);
      
      // Gestion spécifique des erreurs
      if (error.message?.includes("The given id must not be null")) {
        toast.error("Erreur: Un identifiant requis est manquant. Vérifiez les données de la note.");
      } else if (error.message?.includes("autorisé") || error.response?.status === 403) {
        toast.error("Vous n'avez pas l'autorisation de modifier cette note.");
      } else if (error.response?.status === 400) {
        toast.error(error.message || "Données invalides pour la modification");
      } else if (error.message?.includes("ID de note manquant")) {
        toast.error("ID de note invalide");
      } else {
        toast.error(error.message || "Erreur lors de la modification de la note");
      }
    } finally {
      setLoading(false);
    }
  };

  // Si aucune note n'est fournie, ne rien afficher
  if (!note) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
   

      {/* Informations de la note */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">Informations de la note</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Étudiant</label>
            <p className="text-gray-700">{note.studentNom} {note.studentPrenom}</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Module</label>
            <p className="text-gray-700">{note.moduleNom}</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Matricule</label>
            <p className="text-gray-700">{note.matricule}</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Note actuelle</label>
            <p className="text-gray-700 font-bold">{note.valeur}/20</p>
          </div>
        </div>
      </div>

      {/* Informations de débogage */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">Informations techniques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">ID Note</label>
            <p className="font-mono text-gray-700 truncate">{note.idNote}</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Enseignant (email)</label>
            <p className="text-gray-700 truncate">{note.saisiePar}</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Votre ID Enseignant</label>
            <p className="font-mono text-gray-700 truncate">{currentEnseignantId || "Chargement..."}</p>
          </div>
        </div>
      </div>

      {/* Formulaire de modification */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-black mb-4">Modifier la note</h2>
        <div className="space-y-6">
          {/* Type de note */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Type de Note *</label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
              value={selectedTypeNote}
              onChange={(e) => setSelectedTypeNote(e.target.value as TypeNote)}
            >
              {Object.keys(TypeNote).map((key) => (
                <option key={key} value={key}>
                  {TypeNote[key as keyof typeof TypeNote]}
                </option>
              ))}
            </select>
          </div>

          {/* Année scolaire */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Année Scolaire *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder="Ex: 2024/2025"
              required
            />
          </div>

          {/* Valeur de la note */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-black">Valeur de la Note *</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] pr-16"
                value={valeurNote}
                onChange={(e) => setValeurNote(Number(e.target.value))}
                placeholder="0.0 - 20.0"
                required
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                / 20
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Note actuelle: <span className="font-bold">{note.valeur}/20</span>
            </p>
          </div>
        </div>

        {/* Indicateur de validation */}
        {valeurNote > 20 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">
              ⚠️ La note ne peut pas dépasser 20
            </p>
          </div>
        )}

        {/* Chargement des enseignants */}
        {enseignants.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">
              Chargement de la liste des enseignants...
            </p>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        <button
          onClick={handleUpdateNote}
          disabled={loading || !valeurNote || valeurNote > 20 || !selectedYear || !currentEnseignantId}
          className="px-6 py-3 bg-[#D4A017] text-white rounded-lg hover:bg-[#b38714] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Modification..." : "Modifier Note"}
        </button>
      </div>
    </div>
  );
}