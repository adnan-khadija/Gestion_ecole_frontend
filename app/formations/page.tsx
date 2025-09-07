'use client';
import React from "react";
import TableauDynamiqueFormation from "@/components/TableFormation";
import { useState, useEffect } from "react";
import { Column } from "@/components/TableData";
import { Formation,Professeur } from "@/lib/types";
import { getFormations,getProfesseurs, addFormation, updateFormation, deleteFormation} from "@/lib/services";
import toast from "react-hot-toast";
import FormationCard from   "@/components/FormationCard";
import { FaEye } from "react-icons/fa";
import { LoadingSpinner } from "@/components/Loading";


export default function FormationPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const[professeurs,setProfesseurs]=useState<Professeur[]>([]);
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
        console.error("Erreur lors de la récupération des étudiants:", error);
        setLoading(false);
      });
  }, []);
  console.log(professeurs);
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
      title: "Professeurs",
      
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
      <span className="truncate max-w-xs text-gray-500">
        {item.description || "—"}
      </span>
    ),
  },
];



// Ajout
const handleAdd = async (formation: any) => {
  try {
    const res = await addFormation(formation); // attend la persistance côté serveur
    // si ton service renvoie la res.data
    setFormations(prev => [...prev, res.data || formation]);
    toast.success("Étudiant ajouté");
  } catch (err) {
    console.error("Erreur ajout:", err);
    toast.error("Erreur lors de l'ajout");
    throw err; // propager si Tableau attend l'erreur
  }
};

// Édition
const handleEdit = async (formation: Formation) => {
  try {
    const res = await updateFormation(formation.id, formation);
    setFormations(prev => prev.map(e => (e.id === formation.id ? (res.data || formation) : e)));
    toast.success("Étudiant mis à jour");
  } catch (err) {
    console.error("Erreur update:", err);
    toast.error("Erreur lors de la mise à jour");
    throw err;
  }
};

// Suppression
const handleDelete = async (id: number | string) => {
  try {
    await deleteFormation(id);
    setFormations(prev => prev.filter(e => e.id !== id));
    toast.success("Étudiant supprimé");
  } catch (err) {
    console.error("Erreur suppression:", err);
    toast.error("Erreur lors de la suppression");
    throw err;
  }
};


  const handleToggle = async (id: string | number, field: "boursier" | "handicap", value: boolean) => {
    try {
      await updateFormation(id, { [field]: value });
      setFormations(formations =>
        formations.map(e =>
          e.id === id ? { ...e, [field]: value } : e
        )
      );
    } catch (error) {
      console.error("Erreur lors de la modification :", error);
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
      {/* Tableau des étudiants */}
    
    <TableauDynamiqueFormation<Formation>
  data={formations}
  columns={colonnesFormations}
  professeurs={professeurs}  // passe ton state ici
  onAdd={handleAdd}
  onEdit={handleEdit}
  onDelete={handleDelete}
  actionsColor="blue"
  emptyMessage="Aucun formation trouvé"
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