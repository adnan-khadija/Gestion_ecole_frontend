"use client";
import React from "react";
import TableauDynamique from "@/components/TableauDynamique";
import { useState, useEffect } from "react";
import { Column, ExportConfig, FilterConfig, ImportConfig } from "@/components/TableauDynamique";
import { Diplome, MentionDiplome, ModeRemiseDiplome, TypeDiplome } from "@/lib/types";
import { getDiplomes, addDiplome, updateDiplome, deleteDiplome } from "@/lib/services";
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
        getDiplomes()
            .then((response) => {
                setDiplomes(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération des diplômes:", error);
                setLoading(false);
            });
    }, []);

    const colonnesDiplomes: Column<Diplome>[] = [
       
       {
  key: "nomDiplome",
  title: "Nom du Diplôme",
  render: (item) => (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation(); // empêche l'événement de row click
          // Ici tu peux ouvrir un modal ou un composant pour voir les détails
          setSelectedDiplome(item);
        }}
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
            key: "nomDiplome",
            title: "Nom du Diplôme",
            render: (item) => (
                <span className="whitespace-nowrap text-gray-500">{item.nomDiplome}</span>
            ),
        },
        {
            key: "niveau",
            title: "Niveau",
            render: (item) => (
                <span className="whitespace-nowrap text-gray-500">{item.niveau || "—"}</span>
            ),
        },
        {
            key: "anneeObtention",
            title: "Année d'Obtention",
            render: (item) => (
                <span className="whitespace-nowrap text-gray-500">{item.anneeObtention || "—"}</span>
            ),
        },
        {
            key: "mention",
            title: "Mention",
            render: (item) => (
                <span className="whitespace-nowrap text-gray-500">{item.mention || "—"}</span>
            ),
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
            render: (item) => (
                <span className="whitespace-nowrap text-gray-500">{item.modeRemise || "—"}</span>
            ),
        },
        {
            key: "estValide",
            title: "Validé",
            render: (item) => (
                <span className="whitespace-nowrap text-gray-500">
                    {item.estValide ? "Oui" : "Non"}
                </span>
            ),
        },
    ];

    // Configuration d'importation
    const importConfig: ImportConfig<Diplome> = {
        headers: [
            "ID", "Type de Diplôme", "Nom du Diplôme", "Niveau", "Année d'Obtention",
            "Mention", "Date de Délivrance", "Mode de Remise", "Validé", "Commentaire"
        ],
        mapper: (row) => ({
            id: row["ID"],
            typeDiplome: row["Type de Diplôme"] as TypeDiplome,
            nomDiplome: row["Nom du Diplôme"],
            niveau: row["Niveau"],
            anneeObtention: row["Année d'Obtention"],
            mention: row["Mention"] as MentionDiplome,
            dateDelivrance: row["Date de Délivrance"],
            modeRemise: row["Mode de Remise"] as ModeRemiseDiplome,
            estValide: row["Validé"] === "Oui",
            commentaire: row["Commentaire"],
            professeurs: [],
            etudiant: null,
            signatureAdmin: null,
            qrCode: "",
            fichierDiplome: ""
        }),
        validator: (row, index) => {
            const errors = [];
            if (!row["Nom du Diplôme"]) errors.push(`Ligne ${index + 2}: Nom du diplôme manquant`);
            if (!row["Type de Diplôme"]) errors.push(`Ligne ${index + 2}: Type de diplôme manquant`);
            return errors;
        }
    };

    // Configuration d'exportation
    const exportConfig: ExportConfig<Diplome> = {
        filename: "export_diplomes",
        mapper: (diplome) => ({
            ID: diplome.id,
            "Type de Diplôme": diplome.typeDiplome,
            "Nom du Diplôme": diplome.nomDiplome,
            "Niveau": diplome.niveau,
            "Année d'Obtention": diplome.anneeObtention,
            "Mention": diplome.mention,
            "Date de Délivrance": diplome.dateDelivrance,
            "Mode de Remise": diplome.modeRemise,
            "Validé": diplome.estValide ? "Oui" : "Non",
            "Commentaire": diplome.commentaire
        })
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
            options: Object.values(MentionDiplome).map(mention => ({ 
                value: mention, 
                label: mention 
            }))
        },
        {
            key: "modeRemise",
            label: "Mode de remise",
            options: Object.values(ModeRemiseDiplome).map(mode => ({ 
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
            setDiplomes(prev => [...prev, res.data || diplome]);
            toast.success("Diplôme ajouté");
        } catch (err) {
            console.error("Erreur ajout:", err);
            toast.error("Erreur lors de l'ajout");
            throw err;
        }
    };

    const handleEdit = async (diplome: Diplome) => {
        try {
            const res = await updateDiplome(diplome.id, diplome);
            setDiplomes(prev => prev.map(d => (d.id === diplome.id ? (res.data || diplome) : d)));
            toast.success("Diplôme mis à jour");
        } catch (err) {
            console.error("Erreur update:", err);
            toast.error("Erreur lors de la mise à jour");
            throw err;
        }
    };

    const handleDelete = async (id: number | string) => {
        try {
            await deleteDiplome(Number(id));
            setDiplomes(prev => prev.filter(d => d.id !== id));
            toast.success("Diplôme supprimé");
        } catch (err) {
            console.error("Erreur suppression:", err);
            toast.error("Erreur lors de la suppression");
            throw err;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-4">
            <TableauDynamique<Diplome>
                data={diplomes}
                columns={colonnesDiplomes}
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