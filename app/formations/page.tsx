'use client';
import React from "react";
import TableauDynamique, { Column, ImportConfig, ExportConfig, FilterConfig } from "@/components/TableauDynamique";
import { useState, useEffect } from "react";
import { Formation, Enseignant, ModeFormation } from "@/lib/types";
import toast from "react-hot-toast";
import  {fetchFormations, addFormation,updateFormation,deleteFormation} from "@/lib/formation";
import { fetchEnseignants } from "@/lib/enseignant";
import FormationCard from "@/components/cards/FormationCard";
import { FaEye } from "react-icons/fa";
import { LoadingSpinner } from "@/components/Loading";
import FormationForm from "@/components/forms/FormationForm";

export default function FormationPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [professeurs, setEnseignants] = useState<Enseignant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

useEffect(() => {
  Promise.all([fetchFormations(), fetchEnseignants()])
    .then(([resFormations, resEnseignants]) => {
      setFormations(resFormations); // <-- pas resFormations.data
      setEnseignants(resEnseignants); // <-- pas resEnseignants.data
      setLoading(false);
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données:", error);
      setLoading(false);
    });
}, []);

  console.log("formation",fetchFormations);

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
        <span className="whitespace-nowrap text-gray-500">{item.cout}</span>
      ),
    },
    {
      key: "professeurs",
      title: "Enseignants",
      render: (item) => (
        <span className="whitespace-nowrap text-gray-500">
          {item.professeurs?.map(p => `${p.user.prenom} ${p.user.nom}`).join(", ") || "—"}
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

 // Configuration import
  const importConfig: ImportConfig<Formation> = {
   apiUrl: 'http://localhost:8080/api/v1/admin/formations/import',
    headers: [
      "ID",
     "Nom",
      "Durée",
      "Coût",
      "Professeurs",
      "Description",
      "Année",
      "ModeFormation",
      "AnnéeAcces",
      "CapacitéMax",
      "EstActive",
    ],
  };

  // Configuration export
  const exportConfig: ExportConfig<Formation> = {
  
    filename: 'formations',
    apiUrl: 'http://localhost:8080/api/v1/admin/formations/export',  
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
      refreshFormations();
      toast.success("Formation ajoutée");
    } catch (err) {
      console.error("Erreur ajout:", err);
      toast.error("Erreur lors de l'ajout");
      throw err;
    }
  };

  const handleEdit = async (formation: Formation) => {
    try {
      const res = await updateFormation(formation.idFormation, formation);
      setFormations(prev => prev.map(f => (f.idFormation === formation.idFormation ? (res.data || formation) : f)));
      refreshFormations(); 
      toast.success("Formation mise à jour");
    } catch (err) {
      console.error("Erreur update:", err);
      toast.error("Erreur lors de la mise à jour");
      throw err;
    }
  };

  const handleDelete = async (id:string) => {
    try {
      await deleteFormation(id);
      setFormations(prev => prev.filter(f => f.idFormation !== id));
      refreshFormations();
      toast.success("Formation supprimée");
    } catch (err) {
      console.error("Erreur suppression:", err);
      toast.error("Erreur lors de la suppression");
      throw err;
    }
  };

  const refreshFormations = async () => {
    const resFormations = await fetchFormations();
    setFormations(resFormations);
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
            getRowId={(formation) => formation.idFormation }
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