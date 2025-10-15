"use client";
import React from "react";
import TableauDynamique from "@/components/TableauDynamique";
import { useState, useEffect } from "react";
import { Column, ExportConfig, FilterConfig, ImportConfig } from "@/components/TableauDynamique";
import { EnseignantResponse, NoteRequest, NoteResponse, UserResponse } from "@/lib/types";
import { fetchNotes, addNote, updateNote, deleteNote } from "@/lib/notes";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/Loading";
import NotesForm from "@/components/forms/NotesForm";
import NoteCard from "@/components/cards/NoteCard";
import { FaEye } from "react-icons/fa";
import NoteUpdateForm from "@/components/forms/NoteUpdateForm";
import { fetchUserIdByEmail } from "@/lib/auth";
import { fetchEnseignants } from "@/lib/enseignant";

export default function NotesPage() {
    const [notes, setNotes] = useState<NoteResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<NoteResponse | null>(null);
    const [user, setUser] = useState<UserResponse | null>(null);
    const [enseignants, setEnseignants] = useState<EnseignantResponse[]>([]);
    const [editingNote, setEditingNote] = useState<NoteResponse | null>(null);

    useEffect(() => {
        const loadNotes = async () => {
            try {
                const data = await fetchNotes();
                const enseignantData = await fetchEnseignants();
                setNotes(data);
                setEnseignants(enseignantData);
            } catch (err) {
                console.error("Erreur chargement notes:", err);
                toast.error("Erreur lors du chargement des notes");
            } finally {
                setLoading(false);
            }
        };
        loadNotes();
    }, []);

    const refreshNotes = async () => {
        const refreshedNotes = await fetchNotes();
        setNotes(refreshedNotes);
    };

    const colonnesNotes: Column<NoteResponse>[] = [
        {
            key: "studentNom",
            title: "Étudiant",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedNote(item); }}
                        className="text-[#D4A017] hover:text-gray-700 transition-colors"
                        title="Voir les détails"
                    >
                        <FaEye className="h-4 w-4" />
                    </button>   
                    <div className="flex flex-col">
                        <span className="whitespace-nowrap text-gray-900 font-medium">
                            {item.studentNom} {item.studentPrenom}
                        </span>
                    </div>
                </div>        
            )
        },
        {
            key: "matricule",
            title: "Matricule",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="text-gray-800 font-medium">{item.matricule}</span>
                </div>
            )
        },
        {
            key: "moduleNom",
            title: "Module",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="text-gray-800 font-medium">{item.moduleNom}</span>
                </div>
            )
        },
        {
            key: "valeur",
            title: "Note",
            render: (item) => (
                <div className="flex flex-col items-center">
                    <span className={`text-xs font-bold ${
                        (item.valeur || 0) >= 10 ? "text-green-600" : "text-red-600"
                    }`}>
                        {item.valeur?.toFixed(2) || "N/A"}
                    </span>
                    <span className="text-xs text-gray-500">/ 20</span>
                </div>
            )
        },
        {
            key: "typeNote",
            title: "Type de Note",
            render: (item) => (
                <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${item.typeNote === "EXAMEN" ? "bg-purple-100 text-purple-800" : ""}
                    ${item.typeNote === "CONTROLE" ? "bg-blue-100 text-blue-800" : ""}
                    ${item.typeNote === "TP" ? "bg-green-100 text-green-800" : ""}
                    ${item.typeNote === "PROJET" ? "bg-orange-100 text-orange-800" : ""}
                    ${!item.typeNote ? "bg-gray-100 text-gray-800" : ""}
                `}>
                    {item.typeNote || "Non spécifié"}
                </span>
            )
        },
        {
            key: "anneeScolaire",
            title: "Année Scolaire",
            render: (item) => (
                <span className="text-gray-600">{item.anneeScolaire}</span>
            )
        },
        {
            key: "saisiePar",
            title: "Saisie par",
            render: (item) => (
                <span className="text-gray-500 text-xs">{item.saisiePar || "Système"}</span>
            )
        },
        {
            key: "dateCreation",
            title: "Date Création",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="text-gray-700 text-sm">
                        {item.dateCreation ? new Date(item.dateCreation).toLocaleDateString() : "N/A"}
                    </span>
                    <span className="text-xs text-gray-500">
                        {item.dateCreation ? new Date(item.dateCreation).toLocaleTimeString() : ""}
                    </span>
                </div>
            )
        },
        {
            key: "dateModification",
            title: "Dernière Modif",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="text-gray-700 text-sm">
                        {item.dateModification ? new Date(item.dateModification).toLocaleDateString() : "N/A"}
                    </span>
                    <span className="text-xs text-gray-500">
                        {item.dateModification ? new Date(item.dateModification).toLocaleTimeString() : ""}
                    </span>
                </div>
            )
        },
        {
            key: "statut",
            title: "Statut",
            render: (item) => (
                <div className="flex flex-col items-center">
                    <div className={`
                        w-3 h-3 rounded-full mb-1
                        ${item.valeur ? "bg-green-500" : "bg-yellow-500"}
                    `} />
                    <span className="text-xs text-gray-500">
                        {item.valeur ? "Noté" : "Brouillon"}
                    </span>
                </div>
            )
        }
    ];

    // Configuration d'import
    const importConfig: ImportConfig<NoteResponse> = {
        headers: [],
        apiUrl: "http://localhost:8080/api/v1/admin/notes/import"
    };

    // Configuration d'export
    const exportConfig: ExportConfig<NoteResponse> = {
        filename: 'note',
        apiUrl: 'http://localhost:8080/api/v1/admin/notes/export'
    };

    // Configuration des filtres adaptée aux notes
    const filters: FilterConfig[] = [
        {
            key: "anneeScolaire",
            label: "Année Scolaire",
            options: Array.from(new Set(notes.map(note => note.anneeScolaire)))
                .filter(Boolean)
                .map(annee => ({
                    label: annee || "Non spécifié",
                    value: annee || ""
                }))
        },
        {
            key: "saisiePar",
            label: "Enseignant",
            options: Array.from(new Set(notes.map(note => note.saisiePar)))
                .filter(Boolean)
                .map(enseignant => ({
                    label: enseignant || "Système",
                    value: enseignant || ""
                }))
        },
        {
            key: "moduleNom",
            label: "Module",
            options: Array.from(new Set(notes.map(note => note.moduleNom)))
                .filter(Boolean)
                .map(module => ({
                    label: module,
                    value: module
                }))
        },
        {
            key: "typeNote",
            label: "Type de Note",
            options: Array.from(new Set(notes.map(note => note.typeNote)))
                .filter(Boolean)
                .map(type => ({
                    label: type,
                    value: type
                }))
        }
    ];

    // Gestion des actions - CORRIGÉ
    const handleAdd = async (note: NoteRequest) => {
        try {
            await addNote(note);
            toast.success("Note ajoutée avec succès");
            await refreshNotes(); 
        } catch (err) {
            console.error("Erreur ajout note:", err);
            toast.error("Erreur lors de l'ajout de la note");
            throw err;
        }
    };


 const handleEdit = async (note: NoteResponse) => {
  try {
  
    
    await updateNote(note.idNote, note);
    toast.success("Note mise à jour avec succès");
    await refreshNotes();
  } catch (err) {
    console.error("Erreur modification note:", err);
    throw err;
  }
};

const handleDelete = async (noteId: string) => {
    try {
        // Trouver la note complète pour obtenir les informations de l'enseignant
        const noteToDelete = notes.find(note => note.idNote === noteId);
        
        if (!noteToDelete) {
            toast.error("Note non trouvée");
            return;
        }

        // Vérifier que l'ID de la note est valide
        if (!noteToDelete.idNote) {
            toast.error("ID de note invalide");
            return;
        }

        // ÉTAPE 1: Trouver l'user par email (saisiePar) - Type UserResponse
        let userId: string | undefined;
        if (noteToDelete.saisiePar) {
            try {
                const user: UserResponse = await fetchUserIdByEmail(noteToDelete.saisiePar);
                if (user && user.idUser) {
                    userId = user.idUser;
                    console.log("User trouvé:", user.idUser, "Nom:", user.nom, user.prenom);
                } else {
                    console.warn(" Aucun utilisateur trouvé pour l'email:", noteToDelete.saisiePar);
                }
            } catch (error) {
                console.warn(" Erreur lors de la recherche de l'utilisateur:", error);
            }
        }

        // ÉTAPE 2: Trouver l'enseignant qui correspond à cet userId - Type EnseignantResponse
        let enseignantId: string | undefined;
        if (userId) {
            const enseignant: EnseignantResponse | undefined = enseignants.find(ens => ens.userId === userId);
            if (enseignant) {
                enseignantId = enseignant.enseignantId;
                console.log("Enseignant trouvé:", enseignantId, "pour userId:", userId);
            } else {
                console.warn("Aucun enseignant trouvé pour l'userId:", userId);
                // Debug: afficher tous les userId disponibles
                console.log("userId disponibles dans enseignants:", enseignants.map(e => e.userId));
            }
        }

        if (!enseignantId) {
            console.warn("Recherche alternative de l'enseignant...");
            
            if (enseignants.length > 0) {
                const enseignantParDefaut: EnseignantResponse = enseignants[0];
                enseignantId = enseignantParDefaut.enseignantId;
                console.log("🔄 Utilisation de l'enseignant par défaut:", enseignantId);
            }
        }

        if (!enseignantId) {
            toast.error("Impossible de déterminer l'ID de l'enseignant pour la suppression");
            console.error(" Aucun enseignantId trouvé après toutes les tentatives");
            return;
        }

        // Maintenant on a l'enseignantId, on peut supprimer la note
        console.log(" Suppression avec noteId:", noteToDelete.idNote, "enseignantId:", enseignantId);
        await deleteNote(noteToDelete.idNote, enseignantId);
        toast.success("Note supprimée avec succès");
        await refreshNotes();
    } catch (err: any) {
        console.error(" Erreur suppression note:", err);
        toast.error(err?.message || "Erreur lors de la suppression de la note");
    }
};
    // Fonction pour obtenir l'ID d'une ligne - CORRIGÉE
    const getRowId = (note: NoteResponse) => {
        if (!note.idNote) {
            console.warn("Note sans ID:", note);
            // Générer un ID temporaire pour éviter les erreurs
            return `temp-${Math.random().toString(36).substr(2, 9)}`;
        }
        return note.idNote;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-8">
            <TableauDynamique<NoteResponse>
                data={notes}
                columns={colonnesNotes}
                getRowId={getRowId}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete} 
                emptyMessage="Aucune note trouvée"
                
                // Configuration import/export
                importConfig={importConfig}
                exportConfig={exportConfig}
                
                // Configuration des filtres
                filters={filters}
                
                // Composant de formulaire personnalisé
                formComponent={({ itemInitial, onSave, onCancel }) =>
                    itemInitial ? (
                    <NoteUpdateForm note={itemInitial} onSave={onSave} onCancel={onCancel} />
                    ) : (
                    <NotesForm onSave={onSave} onCancel={onCancel} />
                    )
                }
                
                // Options d'affichage
                showActions={true}
                showSearch={true}
                showImportExport={true}
                showFilters={true}
                showAddButton={true}
            />
            
            {selectedNote && (
                <NoteCard
                    note={selectedNote} 
                    onClose={() => setSelectedNote(null)}
                />
            )}
        </div>
    );
}