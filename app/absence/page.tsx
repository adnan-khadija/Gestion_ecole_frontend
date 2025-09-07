"use client";

export default function AbsencePage() {
    // Configuration spécifique aux étudiants
const studentImportConfig: ImportConfig<Etudiant> = {
  headers: ["ID", "Matricule", "Nom", "Prénom", /* ... */],
  mapper: (row) => ({
    id: row["ID"],
    matricule: row["Matricule"],
    nom: row["Nom"],
    prenom: row["Prénom"],
    // ...
  }),
  validator: (row, index) => {
    const errors = [];
    if (!row["Nom"]) errors.push(`Ligne ${index + 2}: Nom manquant`);
    if (!row["Prénom"]) errors.push(`Ligne ${index + 2}: Prénom manquant`);
    return errors;
  }
};

const studentExportConfig: ExportConfig<Etudiant> = {
  filename: "export_etudiants",
  mapper: (etu) => ({
    ID: etu.id,
    Matricule: etu.matricule,
    Nom: etu.nom,
    Prénom: etu.prenom,
    // ...
  })
};

const studentFilters: FilterConfig[] = [
  {
    key: "anneeAcademique",
    label: "Année académique",
    options: Array.from(new Set(data.map(e => e.anneeAcademique).filter(Boolean)))
      .map(annee => ({ value: annee, label: annee }))
  },
  {
    key: "formationActuelle",
    label: "Formation",
    options: formations.map(f => ({ value: f.id, label: f.nom }))
  }
];

// Utilisation
<TableauDynamique
  data={etudiants}
  columns={columnsEtudiants}
  onEdit={handleEditEtudiant}
  onDelete={handleDeleteEtudiant}
  onAdd={handleAddEtudiant}
  importConfig={studentImportConfig}
  exportConfig={studentExportConfig}
  filters={studentFilters}
  formComponent={EtudiantForm}
  title="Gestion des étudiants"
/>
    return (
        <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Gestion des Absences</h1>
        <p>Cette section est en cours de développement.</p>
        </div>
    );
    }   