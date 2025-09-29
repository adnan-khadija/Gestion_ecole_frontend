"use client";
import React, { useState, useEffect } from "react";
import TableauDynamique, { Column, ImportConfig, ExportConfig, FilterConfig } from "@/components/TableauDynamique";
import { Enseignant, StatutEnseignant, Utilisateur, UserResponse, Diplome, Module } from "@/lib/types";
import toast from "react-hot-toast";
import { fetchEnseignants, addEnseignant, deleteEnseignant, updateEnseignant } from "@/lib/enseignant";
import { FaEye } from "react-icons/fa";
import { deleteUser } from "@/lib/auth";
import { LoadingSpinner } from "@/components/Loading";
import { fetchDiplomes } from "@/lib/diplome";
import EnseignantProfile from "@/components/cards/EnseignantProfile";
import EnseignantMultiStepForm from "@/components/forms/ProfesseurForm";

export default function EnseignantsPage() {
  const [professeurs, setEnseignants] = useState<Enseignant[]>([]);
  const [diplomes, setDiplomes] = useState<Diplome[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProf, setSelectedProf] = useState<Enseignant | null>(null);

  // Chargement initial
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profsResponse, diplomeResponse] = await Promise.all([
          fetchEnseignants(),
          fetchDiplomes(),
        ]);
        setEnseignants(profsResponse);
        setDiplomes(diplomeResponse);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Colonnes du tableau pour Enseignant
  const colonnesEnseignants: Column<Enseignant>[] = [
    {
      key: "user.prenom",
      title: "Prénom",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProf(item);
            }}
            className="text-[#D4A017] hover:text-gray-700 transition-colors"
            title="Voir les détails"
          >
            <FaEye className="h-4 w-4" />
          </button>
          <span className="whitespace-nowrap text-gray-500">{item.user.prenom || "—"}</span>
        </div>
      ),
    },
    {
      key: "user.nom",
      title: "Nom",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-700">
          {item.user?.nom || "-"}
        </span>
      ),
    },
    {
      key: "user.email",
      title: "Email",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.user?.email || "-"}</span>
      ),
    },
    {
      key: "user.telephone",
      title: "Téléphone",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.user?.telephone || "-"}</span>
      ),
    },
    {
      key: "specialite",
      title: "Spécialité",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.specialite || "-"}</span>
      ),
    },
    {
      key: "statut",
      title: "Statut",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.statusEnseignant || "-"}</span>
      ),
    },
    {
      key: "dateEmbauche",
      title: "Date d'embauche",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.dateEmbauche || "-"}</span>
      ),
    },
    {
      key: "heuresTravail",
      title: "Heures Travail",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">{item.heuresTravail ?? "-"}</span>
      ),
    },
    {
      key: "diplomes",
      title: "Diplômes",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-gray-500">
          {item.diplomes?.map(d => d.nomDiplome).join(", ") || "-"}
        </span>
      )
    },
  ];

  // Configuration d'import
  const importConfig: ImportConfig<Enseignant> = {
    headers: [],
    apiUrl: ""
  };

  // Configuration d'export
  const exportConfig: ExportConfig<Enseignant> = {
    filename: 'professeurs',
    apiUrl: ''
  };

  // Configuration des filtres
  const professeurFilters: FilterConfig[] = [
    {
      key: 'statut',
      label: 'Statut',
      options: [
        { value: '', label: 'Tous' },
        ...Object.values(StatutEnseignant).map(statut => ({
          value: statut,
          label: statut
        }))
      ]
    },
    {
      key: 'specialite',
      label: 'Spécialité',
      options: [
        { value: '', label: 'Toutes' },
        ...Array.from(new Set(professeurs.map(p => p.specialite).filter(Boolean))).map(specialite => ({
          value: specialite as string,
          label: specialite as string
        }))
      ]
    }
  ];

  // CORRECTION : Fonction de rafraîchissement
  const refreshEnseignants = async () => {
    try {
      const profsResponse = await fetchEnseignants();
      setEnseignants(profsResponse);
    } catch (error) {
      console.error("Erreur rafraîchissement:", error);
      throw error;
    }
  };

  // Ajout
  const handleAdd = async (prof: Enseignant) => {
    try {
      await addEnseignant(prof);
      toast.success("Enseignant ajouté");
      await refreshEnseignants();
    } catch (err: any) {
      console.error("Erreur ajout:", err);
      toast.error(err.message || "Erreur lors de l'ajout");
      throw err;
    }
  };

  // Édition
  const handleEdit = async (prof: Enseignant) => {
    if (!prof.enseignantId) {
      toast.error("ID enseignant manquant !");
      return;
    }
    try {
      await updateEnseignant(prof.enseignantId, prof);
      toast.success("Enseignant mis à jour");
      await refreshEnseignants();
    } catch (err: any) {
      console.error("Erreur update:", err);
      toast.error(err.message || "Erreur lors de la mise à jour");
      throw err;
    }
  };

  // CORRECTION : Suppression améliorée
  const handleDelete = async (enseignantId: string | number) => {
    const idString = enseignantId.toString();
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet enseignant et son compte utilisateur ?")) {
      return;
    }

    try {
      console.log("Début suppression enseignant ID:", idString);

      // Trouver l'enseignant à supprimer
      const enseignantToDelete = professeurs.find(p => p.enseignantId === idString);
      if (!enseignantToDelete) {
        throw new Error("Enseignant non trouvé");
      }

      // Récupérer l'ID utilisateur
      const userId = enseignantToDelete.user?.id || enseignantToDelete.userId;
      if (!userId) {
        throw new Error("ID utilisateur non trouvé");
      }

      console.log("Suppression enseignant ID:", idString, "User ID:", userId);

      // CORRECTION : Supprimer d'abord l'enseignant
      await deleteEnseignant(idString);
      console.log("Enseignant supprimé avec succès");

      // Ensuite supprimer l'utilisateur
      await deleteUser(userId);
      console.log("Utilisateur supprimé avec succès");

      toast.success("Enseignant et utilisateur supprimés avec succès");
      
      // Mettre à jour l'état local
      if (selectedProf?.enseignantId === idString) {
        setSelectedProf(null);
      }
      
      // Rafraîchir la liste
      await refreshEnseignants();

    } catch (err: any) {
      console.error("Erreur détaillée suppression:", err);
      toast.error(err.message || "Erreur lors de la suppression");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Tableau des professeurs avec le composant TableauDynamique */}
      <TableauDynamique<Enseignant>
        data={professeurs}
        columns={colonnesEnseignants}
        getRowId={(item) => item.enseignantId || item.id || ""}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowClick={(prof) => setSelectedProf(prof)}
        emptyMessage="Aucun professeur trouvé"
        importConfig={importConfig}
        exportConfig={exportConfig}
        filters={professeurFilters}
        formComponent={({ itemInitial, onSave, onCancel }) => (
          <EnseignantMultiStepForm
            enseignantToEdit={itemInitial}
            userToEdit={itemInitial?.user}
            isEditing={!!itemInitial && !!itemInitial.enseignantId}
            onSave={onSave}
            onCancel={onCancel}
          />
        )}
        showActions={true}
        showSearch={true}
        showImportExport={true}
        showFilters={true}
        showAddButton={true}
      />

      {/* Profil du professeur (modal) */}
      {selectedProf && (
        <EnseignantProfile
          professeur={selectedProf}
          onClose={() => setSelectedProf(null)}
        />
      )}
    </div>
  );
}