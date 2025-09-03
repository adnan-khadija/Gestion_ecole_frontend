import { FaEdit, FaTrash, FaInfoCircle, FaTimes, FaPlus, FaFileExcel, FaFileExport, FaFileImport, FaFilter } from 'react-icons/fa';
import React, { useState, useMemo, useEffect } from 'react';
import { PaginationControls } from './Pagination';
import Button from './Button';
import EtudiantForm from './EtudiantForm';
import { Etudiant, Formation } from '@/lib/types';
import { getFormations } from '@/lib/services';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SearchBar } from './SearchBar';

// Types
export type Column<T> = {
  key: keyof T | string;
  title: string;

  render?: (item: T) => React.ReactNode;
};

type TableauDynamiqueProps<T> = {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: number | string) => void;
  onAdd?: (etudiant: any) => void;
  emptyMessage?: string;
  actionsColor?: 'indigo' | 'blue' | 'red' | 'green';
  formations?: any[];
  onRowClick?: (item: T) => void;
};

function TableauDynamique<T extends { id: number | string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  emptyMessage = "Aucune donnée disponible",
}: TableauDynamiqueProps<T>) {
  // États
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [editEtudiant, setEditEtudiant] = useState<Etudiant | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // filtres
  const [selectedAnnee, setSelectedAnnee] = useState<string>('');
  const [selectedFormation, setSelectedFormation] = useState<string>(''); // contient id (string) si possible
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    getFormations()
      .then(response => {
        setFormations(response.data || []);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des formations:", error);
      });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddForm) {
        setShowAddForm(false);
      }
      if (e.key === 'Escape' && editEtudiant) {
        setEditEtudiant(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddForm, editEtudiant]);

 

  // Import Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result;
      if (!result) return;
      const dataBuff = new Uint8Array(result as ArrayBuffer);
      const workbook = XLSX.read(dataBuff, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);
      if (!jsonData.length) {
        alert("Le fichier est vide !");
        return;
      }
      // Mapping des colonnes Excel vers les attributs de l'étudiant
      const mappedData = jsonData.map(row => ({
        id: row["ID"],
        matricule: row["Matricule"],
        nom: row["Nom"],
        prenom: row["Prénom"],
        dateNaissance: row["Date de Naissance"],
        lieuNaissance: row["Lieu de Naissance"],
        sexe: row["Sexe"],
        nationalite: row["Nationalité"],
        email: row["Email"],
        telephone: row["Téléphone"],
        adresse: row["Adresse"],
        ville: row["Ville"],
        situationFamiliale: row["Situation Familiale"],
        formationActuelle: { nom: row["Formation Actuelle"] },
        niveauScolaire: row["Niveau Scolaire"],
        groupeScolaire: row["Groupe Scolaire"],
        anneeAcademique: row["Année Académique"],
        statut: row["Statut"],
        dateInscription: row["Date Inscription"],
        boursier: row["Boursier"] === "Oui",
        handicap: row["Handicap"] === "Oui",
        nomTuteur: row["Nom Tuteur"],
        contactTuteur: row["Contact Tuteur"],
        photo: row["Photo"],
      }));
      setPreviewData(mappedData);
      setShowPreview(true);
    };
    reader.readAsArrayBuffer(file);
  };

  // Export Excel
  const handleExportExcel = () => {
    const exportData = data.map(item => {
      const etu = item as unknown as Etudiant;
      return {
        ID: etu.id,
        Matricule: etu.matricule,
        Nom: etu.nom,
        Prénom: etu.prenom,
        "Date de Naissance": etu.dateNaissance,
        "Lieu de Naissance": etu.lieuNaissance,
        Sexe: etu.sexe,
        Nationalité: etu.nationalite,
        Email: etu.email,
        Téléphone: etu.telephone,
        Adresse: etu.adresse,
        Ville: etu.ville,
        "Situation Familiale": etu.situationFamiliale,
        "Formation Actuelle": etu.formationActuelle?.nom,
        "Niveau Scolaire": etu.niveauScolaire,
        "Groupe Scolaire": etu.groupeScolaire,
        "Année Académique": etu.anneeAcademique,
        Statut: etu.statut,
        "Date Inscription": etu.dateInscription,
        Boursier: etu.boursier ? "Oui" : "Non",
        Handicap: etu.handicap ? "Oui" : "Non",
        "Nom Tuteur": etu.nomTuteur,
        "Contact Tuteur": etu.contactTuteur,
        Photo: etu.photo,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Etudiants');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `export_etudiants_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filteredData = useMemo(() => {
    let result = data;

    // Filtre recherche texte
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(item =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    // Filtre année académique
    if (selectedAnnee) {
      result = result.filter(item => String(item.anneeAcademique || '') === String(selectedAnnee));
    }

    // Filtre formation — compare par id si possible, sinon par nom/valeur
    if (selectedFormation) {
      result = result.filter((item: any) => {
        const form = item.formationActuelle;
        if (!form) return false;
        if (typeof form === 'object' && form.id != null) {
          return String(form.id) === String(selectedFormation);
        }
        // cas où formationActuelle est simplement une string (nom)
        return String(form).trim() === String(selectedFormation).trim();
      });
    }

    return result;
  }, [data, searchTerm, selectedAnnee, selectedFormation]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

 // Ajout étudiant — déléguer au parent via onAdd
const handleAddStudent = async (etudiant: any) => {
  try {
    if (onAdd) {
      // onAdd peut retourner la res.data; on attend pour permettre au parent de persister
      await onAdd(etudiant);
    }
    setShowAddForm(false);
    setCurrentPage(1);
    toast.success("Étudiant ajouté localement (parent mis à jour)");
  } catch (error) {
    console.error("Erreur lors de l'ajout via onAdd:", error);
    toast.error("Erreur lors de l'ajout de l'étudiant");
  }
};

// Édition — déléguer la mise à jour au parent via onEdit
const handleEditEtudiant = async (etudiant: Etudiant) => {
  try {
    if (onEdit) {
      await onEdit(etudiant);
    }
    setEditEtudiant(null);
    setCurrentPage(1);
    toast.success("Étudiant modifié (parent mis à jour)");
  } catch (error) {
    console.error("Erreur lors de la modification via onEdit:", error);
    toast.error("Erreur lors de la modification de l'étudiant");
  }
};

// Suppression — déléguer au parent via onDelete
const handleDelete = async (id: number | string) => {
  try {
    if (onDelete) {
      await onDelete(id);
    }
    setCurrentPage(1);
    toast.success("Étudiant supprimé (parent mis à jour)");
  } catch (error) {
    console.error("Erreur lors de la suppression via onDelete:", error);
    toast.error("Erreur lors de la suppression de l'étudiant");
  }
};


  // Template Excel
  const downloadTemplate = () => {
    const headers = [
      "ID",
      "Matricule",
      "Nom",
      "Prénom",
      "Date de Naissance",
      "Lieu de Naissance",
      "Sexe",
      "Nationalité",
      "Email",
      "Téléphone",
      "Adresse",
      "Ville",
      "Situation Familiale",
      "Formation Actuelle",
      "Niveau Scolaire",
      "Groupe Scolaire",
      "Année Académique",
      "Statut",
      "Date Inscription",
      "Boursier",
      "Handicap",
      "Nom Tuteur",
      "Contact Tuteur",
      "Photo"
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Etudiants");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Modele_Etudiants.xlsx");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(etudiant);
  };

  return (
    <div className="bg-white rounded-lg shadow relative">
      {/* Barre d'actions */}
      <div className="p-4 mb-8 mx-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SearchBar
              searchTerm={searchInput}
              onSearchChange={setSearchInput}
              onSearchSubmit={() => {
                setSearchTerm(searchInput);
                setCurrentPage(1);
              }}
              placeholder="Recherche..."
              className="w-full sm:w-106"
              showReset={!!searchInput}
              onReset={() => {
                setSearchInput('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-2 flex-wrap ml-16">
            <Button
              className="flex items-center gap-2 w-28"
              variant="green"
              size="md"
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus /> Ajouter
            </Button>
            <input
              type="file"
              accept=".xlsx, .xls"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleImportExcel}
            />
            <Button className="flex items-center gap-2 w-28"
              variant="green"
              size="md"
              onClick={() => document.getElementById('fileInput')?.click()}>
              <FaFileImport /> Importer
            </Button>
            <Button className="flex items-center gap-2 w-28"
              variant="green"
              size="md"
              onClick={handleExportExcel}>
              <FaFileExport /> Exporter
            </Button>
            <Button
              className="flex items-center gap-2 w-28"
              variant="green"
              size="md"
              onClick={downloadTemplate}
            >
              <FaFileExcel /> Modèle
            </Button>
               {/* Bouton filtre (toggle) */}
            <button
              type="button"
              onClick={() => setShowFilters(prev => !prev)}
              aria-pressed={showFilters}
              aria-label={showFilters ? "Masquer les filtres" : "Afficher les filtres"}
              className="ml-2 p-2 rounded-md border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0d68ae] text-[#0d68ae]"
              title="Filtres"
            >
              <FaFilter />
            </button>
          </div>
            {/* Filtres conditionnels (apparaissent à droite du SearchBar) */}
            {showFilters && (
              <div className="flex items-center gap-2 ml-2">
                <select
                  value={selectedAnnee}
                  onChange={(e) => {
                    setSelectedAnnee(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1 text-sm text-gray-700"
                >
                  <option value="">Toutes les années</option>
                  {Array.from(new Set(data.map((e: any) => e.anneeAcademique).filter(Boolean))).map(
                    (annee, i) => (
                      <option key={i} value={annee}>
                        {annee}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={selectedFormation}
                  onChange={(e) => {
                    setSelectedFormation(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1 text-sm text-gray-700"
                >
                  <option value="">Toutes les formations</option>
                  { (formations && formations.length)
                      ? formations.map((f) => (
                          <option key={String(f.id)} value={String(f.id)}>
                            {f.nom}
                          </option>
                        ))
                      : Array.from(new Set(data.map((e: any) => e.formationActuelle?.nom).filter(Boolean)))
                          .map((formation: string, i: number) => (
                            <option key={i} value={formation}>
                              {formation}
                            </option>
                          ))
                  }
                </select>
              </div>
            )}
        </div>
      </div>

      {/* Modale import preview */}
{showPreview && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{
      background: "rgba(13, 104, 174, 0.25)", // var(--bleu-foncé) avec transparence
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
    }}
  >
    <div
      className="bg-white rounded-lg p-6 max-w-6xl w-full shadow-lg"
      style={{
        boxShadow: "0 8px 32px 0 rgba(0, 208, 132, 0.15)", // var(--vivid-green-cyan) accent
        border: "1px solid var(--light-green-cyan)",
      }}
    >
      <h2 className="text-lg font-bold mb-4" style={{ color: "var(--bleu-foncé)" }}>
        Prévisualisation du fichier
      </h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 mx-4 mb-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              {previewData.length > 0 &&
                Object.keys(previewData[0]).map((key, i) => (
                  <th
                    key={i}
                    className="px-2 py-2 text-left text-[10px] font-semibold tracking-wider w-24 whitespace-nowrap"
                    style={{ color: "var(--bleu-foncé)" }}
                  >
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewData.map((row, i) => (
              <tr key={i} className="hover:bg-electric-grass-light">
                {Object.values(row).map((val, j) => (
                  <td
                    key={j}
                    className="px-2 py-2 text-[10px] text-gray-700 w-24 whitespace-nowrap truncate"
                  >
                    {typeof val === "object" && val !== null
                      ? JSON.stringify(val)
                      : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="secondary" size="sm" onClick={() => setShowPreview(false)}>
          Annuler
        </Button>
      <Button
  variant="primary"
  size="sm"
  onClick={async () => {
    try {
      if (onAdd) {
        for (const item of previewData) {
          await onAdd(item);
        }
      } else {
        // fallback si parent n'a pas fourni onAdd : poste directement à l'API
        for (const item of previewData) {
          await fetch("http://localhost:5000/etudiants", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          });
        }
      }
      toast.success("Données ajoutées avec succès !");
      setShowPreview(false);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'import des données.");
    }
  }}
>
  Confirmer l'import
</Button>

      </div>
    </div>
  </div>
)}

      {/* Modale d'ajout */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-hidden transition-opacity duration-300">
          <div
            className="absolute inset-0 bg-transparent transition-opacity duration-300"
            onClick={() => setShowAddForm(false)}
          ></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-2xl transform transition-transform duration-300 ease-in-out">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 ">
                  <h2 className="text-lg font-bold text-[#0d68ae]">Ajouter un étudiant</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0d68ae]"
                    aria-label="Fermer"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <EtudiantForm
                    onSave={handleAddStudent}
                    formations={formations}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'édition */}
      {editEtudiant && (
        <div className="fixed inset-0 z-50 overflow-hidden transition-opacity duration-300">
          <div
            className="absolute inset-0 bg-transparent  transition-opacity duration-300"
            onClick={() => setEditEtudiant(null)}
          ></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-2xl transform transition-transform duration-300 ease-in-out">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 ">
                  <h2 className="text-lg font-bold text-[#0d68ae]">Modifier l'étudiant</h2>
                  <button
                    onClick={() => setEditEtudiant(null)}
                    className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0d68ae]"
                    aria-label="Fermer"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <EtudiantForm
                    etudiantInitial={editEtudiant}
                    formations={formations}
                    onSave={handleEditEtudiant}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 mx-4 mb-8">
        <table className="min-w-full divide-y divide-gray-200">
         <thead style={{ backgroundColor: '#BC544B' }}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  className="px-2 py-2 text-left text-[10px] font-semibold tracking-wider w-24 whitespace-nowrap"
                  style={{
                    color: '#fffcfcff',
                  }}
                >
                  {column.title}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th
                  className="px-2 py-2 text-left text-[10px] font-semibold tracking-wider w-16 whitespace-nowrap"
                  style={{
                    color: '#95BA61',
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
    <tbody className="bg-gray-200 text-white divide-y divide-gray-600">
  {paginatedData.map((item) => (
    <tr key={item.id}>
      {columns.map((column) => (
        <td
          key={`${item.id}-${column.key.toString()}`}
          className="px-2 py-2 text-[10px] w-24 whitespace-nowrap truncate"
          onClick={() => {
            if (typeof (onRowClick as any) === 'function') (onRowClick as any)(item);
          }}
        >
          {column.render ? column.render(item) : (item[column.key as keyof T] as React.ReactNode)}
        </td>
      ))}
      {(onEdit || onDelete) && (
        <td className="px-2 py-2 whitespace-nowrap w-16">
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => setEditEtudiant(item as unknown as Etudiant)}
                className="text-white transition-colors"
                title="Modifier"
              >
                <FaEdit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => handleDelete(item.id)}
                className="text-white transition-colors"
                title="Supprimer"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  ))}
  </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(e) => {
          setItemsPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}
        pageSizeOptions={[5, 10, 20, 50]}
      />

      {/* Pied de tableau */}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 mx-4 mb-8">
        <div className="text-sm text-gray-500">
          {data.length} résultat(s)
        </div>
      </div>

      {/* Message si tableau vide */}
      {data.length === 0 && (
        <div className="text-center py-8">
          <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default TableauDynamique;
