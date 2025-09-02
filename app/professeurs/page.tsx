'use client';
import React, { useState, useEffect } from "react";
import TableauDynamiqueProf from "@/components/TableProfesseur";
import { Column } from "@/components/TableProfesseur";
import { Professeur } from "@/lib/types";
import { getProfesseurs, addProfesseur, updateProfesseur, deleteProfesseur } from "@/lib/services";
import toast from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { LoadingSpinner } from "@/components/Loading";
import ProfesseurProfile from "@/components/ProfesseurProfile";

export default function ProfesseursPage() {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProf, setSelectedProf] = useState<Professeur | null>(null);

  // Chargement initial
  useEffect(() => {
    getProfesseurs()
      .then((response) => {
        setProfesseurs(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des professeurs:", error);
        setLoading(false);
      });
  }, []);

// Colonnes du tableau pour Professeur
const colonnesProfesseurs: Column<Professeur>[] = [
  {
    key: "id",
    title: "ID",
    render: (item) => (
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProf(item);
          }}
          className="text-[#8a8a19] hover:text-gray-700 transition-colors"
          title="Voir les détails"
        >
          <FaEye className="h-4 w-4" />
        </button>
        <span className="whitespace-nowrap text-xs text-gray-500">{item.id}</span>
      </div>
    ),
  },
  {
    key: "nom",
    title: "Nom",
    render: (item) => (
      <span className="whitespace-nowrap text-xs text-gray-500">{item.nom}</span>
    ),
  },
  {
    key: "prenom",
    title: "Prénom",
    render: (item) => (
      <span className="whitespace-nowrap text-xs text-gray-500">{item.prenom}</span>
    ),
  },
  {
    key: "telephone",
    title: "Téléphone",
    render: (item) => (
      <span className="whitespace-nowrap text-xs text-gray-500">{item.telephone || "-"}</span>
    ),
  },
  {
    key: "email",
    title: "Email",
    render: (item) => (
      <span className="whitespace-nowrap text-xs text-gray-500">{item.email}</span>
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
      <span className="whitespace-nowrap text-xs text-gray-500">{item.statut || "-"}</span>
    ),
  },
  {
    key: "dateEmbauche",
    title: "Date d’embauche",
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
    key: "formations",
    title: "Formations",
    render: (item) => (
      <span className="whitespace-nowrap text-xs text-gray-500">
        {item.formations?.map(f => f.nom).join(", ") || "-"}
      </span>
    ),
  },
  {
    key: "diplomes",
    title: "Diplômes",
    render: (item) => (
      <span className="whitespace-nowrap text-xs text-gray-500">
        {item.diplomes?.map(d => d.nom).join(", ") || "-"}
      </span>
    ),
  },
  {
    key: "photo",
    title: "Photo",
    render: (item: Professeur) => (
      <div className="flex items-center gap-4">
        <img
          src={item.photo || "/images/logo.png"}
          alt="Photo"
          className="w-10 h-10 rounded-full"
        />
      </div>
    ),
  },
];


  // Ajout
  const handleAdd = async (prof: Professeur) => {
    try {
      const res = await addProfesseur(prof);
      setProfesseurs(prev => [...prev, res.data || prof]);
      toast.success("Professeur ajouté");
    } catch (err) {
      console.error("Erreur ajout:", err);
      toast.error("Erreur lors de l'ajout");
      throw err;
    }
  };

  // Édition
  const handleEdit = async (prof: Professeur) => {
    try {
      const res = await updateProfesseur(prof.id, prof);
      setProfesseurs(prev => prev.map(p => (p.id === prof.id ? (res.data || prof) : p)));
      toast.success("Professeur mis à jour");
    } catch (err) {
      console.error("Erreur update:", err);
      toast.error("Erreur lors de la mise à jour");
      throw err;
    }
  };

  // Suppression
  const handleDelete = async (id: number | string) => {
    try {
      await deleteProfesseur(id);
      setProfesseurs(prev => prev.filter(p => p.id !== id));
      toast.success("Professeur supprimé");
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
          {/* Tableau des professeurs */}
          <TableauDynamiqueProf
            data={professeurs}
            columns={colonnesProfesseurs}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="Aucun professeur trouvé"
          />

          {/* Profil du professeur (modal) */}
          {selectedProf && (
            <ProfesseurProfile
              professeur={selectedProf}
              onClose={() => setSelectedProf(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
