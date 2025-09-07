'use client';
import React from "react";
import TableauDynamique from "@/components/TableData";
import { useState, useEffect } from "react";
import { Column } from "@/components/TableData";
import { Etudiant } from "@/lib/types";
import { getEtudiants, addEtudiant, updateEtudiant, deleteEtudiant } from "@/lib/services";
import toast from "react-hot-toast";
import { Switch } from "@headlessui/react";
import StudentProfile from "@/components/StudentProfile";
import { FaEye } from "react-icons/fa";
import { LoadingSpinner } from "@/components/Loading";

export default function Student() {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Etudiant | null>(null);

  useEffect(() => {
    getEtudiants()
      .then((response) => {
        setEtudiants(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des étudiants:", error);
        setLoading(false);
      });
  }, []);

  
const colonnesEtudiants: Column<Etudiant>[] = [
  {
    key: "matricule",
    title: "Matricule",
    render: (item) => (
      <div className="flex items-center gap-2">
         <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStudent(item);
          }}
          className="text-[#D4A017] hover:text-gray-700 transition-colors"
          title="Voir les détails"
        >
          <FaEye className="h-4 w-4" />
        </button>
        <span className="whitespace-nowrap text-gray-500">{item.matricule}</span>
       
      </div>
    ),
  },
  {
    key: "nom-prenom",
    title: "Nom | Prénom",
    render: (item) => (
      <span className="whitespace-nowrap text-gray-500">
        {item.nom} | {item.prenom}
      </span>
    ),
  },
  {
    key: "naissance-lieu",
    title: "Date Naissance | Lieu",
    render: (item) => (
      <span className="whitespace-nowrap text-gray-500">
        {item.dateNaissance} | {item.lieuNaissance}
      </span>
    ),
  },
  {
    key: "sexe-nationalite",
    title: "Sexe | Nationalité",
    render: (item) => (
      <span className="whitespace-nowrap text-gray-500">
        {item.sexe} | {item.nationalite}
      </span>
    ),
  },
  {
    key: "contact",
    title: "Téléphone | Email",
    render: (item) => (
      <span className="whitespace-nowrap text-gray-500">
        <a href={`tel:${item.telephone}`} className="text-[#0d68ae] hover:underline">
          {item.telephone}
        </a>{" | "}
        <a href={`mailto:${item.email}`} className="text-[#0d68ae] hover:underline">
          {item.email}
        </a>
      </span>
    ),
  },
  {
    key: "adresse-ville",
    title: "Adresse | Ville",
    render: (item) => (
      <span className="whitespace-nowrap text-gray-500">
        {item.adresse} | {item.ville}
      </span>
    ),
  },
  {
    key: "formation-niveau",
    title: "Formation | Niveau",
    render: (item) => (
      <span className="whitespace-nowrap text-gray-500">
        {item.formationActuelle?.nom || "—"} | {item.niveauScolaire}
      </span>
    ),
  
  },
  {
    key: "groupe-anneeAcademique",
    title: "Groupe | Année Académique",
    render: (item) => (
      <span className="whitespace-nowrap text-gray-500">
        {item.groupeScolaire} | {item.anneeAcademique}
      </span>
    ),
    
  
  },
  {
    key: "statut-nouvelEtudiant",
    title: "Statut | Nouvel Étudiant",
    render: (item) => (
      <span className="whitespace-nowrap text-gray-500">
        {item.statut} | {item.nouvelEtudiant ? "Oui" : "Non"}
      </span>
    ),
  },
  {
    key: "tuteur-contact",
    title: "Nom Tuteur | Contact",
    render: (item) => (
      <span className="whitespace-nowrap text-gray-500">
        {item.nomTuteur || "—"} | {item.contactTuteur || "—"}
      </span>
    ),
  },
  {
    key: "situation-dateInscription",
    title: "Situation Familiale | Date Inscription",
    render: (item) => (
      <span className="whitespace-nowrap text-gray-500">
        {item.situationFamiliale || "—"} | {item.dateInscription}
      </span>
    ),
  },

  {
    key:"boursier",
    title: "Boursier",
    render: (item) => (
      <Switch
        checked={item.boursier}
        onChange={() => handleToggle(item.id, "boursier", !item.boursier)}
        className={`${
          item.boursier ? "bg-[#F5DEB3]" : "bg-gray-300"
        } relative inline-flex h-6 w-11 items-center rounded-full`}
      >
        <span className="sr-only">Boursier</span>
        <span
          className={`${
            item.boursier ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
        />
      </Switch>
    ),
  },
  {
    key: "handicap",
    title: "Handicap",
    render: (item) => (
      <Switch
        checked={item.handicap}
        onChange={() => handleToggle(item.id, "handicap", !item.handicap)}
        className={`${
          item.handicap ? "bg-[#F5DEB3]" : "bg-gray-300"
        } relative inline-flex h-6 w-11 items-center rounded-full`}
      >
        <span className="sr-only">Handicap</span>
        <span
          className={`${
            item.handicap ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
        />
      </Switch>
    ),
  },

];



// Ajout
const handleAdd = async (etudiant: any) => {
  try {
    const res = await addEtudiant(etudiant); // attend la persistance côté serveur
    // si ton service renvoie la res.data
    setEtudiants(prev => [...prev, res.data || etudiant]);
    toast.success("Étudiant ajouté");
  } catch (err) {
    console.error("Erreur ajout:", err);
    toast.error("Erreur lors de l'ajout");
    throw err; // propager si Tableau attend l'erreur
  }
};

// Édition
const handleEdit = async (etudiant: Etudiant) => {
  try {
    const res = await updateEtudiant(etudiant.id, etudiant);
    setEtudiants(prev => prev.map(e => (e.id === etudiant.id ? (res.data || etudiant) : e)));
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
    await deleteEtudiant(id);
    setEtudiants(prev => prev.filter(e => e.id !== id));
    toast.success("Étudiant supprimé");
  } catch (err) {
    console.error("Erreur suppression:", err);
    toast.error("Erreur lors de la suppression");
    throw err;
  }
};


  const handleToggle = async (id: string | number, field: "boursier" | "handicap", value: boolean) => {
    try {
      await updateEtudiant(id, { [field]: value });
      setEtudiants(etudiants =>
        etudiants.map(e =>
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
    
      <TableauDynamique<Etudiant>
  data={etudiants}
  columns={colonnesEtudiants}
  onAdd={handleAdd}
  onEdit={handleEdit}
  onDelete={handleDelete}
  actionsColor="blue"
  emptyMessage="Aucun étudiant trouvé"
  onRowClick={(student) => setSelectedStudent(student)}
/>


      {/* Student profile modal */}
      {selectedStudent && (
        <StudentProfile
          etudiant={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
      </>
      )}
    </div>
  );
}