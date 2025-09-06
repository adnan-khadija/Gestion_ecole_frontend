import { FaEdit, FaTrash, FaInfoCircle, FaTimes, FaPlus, FaFileExcel, FaFileExport, FaFileImport, FaFilter } from 'react-icons/fa';
import React, { useState, useMemo, useEffect } from 'react';
import { PaginationControls } from './Pagination';
import Button from './Button';
import FormationForm from './FormationForm';
import { Formation, ModeFormation ,Professeur} from '@/lib/types';
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

type TableauDynamiqueFormationProps = {
  data: Formation[];
  columns: Column<Formation>[];
  professeurs?: Professeur[];
  onEdit?: (item: Formation) => void;
  onDelete?: (id: number | string) => void;
  onAdd?: (formation: Formation) => void;
  emptyMessage?: string;
};

function TableauDynamiqueFormation({
  data,
  columns,
  professeurs=[],
  onEdit,
  onDelete,
  onAdd,
  emptyMessage = "Aucune formation disponible",
}: TableauDynamiqueFormationProps) {
  // États
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editFormation, setEditFormation] = useState<Formation | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewData, setPreviewData] = useState<Formation[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // filtres
  const [selectedStatut, setSelectedStatut] = useState<string>('');
  const[selectedMode, setSelectedMode] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const profById=useMemo(()=>{
    const map = new Map<number,Professeur>();
    professeurs.forEach(p=>map.set(p.id,p));
    return map;
  },[professeurs]);
  const formatProfesseursDisplay = (value: any) => {
  if (!value || !Array.isArray(value)) return '';
  
  const names = value.map(v => {
    // Si c'est un nombre (ID), on cherche dans la Map
    if (typeof v === 'number') {
      const prof = profById.get(v);
      return prof ? `${prof.prenom} ${prof.nom}` : `Professeur ${v}`;
    }
    // Si c'est un objet (au cas où), on extrait nom et prénom
    else if (typeof v === 'object' && v !== null) {
      return `${v.prenom || ''} ${v.nom || ''}`.trim();
    }
    return String(v);
  }).filter(Boolean);
  
  return names.join(', ') || 'Aucun professeur';
};
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddForm) setShowAddForm(false);
      if (e.key === 'Escape' && editFormation) setEditFormation(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddForm, editFormation]);

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

      const mappedData: Formation[] = [];
      const errors: string[] = [];

      jsonData.forEach((row, index) => {
        const id = row["ID"];
        const nom = row["Nom"];
        const duree = row["Durée"];
        const cout = row["Coût"];
        const modeFormation = row["Mode"];
        const anneeFormation = row["Année"];
        const estActive = row["Statut"] === "Active";
        const description = row["Description"];

        if (!id || !nom || !duree) {
          errors.push(`Ligne ${index + 2}: Champs obligatoires manquants`);
          return;
        }

        if (modeFormation && !Object.values(ModeFormation).includes(modeFormation)) {
          errors.push(`Ligne ${index + 2}: Mode de formation invalide`);
          return;
        }

        mappedData.push({
          id,
          nom,
          duree: Number(duree),
          cout: Number(cout),
          professeurs: [],
          emploiDuTempsId: null,
          description,
          anneeFormation: Number(anneeFormation),
          estActive,
          modeFormation,
          niveauAcces: "",
          capaciteMax: 0,
        });
      });

      if (errors.length > 0) {
        toast.error("Erreur(s) lors de l'import :\n" + errors.join("\n"));
        return;
      }

      setPreviewData(mappedData);
      setShowPreview(true);
    };

    reader.readAsArrayBuffer(file);
  };

  // Export Excel
  const handleExportExcel = () => {
    const exportData = data.map(f => ({
      ID: f.id,
      Nom: f.nom,
      Durée: f.duree,
      Coût: f.cout,
      Mode: f.modeFormation,
      Année: f.anneeFormation,
      Statut: f.estActive ? "Active" : "Désactivée",
      Description: f.description,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Formations');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `export_formations_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filteredData = useMemo(() => {
    let result = data;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(item =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    if (selectedStatut) {
      result = result.filter(item =>
        selectedStatut === "Active" ? item.estActive : !item.estActive
      );
    }
   if (selectedMode) {
  result = result.filter(item => {
    if (selectedMode === "Présentiel") return item.modeFormation === ModeFormation.PRESENTIEL;
    if (selectedMode === "En ligne") return item.modeFormation === ModeFormation.EN_LIGNE;
    if (selectedMode === "Hybride") return item.modeFormation === ModeFormation.HYBRIDE;
    return true; // au cas où selectedMode n'est pas reconnu
  });
}

    


    return result;
  }, [data, searchTerm, selectedStatut,selectedMode]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleAddFormation = async (formation: Formation) => {
    try {
      if (onAdd) await onAdd(formation);
      setShowAddForm(false);
      setCurrentPage(1);
      toast.success("Formation ajoutée !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'ajout de la formation");
    }
  };

  const handleEditFormation = async (formation: Formation) => {
    try {
      if (onEdit) await onEdit(formation);
      setEditFormation(null);
      toast.success("Formation modifiée !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      if (onDelete) await onDelete(id);
      toast.success("Formation supprimée !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Template Excel
  const downloadTemplate = () => {
    const headers = [
      "ID", "Nom", "Durée", "Coût", "Mode", "Année", "Statut", "Description"
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Formations");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Modele_Formations.xlsx");
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
            <Button className='flex items-center gap-2 w-28' onClick={() => setShowAddForm(true)} variant="green"><FaPlus /> Ajouter</Button>
            <input type="file" accept=".xlsx, .xls" id="fileInput" style={{ display: "none" }} onChange={handleImportExcel}/>
            <Button className='flex items-center gap-2 w-28' onClick={() => document.getElementById('fileInput')?.click()} variant="green"><FaFileImport /> Importer</Button>
            <Button className='flex items-center gap-2 w-28' onClick={handleExportExcel} variant="green"><FaFileExport /> Exporter</Button>
            <Button className='flex items-center gap-2 w-28' onClick={downloadTemplate} variant="green"><FaFileExcel /> Modèle</Button>
            <button onClick={() => setShowFilters(prev => !prev)} className="ml-2 p-2 rounded-md border text-[#0d68ae]">
              <FaFilter />
            </button>
          </div>
        </div>

       {/* Filtres */}
{showFilters && (
  <div className="flex items-center gap-2 ml-2">
    {/* Filtre Statut */}
    <select
      value={selectedStatut}
      onChange={(e) => setSelectedStatut(e.target.value)}
      className="border rounded px-2 py-1 text-sm"
    >
      <option value="">Tous les statuts</option>
      <option value="Active">Active</option>
      <option value="Désactivée">Désactivée</option>
    </select>

    {/* Filtre Mode de formation */}
    <select
      value={selectedMode}
      onChange={(e) => setSelectedMode(e.target.value)}
      className="border rounded px-2 py-1 text-sm"
    >
      <option value="">Tous les modes</option>
      <option value="Présentiel">Présentiel</option>
      <option value="En ligne">En ligne</option>
      <option value="Hybride">Hybride</option>
    </select>
  </div>
)}

      </div>

      {/* Modale d'ajout formation */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-hidden transition-opacity duration-300">
          <div className="absolute inset-0 bg-transparent transition-opacity duration-300" onClick={() => setShowAddForm(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-2xl transform transition-transform duration-300 ease-in-out">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between px-6 py-4">
                  <h2 className="text-lg font-bold text-[#0d68ae]">Ajouter une formation</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0d68ae]"
                    aria-label="Fermer"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <FormationForm onSave={handleAddFormation} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal édition */}
      {editFormation && (
        <div className="fixed inset-0 z-50 overflow-hidden transition-opacity duration-300">
          <div className="absolute inset-0 bg-transparent bg-opacity-30 transition-opacity duration-300" onClick={() => setEditFormation(null)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-2xl transform transition-transform duration-300 ease-in-out">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between px-6 py-4">
                  <h2 className="text-lg font-bold text-[#0d68ae]">Modifier la formation</h2>
                  <button
                    onClick={() => setEditFormation(null)}
                    className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0d68ae]"
                    aria-label="Fermer"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <FormationForm formationInitial={editFormation} onSave={handleEditFormation} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de prévisualisation d'importation */}
{showPreview && (
  <div className="fixed inset-0 z-50 bg-[#F5F5F5] bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-bold text-[#0d68ae]">Prévisualisation de l'importation</h2>
        <button
          onClick={() => {
            setShowPreview(false);
            setPreviewData([]);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-4 overflow-auto">
        <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column.key.toString()} 
                    className="px-2 py-2 text-left text-[10px] bg-[#A52A2A] text-white font-semibold tracking-wider w-24 whitespace-nowrap"
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((formation, index) => (
                <tr key={index} className="hover:bg-[#F5F5F5]">
                  {columns.map((column) => (
                    <td 
                      key={`${index}-${column.key.toString()}`} 
                      className="px-2 py-2 text-[10px] text-gray-700 w-24 whitespace-nowrap truncate"
                    >
                      {column.render ? (
                        column.render(formation)
                      ) : (
                        (column.key === 'professeurs' || column.key === 'professeursIds') 
                          ? formatProfesseursDisplay(formation.professeurs)
                          : String(formation[column.key as keyof Formation] ?? '')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="gray"
            onClick={() => {
              setShowPreview(false);
              setPreviewData([]);
            }}
          >
            Annuler
          </Button>
          <Button
            variant="green"
            onClick={async () => {
              try {
                for (const formation of previewData) {
                  if (onAdd) {
                    await onAdd(formation);
                  }
                }
                setShowPreview(false);
                setPreviewData([]);
                toast.success("Importation réussie !");
              } catch (error) {
                console.error(error);
                toast.error("Erreur lors de l'importation");
              }
            }}
          >
            Confirmer l'importation
          </Button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 mx-4 mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              {columns.map((column) => (
                <th key={column.key.toString()} className="px-2 py-2 text-left text-[10px] bg-[#A52A2A] text-white font-semibold tracking-wider w-24 whitespace-nowrap" >{column.title}</th>
              ))}
              {(onEdit || onDelete) && <th className="px-2 py-2 text-left text-[10px] font-semibold tracking-wider w-24 whitespace-nowrap bg-[#A52A2A] text-white" >Actions</th>}
            </tr>
          </thead>
        <tbody>
    {paginatedData.map((formation) => (
      <tr key={formation.id} className="hover:bg-[#F5F5F5]">
        {columns.map((column) => (
          <td key={`${formation.id}-${column.key.toString()}`} className="px-2 py-2 text-[10px] text-gray-700 w-24 whitespace-nowrap truncate">
            {column.render ? (
              column.render(formation)
            ) : (
              // si colonne correspondant à professeurs -> format
              (column.key === 'professeurs' || column.key === 'professeursIds') 
                ? formatProfesseursDisplay(formation.professeurs)
                : String(formation[column.key as keyof Formation] ?? '')
            )}
          </td>
        ))}

                {(onEdit || onDelete) && (
                  <td className="px-2 py-2">
                    <div className="flex space-x-2">
                      {onEdit && <FaEdit className="cursor-pointer text-[#D4A017]" onClick={() => setEditFormation(formation)} />}
                      {onDelete && <FaTrash className="cursor-pointer text-[#A52A2A]" onClick={() => handleDelete(formation.id)} />}
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
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(e) => {
          setItemsPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}
        pageSizeOptions={[5, 10, 20, 50]}
      />

      {data.length === 0 && (
        <div className="text-center py-8">
          <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}

export default TableauDynamiqueFormation;
