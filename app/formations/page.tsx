'use client';
import React from "react";
import TableauDynamique, { Column, ImportConfig, ExportConfig, FilterConfig } from "@/components/TableauDynamique";
import { useState, useEffect } from "react";
import { Formation, Professeur, ModeFormation } from "@/lib/types";
import { getFormations, getProfesseurs, addFormation, updateFormation, deleteFormation } from "@/lib/services";
import toast from "react-hot-toast";
import FormationCard from "@/components/cards/FormationCard";
import { FaEye } from "react-icons/fa";
import { LoadingSpinner } from "@/components/Loading";
import FormationForm from "@/components/forms/FormationForm";

export default function FormationPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  useEffect(() => {
    Promise.all([getFormations(), getProfesseurs()])
      .then(([resFormations, resProfesseurs]) => {
        setFormations(resFormations.data);
        setProfesseurs(resProfesseurs.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données:", error);
        setLoading(false);
      });
  }, []);

  const colonnesFormations: Column<Formation>[] = [
    {
      key: "nom",
      title: "Nom Formation",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFormation(item);
            }}
            className="text-[#D4A017] hover:text-gray-700 transition-colors"
            title="Voir les détails"
          >
            <FaEye className="h-4 w-4" />
          </button>
          <span className="whitespace-nowrap text-gray-500">{item.nom}</span>
        </div>
      ),
    },
    {
      key: "duree",
      title: "Durée (mois)",
      render: (item) => (
        <span className="whitespace-nowrap text-gray-500">{item.duree}</span>
      ),
    },
    {
      key: "cout",
      title: "Coût (MAD)",
      render: (item) => (
        <span className="whitespace-nowrap text-gray-500">{item.cout.toLocaleString()}</span>
      ),
    },
    {
      key: "professeurs",
      title: "Professeurs",
      render: (item) => (
        <span className="whitespace-nowrap text-gray-500">
          {item.professeurs?.map(p => `${p.prenom} ${p.nom}`).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "modeFormation",
      title: "Mode",
      render: (item) => (
        <span className="whitespace-nowrap text-gray-500">{item.modeFormation || "—"}</span>
      ),
    },
    {
      key: "anneeFormation",
      title: "Année",
      render: (item) => (
        <span className="whitespace-nowrap text-gray-500">{item.anneeFormation || "—"}</span>
      ),
    },
    {
      key: "estActive",
      title: "Statut",
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            item.estActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {item.estActive ? "Active" : "Désactivée"}
        </span>
      ),
    },
    {
      key: "niveauAcces",
      title: "Niveau Accès",
      render: (item) => (
        <span className="whitespace-nowrap text-gray-500">{item.niveauAcces || "—"}</span>
      ),
    },
    {
      key: "capaciteMax",
      title: "Capacité Max",
      render: (item) => (
        <span className="whitespace-nowrap text-gray-500">{item.capaciteMax || "—"}</span>
      ),
    },
    {
      key: "description",
      title: "Description",
      render: (item) => (
        <span className="truncate max-w-xs text-gray-500" title={item.description || ""}>
          {item.description || "—"}
        </span>
      ),
    },
  ];

  // Configuration d'importation
  const importConfig: ImportConfig<Formation> = {
    headers: [
      "Nom", "Durée (mois)", "Coût (MAD)", "Mode de formation", "Année de formation",
      "Statut", "Niveau d'accès", "Capacité max", "Description", "Professeurs"
    ],
    mapper: (row) => {
      // Trouver les professeurs par nom
      const nomsProfesseurs = row["Professeurs"] ? row["Professeurs"].split(",") : [];
      const professeursFormation = professeurs.filter(p => 
        nomsProfesseurs.includes(`${p.prenom} ${p.nom}`)
      );

      return {
        id: 0, // Généré côté backend
        nom: row["Nom"],
        duree: parseInt(row["Durée (mois)"]) || 0,
        cout: parseFloat(row["Coût (MAD)"]) || 0,
        modeFormation: row["Mode de formation"] as ModeFormation,
        anneeFormation: row["Année de formation"],
        estActive: row["Statut"] === "Active",
        niveauAcces: row["Niveau d'accès"],
        capaciteMax: parseInt(row["Capacité max"]) || 0,
        description: row["Description"],
        professeurs: professeursFormation,
      } as Formation;
    },
    validator: (row, index) => {
      const errors = [];
      if (!row["Nom"]) errors.push(`Ligne ${index + 2}: Nom de la formation manquant`);
      if (!row["Durée (mois)"]) errors.push(`Ligne ${index + 2}: Durée manquante`);
      if (!row["Coût (MAD)"]) errors.push(`Ligne ${index + 2}: Coût manquant`);
      return errors;
    }
  };

  // Configuration d'exportation
  const exportConfig: ExportConfig<Formation> = {
    filename: "export_formations",
    mapper: (formation) => ({
      "Nom": formation.nom,
      "Durée (mois)": formation.duree,
      "Coût (MAD)": formation.cout,
      "Mode de formation": formation.modeFormation,
      "Année de formation": formation.anneeFormation,
      "Statut": formation.estActive ? "Active" : "Désactivée",
      "Niveau d'accès": formation.niveauAcces,
      "Capacité max": formation.capaciteMax,
      "Description": formation.description,
      "Professeurs": formation.professeurs?.map(p => `${p.prenom} ${p.nom}`).join(", ") || ""
    })
  };

  // Configuration des filtres
  const filters: FilterConfig[] = [
    {
      key: "modeFormation",
      label: "Mode de formation",
      options: [
        { value: "", label: "Tous" },
        ...Object.values(ModeFormation).map(mode => ({ 
          value: mode, 
          label: mode 
        }))
      ]
    },
    {
      key: "estActive",
      label: "Statut",
      options: [
        { value: "", label: "Tous" },
        { value: "true", label: "Active" },
        { value: "false", label: "Désactivée" }
      ]
    }
  ];

  // Gestion des actions
  const handleAdd = async (formation: Formation) => {
    try {
      const res = await addFormation(formation);
      setFormations(prev => [...prev, res.data || formation]);
      toast.success("Formation ajoutée");
    } catch (err) {
      console.error("Erreur ajout:", err);
      toast.error("Erreur lors de l'ajout");
      throw err;
    }
  };

  const handleEdit = async (formation: Formation) => {
    try {
      const res = await updateFormation(formation.id, formation);
      setFormations(prev => prev.map(f => (f.id === formation.id ? (res.data || formation) : f)));
      toast.success("Formation mise à jour");
    } catch (err) {
      console.error("Erreur update:", err);
      toast.error("Erreur lors de la mise à jour");
      throw err;
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteFormation(id);
      setFormations(prev => prev.filter(f => f.id !== id));
      toast.success("Formation supprimée");
    } catch (err) {
      console.error("Erreur suppression:", err);
      toast.error("Erreur lors de la suppression");
      throw err;
    }
  };

  

  return (
    <div className="container mx-auto p-4 space-y-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Tableau des formations avec le composant TableauDynamique */}
          <TableauDynamique<Formation>
            data={formations}
            columns={colonnesFormations}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={(formation) => setSelectedFormation(formation)}
            emptyMessage="Aucune formation trouvée"
            
            // Configuration import/export
            importConfig={importConfig}
            exportConfig={exportConfig}
            
            // Configuration des filtres
            filters={filters}
            
            // Composant de formulaire personnalisé
            formComponent={({ itemInitial, onSave, onCancel }) => (
                    <FormationForm
                        formationInitial={itemInitial}
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

          {/* Formation profile modal */}
          {selectedFormation && (
            <FormationCard
              formation={selectedFormation}
              onClose={() => setSelectedFormation(null)}
            />
          )}
        </>
      )}
    </div>
  );
}