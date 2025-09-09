'use client';
import React, { useState, useEffect } from "react";
import TableauDynamique, { Column, ImportConfig, ExportConfig, FilterConfig } from "@/components/TableauDynamique";
import { Etudiant } from "@/lib/types";
import { getEtudiants, addEtudiant, updateEtudiant, deleteEtudiant } from "@/lib/services";
import toast from "react-hot-toast";
import EtudiantForm from "@/components/forms/EtudiantForm";
import StudentProfile from "@/components/cards/StudentProfile";
import { FaEye } from "react-icons/fa";
import { LoadingSpinner } from "@/components/Loading";

export default function EtudiantPage() {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);

  useEffect(() => {
    getEtudiants()
      .then((res) => {
        setEtudiants(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur récupération étudiants :", err);
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
        <span className="whitespace-nowrap text-gray-500">{item.matricule || "—"}</span>
      </div>
    ),
  },
  { key: "nom", title: "Nom", render: (item) => <span className="text-gray-500">{item.nom}</span> },
  { key: "prenom", title: "Prénom", render: (item) => <span className="text-gray-500">{item.prenom}</span> },
  {
    key: "dateNaissance",
    title: "Date Naissance",
    render: (item) => <span className="text-gray-500">{item.dateNaissance || "—"}</span>,
  },
  {
    key: "lieuNaissance",
    title: "Lieu Naissance",
    render: (item) => <span className="text-gray-500">{item.lieuNaissance || "—"}</span>,
  },
  {
    key: "sexe",
    title: "Sexe",
    render: (item) => <span className="text-gray-500">{item.sexe || "—"}</span>,
  },
  {
    key: "nationalite",
    title: "Nationalité",
    render: (item) => <span className="text-gray-500">{item.nationalite || "—"}</span>,
  },
  {
    key: "telephone",
    title: "Téléphone",
    render: (item) =>
      item.telephone ? (
        <a href={`tel:${item.telephone}`} className="text-[#0d68ae] hover:underline">
          {item.telephone}
        </a>
      ) : (
        <span className="text-gray-500">—</span>
      ),
  },
  {
    key: "email",
    title: "Email",
    render: (item) =>
      item.email ? (
        <a href={`mailto:${item.email}`} className="text-[#0d68ae] hover:underline">
          {item.email}
        </a>
      ) : (
        <span className="text-gray-500">—</span>
      ),
  },
  { key: "adresse", title: "Adresse", render: (item) => <span className="text-gray-500">{item.adresse || "—"}</span> },
  { key: "ville", title: "Ville", render: (item) => <span className="text-gray-500">{item.ville || "—"}</span> },
  {
    key: "formation",
    title: "Formation",
    render: (item) => <span className="text-gray-500">{item.formationActuelle?.nom || "—"}</span>,
  },
  { key: "niveau", title: "Niveau", render: (item) => <span className="text-gray-500">{item.niveauScolaire || "—"}</span> },
  { key: "groupe", title: "Groupe", render: (item) => <span className="text-gray-500">{item.groupeScolaire || "—"}</span> },
  { key: "anneeAcademique", title: "Année Académique", render: (item) => <span className="text-gray-500">{item.anneeAcademique || "—"}</span> },
  { key: "statut", title: "Statut", render: (item) => <span className="text-gray-500">{item.statut || "—"}</span> },
  { key: "nouvelEtudiant", title: "Nouvel Étudiant", render: (item) => <span className="text-gray-500">{item.nouvelEtudiant ? "Oui" : "Non"}</span> },
  { key: "nomTuteur", title: "Nom Tuteur", render: (item) => <span className="text-gray-500">{item.nomTuteur || "—"}</span> },
  { key: "contactTuteur", title: "Contact Tuteur", render: (item) => <span className="text-gray-500">{item.contactTuteur || "—"}</span> },
  { key: "situationFamiliale", title: "Situation Familiale", render: (item) => <span className="text-gray-500">{item.situationFamiliale || "—"}</span> },
  { key: "dateInscription", title: "Date Inscription", render: (item) => <span className="text-gray-500">{item.dateInscription || "—"}</span> },


    {key: "handicap", title: "Handicap", render: (item) => <span className="text-gray-500">{item.handicap ? "Oui" : "Non"}</span>},
    {key:"boursier", title: "Boursier", render: (item) => <span className="text-gray-500">{item.boursier ? "Oui" : "Non"}</span>},
    
  ];

  // Configuration import
  const importConfig: ImportConfig<Etudiant> = {
    headers: ["Nom", "Prénom", "Matricule", "Date Naissance", "Email", "Téléphone", "Formation", "Niveau", "Statut"],
    mapper: (row) => ({
      id: 0,
      nom: row["Nom"],
      prenom: row["Prénom"],
      matricule: row["Matricule"],
      dateNaissance: row["Date Naissance"],
      email: row["Email"],
      telephone: row["Téléphone"],
      formationActuelle: { nom: row["Formation"] },
      niveauScolaire: row["Niveau"],
      statut: row["Statut"] || "Inactif",
    } as Etudiant),
    validator: (row, index) => {
      const errors = [];
      if (!row["Nom"]) errors.push(`Ligne ${index + 2}: Nom manquant`);
      if (!row["Prénom"]) errors.push(`Ligne ${index + 2}: Prénom manquant`);
      if (!row["Matricule"]) errors.push(`Ligne ${index + 2}: Matricule manquant`);
      return errors;
    }
  };

  // Configuration export
  const exportConfig: ExportConfig<Etudiant> = {
    filename: "export_etudiants",
    mapper: (item) => ({
      "Nom": item.nom,
      "Prénom": item.prenom,
      "Matricule": item.matricule,
      "Date Naissance": item.dateNaissance,
      "Email": item.email,
      "Téléphone": item.telephone,
      "Formation": item.formationActuelle?.nom || "",
      "Niveau": item.niveauScolaire,
      "Statut": item.statut,
    })
  };

  // Filtres
  const filters: FilterConfig[] = [
    { key: "niveauScolaire", label: "Niveau", options: [{ value: "", label: "Tous" }, ...Array.from(new Set(etudiants.map(e => e.niveauScolaire))).map(n => ({ value: n, label: n }))] },
    { key: "statut", label: "Statut", options: [{ value: "", label: "Tous" }, { value: "Actif", label: "Actif" }, { value: "Inactif", label: "Inactif" }] },
  ];

  // Actions CRUD
  const handleAdd = async (etudiant: Etudiant) => {
    try {
      const res = await addEtudiant(etudiant);
      setEtudiants(prev => [...prev, res.data || etudiant]);
      toast.success("Étudiant ajouté");
    } catch (err) {
      console.error(err);
      toast.error("Erreur ajout étudiant");
      throw err;
    }
  };

  const handleEdit = async (etudiant: Etudiant) => {
    try {
      const res = await updateEtudiant(etudiant.id, etudiant);
      setEtudiants(prev => prev.map(e => (e.id === etudiant.id ? (res.data || etudiant) : e)));
      toast.success("Étudiant mis à jour");
    } catch (err) {
      console.error(err);
      toast.error("Erreur mise à jour");
      throw err;
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteEtudiant(id);
      setEtudiants(prev => prev.filter(e => e.id !== id));
      toast.success("Étudiant supprimé");
    } catch (err) {
      console.error(err);
      toast.error("Erreur suppression");
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
          <TableauDynamique<Etudiant>
            data={etudiants}
            columns={colonnesEtudiants}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={(item) => setSelectedEtudiant(item)}
            emptyMessage="Aucun étudiant trouvé"
            importConfig={importConfig}
            exportConfig={exportConfig}
            filters={filters}
            formComponent={({ itemInitial, onSave, onCancel }) => (
              <EtudiantForm
                etudiantInitial={itemInitial}
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

          {selectedEtudiant && (
            <StudentProfile
              etudiant={selectedEtudiant}
              onClose={() => setSelectedEtudiant(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
