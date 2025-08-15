import { FaEdit, FaTrash, FaInfoCircle, FaSearch, FaFilter, FaTimes, FaPlus, FaFileExcel, FaFileExport, FaFileImport } from 'react-icons/fa';
import React, { useState, useMemo, useEffect } from 'react';
import { PaginationControls } from './ Pagination';
import Button from './Button';
import { SearchBar } from './SearchBar';
import EtudiantForm from './EtudiantForm';
import { Etudiant, Formation } from '@/lib/types';
import { getFormations, updateEtudiant, deleteEtudiant } from '@/lib/etudiantService';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';



// Types
export type Column<T> = {
  key: keyof T | string;
  title: string;
  render?: (item: T) => React.ReactNode;
  filterType?: 'text' | 'select' | 'number' | 'date' | 'none';
  filterOptions?: { value: string; label: string }[];
  filterPlaceholder?: string;
};

type FilterConfig = {
  visibleFilters?: string[];
  showGlobalSearch?: boolean;
  searchPlaceholder?: string;
  defaultFiltersVisible?: boolean;
};

type TableauDynamiqueProps<T> = {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: number | string) => void;
  onAdd?: (etudiant: any) => void; // Ajout de la prop pour gérer l'ajout
  filterConfig?: FilterConfig;
  emptyMessage?: string;
  actionsColor?: 'indigo' | 'blue' | 'red' | 'green';
  formations?: any[]; // Ajout des formations pour le formulaire
   onRowClick?: (item: T) => void;
};

const TableauDynamique = <T extends { id: number | string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  filterConfig = {
    visibleFilters: [],
    showGlobalSearch: true,
    searchPlaceholder: 'Recherche globale...',
    defaultFiltersVisible: false
  },
  emptyMessage = "Aucune donnée disponible",

}: TableauDynamiqueProps<T>) => {
  // États
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(filterConfig.defaultFiltersVisible || false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [editEtudiant, setEditEtudiant] = useState<Etudiant | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Gestion de la touche Escape pour fermer la modale
  useEffect(() => {
    getFormations()
      .then(response => {
        setFormations(response.data);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des formations:", error);
      });
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddForm) {
        setShowAddForm(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddForm]);

  //Edit Etudiant 
  const handleEditEtudiant = (etudiant: Etudiant) => {
    if (editEtudiant) {
      updateEtudiant(etudiant)
        .then(() => {
          setEditEtudiant(null);
          setCurrentPage(1);
        })
        .catch(error => {
          console.error("Erreur lors de la mise à jour de l'étudiant:", error);
          toast.error("Erreur lors de la mise à jour de l'étudiant");
        });
    }
  };
  // Suppression d'un étudiant
  const handleDelete = (id: number | string) => {
    deleteEtudiant(id)
      .then(() => {
        toast.success("Étudiant supprimé avec succès");
        setCurrentPage(1); // Réinitialiser la page après suppression
      })
      .catch(error => {
        console.error("Erreur lors de la suppression de l'étudiant:", error);
        toast.error("Erreur lors de la suppression de l'étudiant");
      });
  };
  // Fonction pour importer un fichier Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result;
      if (!result) return;

      // Lire le fichier Excel
      const data = new Uint8Array(result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData.length) {
        alert("Le fichier est vide !");
        return;
      }

      // Map titres avec accents → clés sans accent
      const headerMap: Record<string, string> = {};
      columns.forEach(col => {
        const key = col.key as string;          // clé réelle (sans accent)
        const title = col.title;               // titre affiché (avec accent)
        headerMap[title.toLowerCase().trim()] = key;
      });

      // Récupérer les titres du fichier et normaliser
      const fileHeaders = Object.keys(jsonData[0]).map(h => h.toLowerCase().trim());

      // Vérifier si toutes les colonnes sont présentes
      const expectedHeaders = Object.keys(headerMap);
      const missingHeaders = expectedHeaders.filter(h => !fileHeaders.includes(h));
      const extraHeaders = fileHeaders.filter(h => !expectedHeaders.includes(h));

      if (missingHeaders.length > 0 || extraHeaders.length > 0) {
        alert(`Erreur : Les colonnes du fichier ne correspondent pas.\nManquantes : ${missingHeaders.join(", ")}\nSupplémentaires : ${extraHeaders.join(", ")}`);
        return;
      }

      // Transformer les données pour correspondre aux clés sans accent
      const mappedData = jsonData.map(row => {
        const newRow: Record<string, any> = {};
        Object.entries(row).forEach(([k, v]) => {
          const keyNormalized = k.toLowerCase().trim();
          const realKey = headerMap[keyNormalized];
          // IGNORER le champ 'id' du fichier Excel
          if (realKey && realKey !== 'id') {
            newRow[realKey] = v;
          }
        });
        return newRow;
      });

      // Prévisualisation avant import
      setPreviewData(mappedData);
      setShowPreview(true);
    };

    reader.readAsArrayBuffer(file);
  };

  // Fonction pour exporter les données en Excel
  const handleExportExcel = () => {
    // Convertir les données visibles (paginatedData) ou toutes les données filtrées
    const exportData = filteredData.map(item => {
      const obj: any = {};
      columns.forEach(col => {
        const key = col.key.toString();
        obj[col.title] = (item as any)[key];
      });
      return obj;
    });

    // Création de la feuille Excel
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');

    // Génération du fichier
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };


  // Filtrage des données
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Filtre global
      const matchesSearch = !filterConfig.showGlobalSearch || !searchTerm ||
        Object.values(item).some(
          val => val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Filtres par colonne
      const matchesColumnFilters = Object.entries(columnFilters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key as keyof T];
        return itemValue?.toString().toLowerCase().includes(value.toLowerCase());
      });

      return matchesSearch && matchesColumnFilters;
    });
  }, [data, searchTerm, columnFilters, filterConfig.showGlobalSearch]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Gestion des changements de filtre
  const handleFilterChange = (key: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };



  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const resetSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setColumnFilters({});
    setCurrentPage(1);
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setColumnFilters({});
  };

  // Colonnes visibles comme filtres
  const visibleFilterColumns = columns.filter(col =>
    (filterConfig.visibleFilters?.includes(col.key.toString()) ||
      (filterConfig.visibleFilters?.length === 0 && col.filterType !== 'none')) &&
    col.filterType !== 'none'
  );

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = searchTerm || Object.values(columnFilters).some(Boolean);

  // Gestion de l'ajout d'un étudiant
  const handleAddStudent = (etudiant: any) => {
    if (onAdd) {
      onAdd(etudiant);
    }
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow relative">
      {/* Barre de filtres */}
      
      <div className="p-4 mb-8 mx-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          {/* SearchBar */}
          {filterConfig.showGlobalSearch && (
            <SearchBar
              searchTerm={searchInput}
              onSearchChange={setSearchInput}
              onSearchSubmit={handleSearchSubmit}
              onReset={resetSearch}
              placeholder={filterConfig.searchPlaceholder}
              className="mr-4"
            />
          )}

          {/* Boutons */}
          <div className="flex gap-2 flex-wrap ml-16">
            <Button
              className="flex items-center gap-2 w-28"
              variant="primary"
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
              variant="primary"
              size="md"
              onClick={() => document.getElementById('fileInput')?.click()}>
              <FaFileImport /> Importer
            </Button>
            <Button className="flex items-center gap-2 w-28"
              variant="primary"
              size="md"
              onClick={handleExportExcel}>
              <FaFileExport /> Exporter
            </Button>
            {visibleFilterColumns.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${showFilters ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                <FaFilter className="mr-2" />
              </button>
            )}
          </div>
        </div>

        {/* Filtres avancés (toggle) */}
        {showFilters && visibleFilterColumns.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleFilterColumns.map(column => {
                const filterValue = columnFilters[column.key.toString()] || '';

                if (column.filterType === 'select' && column.filterOptions) {
                  return (
                    <div key={column.key.toString()}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {column.title}
                      </label>
                      <select
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={filterValue}
                        onChange={(e) => handleFilterChange(column.key.toString(), e.target.value)}
                      >
                        <option value="">Tous</option>
                        {column.filterOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={column.key.toString()}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {column.title}
                    </label>
                    <input
                      type={column.filterType === 'number' ? 'number' : 'text'}
                      placeholder={column.filterPlaceholder || `Filtrer ${column.title}...`}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={filterValue}
                      onChange={(e) => handleFilterChange(column.key.toString(), e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>


      {showPreview && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full  shadow-lg">
            <h2 className="text-lg font-bold mb-4">Prévisualisation du fichier</h2>
            <div className="overflow-x-auto max-h-64 border rounded">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {Object.keys(previewData[0] || {}).map((key, i) => (
                      <th key={i} className="border px-4 py-2 bg-gray-100">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="border px-4 py-2">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  try {
                    for (const item of previewData) {
                      await fetch('http://localhost:5000/etudiants', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(item),
                      });
                    }
                    alert('Données ajoutées avec succès!');
                    setShowPreview(false);
                  } catch (error) {
                    console.error(error);
                    alert('Erreur lors de l’ajout.');
                  }
                }}
              >
                Confirmer l’import
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
            <div className="relative w-screen max-w-xl transform transition-transform duration-300 ease-in-out">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 ">
                  <h2 className="text-xl font-bold text-[#0d68ae]">Ajouter un nouvel étudiant</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0d68ae]"
                    aria-label="Fermer"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
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
            <div className="relative w-screen max-w-xl transform transition-transform duration-300 ease-in-out">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 ">
                  <h2 className="text-xl font-bold text-[#0d68ae]">Modifier l'étudiant</h2>
                  <button
                    onClick={() => setEditEtudiant(null)}
                    className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0d68ae]"
                    aria-label="Fermer"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
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
          {/* En-tête du tableau */}
          <thead className="bg-white">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: '#0d68ae',

                  }}
                >
                  {column.title}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: '#0d68ae',

                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Corps du tableau */}
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={`${item.id}-${column.key.toString()}`}
                    className="px-6 py-4 text-sm text-gray-700"
                  >
                    {column.render ? column.render(item) : item[column.key as keyof T] as React.ReactNode}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => setEditEtudiant(item)}
                          className="text-[#0d68ae] hover:text-[#0274be] transition-colors"
                          title="Modifier"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-[#8A8A19] hover:text-[#6d6d14] transition-colors"
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
          {filteredData.length} résultat(s) sur {data.length}
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Réinitialiser tous les filtres
          </button>
        )}
      </div>

      {/* Message si tableau vide */}
      {filteredData.length === 0 && (
        <div className="text-center py-8">
          <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            {hasActiveFilters ? "Aucun résultat avec les filtres actuels" : emptyMessage}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TableauDynamique;