'use client';
import React from "react";
import TableauDynamique from "@/components/TableData";
import { useState, useEffect } from "react";
import { Column } from "@/components/TableData";
import { Etudiant } from "@/lib/types";
import { getEtudiants } from "@/lib/etudiantService";
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
    key: "id-matricule",
    title: "ID | Matricule",
    render: (item) => (
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-gray-500">{item.id}</span>
        {" | "}
        <span className="whitespace-nowrap text-gray-500">{item.matricule}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStudent(item);
          }}
          className="text-[#8a8a19] hover:text-gray-700 transition-colors"
          title="Voir les détails"
        >
          <FaEye className="h-4 w-4" />
        </button>
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
    key: "photo",
    title: "Photo ",
    render: (item: Etudiant) => (
      <div className="flex items-center gap-4">
        {/* Photo */}
        <img
          src={item.photo || "/images/logo.png"}
          alt="Photo"
          className="w-10 h-10 rounded-full"
        />

        
      </div>
    ),
  },
  {
    key:"boursier ",
    title: "Boursier",
    render: (item) => (
      <Switch
        checked={item.boursier}
        onChange={() => {}}
        className={`${
          item.boursier ? "bg-green-500" : "bg-gray-300"
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
        onChange={() => {}}
        className={`${
          item.handicap ? "bg-red-500" : "bg-gray-300"
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



  const handleEdit = <T extends { id: number | string }>(item: T) => {
    console.log('Modifier:', item);
  };

  const handleDelete = (id: number | string) => {
    console.log("Supprimer ID:", id);
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