"use client";
import React from "react";
import TableauDynamique from "@/components/TableauDynamique";
import { useState, useEffect } from "react";
import { Column, ExportConfig, FilterConfig, ImportConfig } from "@/components/TableauDynamique";
import { Diplome, Mention, ModeRemise, TypeDiplome } from "@/lib/types";
import { fetchDiplomes, addDiplome, updateDiplome, deleteDiplome } from "@/lib/diplome";
import toast from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { LoadingSpinner } from "@/components/Loading";
import DiplomeForm from "@/components/forms/DiplomeForm"; 

import DiplomeCard from "@/components/cards/DiplomeCard";

export default function DiplomesPage() {
    const [diplomes, setDiplomes] = useState<Diplome[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDiplome, setSelectedDiplome] = useState<Diplome | null>(null);

    useEffect(() => {
        const loadDiplomes = async () => {
            try {
                const data = await fetchDiplomes();
                console.log("Diplômes récupérés :", data);
                setDiplomes(data);
            } catch (err) {
                console.error("Erreur chargement diplômes:", err);
                toast.error("Erreur lors du chargement des diplômes");
            } finally {
                setLoading(false);
            }
        };
        loadDiplomes();
    }, []);

    diplomes.forEach(d => {
        console.log("Diplome:", d.nomDiplome);
        console.log("Enseignants:", d.enseignants?.map(e => e.user?.prenom + " " + e.user?.nom));
    });

    
 const refreshDiplomes = async () => {
      const refreshDiplomes = await fetchDiplomes();
      setDiplomes(refreshDiplomes);
    };
    const colonnesDiplomes: Column<Diplome>[] = [
        {
            key: "nomDiplome",
            title: "Nom du Diplôme",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedDiplome(item); }}
                        className="text-[#D4A017] hover:text-gray-700 transition-colors"
                        title="Voir les détails"
                    >
                        <FaEye className="h-4 w-4" />
                    </button>
                    <span className="whitespace-nowrap text-gray-500">{item.nomDiplome}</span>
                </div>
            ),
        },
        {
            key: "typeDiplome",
            title: "Type de Diplôme",
            render: (item) => <span className="whitespace-nowrap text-gray-500">{item.typeDiplome}</span>,
        },
       
        {
            key: "niveau",
            title: "Niveau",
            render: (item) => <span className="whitespace-nowrap text-gray-500">{item.niveau || "—"}</span>,
        },
        {
            key: "anneeObtention",
            title: "Année d'Obtention",
            render: (item) => <span className="whitespace-nowrap text-gray-500">{item.anneeObtention ?? "—"}</span>,
        },
        {
            key: "mention",
            title: "Mention",
            render: (item) => <span className="whitespace-nowrap text-gray-500">{item.mention || "—"}</span>,
        },
        {
            key: "dateDelivrance",
            title: "Date de Délivrance",
            render: (item) => (
                <span className="whitespace-nowrap text-gray-500">
                    {item.dateDelivrance ? new Date(item.dateDelivrance).toLocaleDateString() : "—"}
                </span>
            ),
        },
        {
            key: "modeRemise",
            title: "Mode de Remise",
            render: (item) => <span className="whitespace-nowrap text-gray-500">{item.modeRemise || "—"}</span>,
        },
        {
            key: "estValide",
            title: "Validé",
            render: (item) => <span className="whitespace-nowrap text-gray-500">{item.estValide ? "Oui" : "Non"}</span>,
        },
        {
            key: "commentaire",
            title: "Commentaire",
            render: (item) => <span className="whitespace-nowrap text-gray-500">{item.commentaire || "—"}</span>,
        },
        {
            key: "professeurs",
            title: "Professeurs",
            render: (item) =>
                <span className="whitespace-nowrap text-gray-500">
                    {item.enseignants?.map(e => `${e.user?.prenom} ${e.user?.nom}`).join(", ") || "—"}
                </span>,
        },
        {
            key: "student",
            title: "Étudiant",
            render: (item) =>
                <span className="whitespace-nowrap text-gray-500">
                    {item.student ? `${item.student.prenom} ${item.student.nom}` : "—"}
                </span>,
        },
       
        
      
    ];

    // Configuration d'import
    const importConfig: ImportConfig<Diplome> = {
        headers: ["NomDiplome",	"TypeDiplome",	"AnneeObtention",	"EstValide"	,"Mention",	"DateDelivrance"	,"SignatureAdmin",	"QrCodeUrl",	"Commentaire",	"ModeRemise"
],
        apiUrl: "http://localhost:8080/api/v1/admin/diplomes/import"
    };

    // Configuration d'export
    const exportConfig: ExportConfig<Diplome> = {
        filename: 'diplomes',
        apiUrl: 'http://localhost:8080/api/v1/admin/diplomes/export'
    };

    // Configuration des filtres
    const filters: FilterConfig[] = [
        {
            key: "typeDiplome",
            label: "Type de diplôme",
            options: Object.values(TypeDiplome).map(type => ({ 
                value: type, 
                label: type 
            }))
        },
        {
            key: "mention",
            label: "Mention",
            options: Object.values(Mention).map(mention => ({ 
                value: mention, 
                label: mention 
            }))
        },
        {
            key: "modeRemise",
            label: "Mode de remise",
            options: Object.values(ModeRemise).map(mode => ({ 
                value: mode, 
                label: mode 
            }))
        },
        {
            key: "estValide",
            label: "Statut validation",
            options: [
                { value: "true", label: "Validé" },
                { value: "false", label: "Non validé" }
            ]
        }
    ];

    // Gestion des actions
    const handleAdd = async (diplome: any) => {
        try {
            const res = await addDiplome(diplome);
            toast.success("Diplôme ajouté");
            await refreshDiplomes(); 
        } catch (err) {
            console.error("Erreur ajout:", err);
            toast.error("Erreur lors de l'ajout");
            throw err;
        }
    };

    const handleEdit = async (diplome: Diplome) => {
        try {
            const diplomeId = diplome.idDiplome || diplome.id;
            const res = await updateDiplome(diplomeId.toString(), diplome);
            toast.success("Diplôme mis à jour");
            await refreshDiplomes(); // <-- Ajout ici
        } catch (err) {
            console.error("Erreur update:", err);
            toast.error("Erreur lors de la mise à jour");
            throw err;
        }
    };

    const handleDelete = async (id: number | string) => {
        try {
            const idString = id.toString();
            await deleteDiplome(idString);
            toast.success("Diplôme supprimé");
            await refreshDiplomes(); // <-- Ajout ici
        } catch (err) {
            console.error("Erreur suppression:", err);
            toast.error("Erreur lors de la suppression");
            throw err;
        }
    };

    // Fonction pour obtenir l'ID d'une ligne
    const getRowId = (diplome: Diplome) => {
        // Utiliser idDiplome comme identifiant principal
        return diplome.idDiplome || diplome.id;
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
            <TableauDynamique<Diplome>
                data={diplomes}
                columns={colonnesDiplomes}
                getRowId={getRowId}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="Aucun diplôme trouvé"
                
                // Configuration import/export
                importConfig={importConfig}
                exportConfig={exportConfig}
                
                // Configuration des filtres
                filters={filters}
                
                // Composant de formulaire personnalisé
                formComponent={({ itemInitial, onSave, onCancel }) => (
                    <DiplomeForm
                        diplomeInitial={itemInitial}
                        onSave={onSave}
                        onCancel={onCancel}
                    />
                )}
                
                // Options d'affichage
                showActions={true}
                showSearch={true}
                showImportExport={true}
                showFilters={true}
                showAddButton={true}
            />
            
            {selectedDiplome && (
                <DiplomeCard
                    diplome={selectedDiplome}
                    onClose={() => setSelectedDiplome(null)}
                />
            )}
        </div>
    );
}