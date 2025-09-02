import { FaEdit, FaTrash, FaInfoCircle, FaTimes, FaPlus, FaFileExcel, FaFileExport, FaFileImport, FaFilter } from 'react-icons/fa';
import React, { useState, useMemo, useEffect } from 'react';
import { PaginationControls } from './Pagination';
import Button from './Button';
import ProfesseurForm from './ProfesseurForm';
import { Professeur, StatutProfesseur } from '@/lib/types';
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

type TableauDynamiqueProfProps = {
  data: Professeur[];
  columns: Column<Professeur>[];
  onEdit?: (item: Professeur) => void;
  onDelete?: (id: number | string) => void;
  onAdd?: (prof: Professeur) => void;
  emptyMessage?: string;
};

function TableauDynamiqueProf({
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  emptyMessage = "Aucun professeur disponible",
}: TableauDynamiqueProfProps) {
  // États
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editProf, setEditProf] = useState<Professeur | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // filtres
  const [selectedStatut, setSelectedStatut] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddForm) {
        setShowAddForm(false);
      }
      if (e.key === 'Escape' && editProf) {
        setEditProf(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddForm, editProf]);

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

    const mappedData: Professeur[] = [];
    const errors: string[] = [];

    jsonData.forEach((row, index) => {
      const id = row["ID"];
      const nom = row["Nom"];
      const prenom = row["Prénom"];
      const email = row["Email"];
      const telephone = row["Téléphone"];
      const specialite = row["Spécialité"];
      const dateEmbauche = row["Date Embauche"];
      const statut = row["Statut"];
      const photo = row["Photo"];

      // Vérifications
      if (!id || !nom || !prenom || !email) {
        errors.push(`Ligne ${index + 2}: Champs obligatoires manquants`);
        return;
      }
      // Email valide
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Ligne ${index + 2}: Email invalide`);
        return;
      }
      // Statut valide
      if (statut && !Object.values(StatutProfesseur).includes(statut)) {
        errors.push(`Ligne ${index + 2}: Statut invalide`);
        return;
      }
      // Date valide
      const date = new Date(dateEmbauche);
      if (isNaN(date.getTime())) {
        errors.push(`Ligne ${index + 2}: Date Embauche invalide`);
        return;
      }

      mappedData.push({
        id,
        nom,
        prenom,
        email,
        telephone,
        specialite,
        dateEmbauche: dateEmbauche,
        statut: statut as StatutProfesseur,
        photo,
      });
    });

    if (errors.length > 0) {
      toast.error("Erreur(s) lors de l'import :\n" + errors.join("\n"));
      return;
    }

    // Affichage du preview pour confirmation
    setPreviewData(mappedData);
    setShowPreview(true);
  };

  reader.readAsArrayBuffer(file);
};


  // Export Excel
  const handleExportExcel = () => {
    const exportData = data.map(prof => ({
      ID: prof.id,
      Nom: prof.nom,
      Prénom: prof.prenom,
      Email: prof.email,
      Téléphone: prof.telephone,
      Spécialité: prof.specialite,
      "Date Embauche": prof.dateEmbauche,
      Statut: prof.statut,
      Photo: prof.photo,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Professeurs');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `export_professeurs_${new Date().toISOString().slice(0, 10)}.xlsx`);
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

    // Filtre statut
    if (selectedStatut) {
      result = result.filter(item => String(item.statut || '') === selectedStatut);
    }

    return result;
  }, [data, searchTerm, selectedStatut]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Ajout professeur
  const handleAddProf = async (prof: Professeur) => {
    try {
      if (onAdd) await onAdd(prof);
      setShowAddForm(false);
      setCurrentPage(1);
      toast.success("Professeur ajouté !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'ajout du professeur");
    }
  };

  // Édition
  const handleEditProf = async (prof: Professeur) => {
    try {
      if (onEdit) await onEdit(prof);
      setEditProf(null);
      toast.success("Professeur modifié !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la modification");
    }
  };

  // Suppression
  const handleDelete = async (id: number | string) => {
    try {
      if (onDelete) await onDelete(id);
      toast.success("Professeur supprimé !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Template Excel
  const downloadTemplate = () => {
    const headers = [
      "ID", "Nom", "Prénom", "Email", "Téléphone", "Spécialité", "Date Embauche", "Statut", "Photo"
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Professeurs");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Modele_Professeurs.xlsx");
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

          <div className="flex gap-2 flex-wrap ml-16">
            <Button className='flex items-center gap-2 w-28'  onClick={() => setShowAddForm(true)} variant="primary" ><FaPlus /> Ajouter</Button>
            <input type="file" accept=".xlsx, .xls" id="fileInput" style={{ display: "none" }} onChange={handleImportExcel}/>
            <Button className='flex items-center gap-2 w-28'  onClick={() => document.getElementById('fileInput')?.click()} variant="primary"><FaFileImport /> Importer</Button>
            <Button className='flex items-center gap-2 w-28'  onClick={handleExportExcel} variant="primary"><FaFileExport /> Exporter</Button>
            <Button className='flex items-center gap-2 w-28'  onClick={downloadTemplate} variant="primary"><FaFileExcel /> Modèle</Button>
            <button onClick={() => setShowFilters(prev => !prev)} className="ml-2 p-2 rounded-md border text-[#55b7f3]">
              <FaFilter />
            </button>
          </div>
          </div>

          {/* Filtres */}
          {showFilters && (
            <div className="flex items-center gap-2 ml-2">
              <select value={selectedStatut} onChange={(e) => setSelectedStatut(e.target.value)} className="border rounded px-2 py-1 text-sm">
                <option value="">Tous les statuts</option>
                {Object.values(StatutProfesseur).map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

     {/* Modale d'ajout professeur */}
{showAddForm && (
  <div className="fixed inset-0 z-50 overflow-hidden transition-opacity duration-300">
    <div
      className="absolute inset-0 bg-transparent transition-opacity duration-300"
      onClick={() => setShowAddForm(false)}
    ></div>
    <div className="absolute inset-y-0 right-0 max-w-full flex">
      <div className="relative w-screen max-w-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-bold text-[#0d68ae]">Ajouter un professeur</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0d68ae]"
              aria-label="Fermer"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
                        <div className="flex-1 overflow-y-auto p-4">
                  <ProfesseurForm onSave={handleAddProf} />
                </div>
        </div>
      </div>
    </div>
  </div>
)}


   {/* Modal édition */}
{editProf && (
  <div className="fixed inset-0 z-50 overflow-hidden transition-opacity duration-300">
    <div
      className="absolute inset-0 bg-transparent bg-opacity-30 transition-opacity duration-300"
      onClick={() => setEditProf(null)}
    ></div>
    <div className="absolute inset-y-0 right-0 max-w-full flex">
      <div className="relative w-screen max-w-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-bold text-[#0d68ae]">Modifier le professeur</h2>
            <button
              onClick={() => setEditProf(null)}
              className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0d68ae]"
              aria-label="Fermer"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Contenu formulaire */}
          <div className="flex-1 overflow-y-auto p-4">
            <ProfesseurForm
              professeurInitial={editProf} 
              onSave={handleEditProf}    
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
          <thead className="bg-white">
            <tr>
              {columns.map((column) => (
                <th key={column.key.toString()} className="px-2 py-2 text-left text-[10px] font-semibold tracking-wider w-24 whitespace-nowrap" style={{ color: '#0d68ae' }}>{column.title}</th>
              ))}
              {(onEdit || onDelete) && <th className="px-2 py-2 text-left text-[10px] font-semibold tracking-wider w-24 whitespace-nowrap" style={{ color: '#0d68ae' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((prof) => (
              <tr key={prof.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={`${prof.id}-${column.key.toString()}`}  className="px-2 py-2 text-[8px] text-gray-700 w-24 whitespace-nowrap truncate">
                    {column.render ? column.render(prof) : (prof[column.key as keyof Professeur] as React.ReactNode)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-2 py-2">
                    <div className="flex space-x-2">
                      {onEdit && <FaEdit className="cursor-pointer text-blue-600" onClick={() => setEditProf(prof)} />}
                      {onDelete && <FaTrash className="cursor-pointer text-red-600" onClick={() => handleDelete(prof.id)} />}
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

export default TableauDynamiqueProf;
