import { FaEdit, FaTrash, FaInfoCircle, FaTimes, FaPlus, FaFileExcel, FaFileExport, FaFileImport, FaFilter } from 'react-icons/fa';
import React, { useState, useMemo, useEffect } from 'react';
import { PaginationControls } from './Pagination';
import Button from './Button';
import { SearchBar } from './SearchBar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

// Types génériques
export type Column<T> = {
  key: keyof T | string;
  title: string;
  render?: (item: T) => React.ReactNode;
};

export type ImportConfig<T> = {
  headers: string[];
  mapper: (row: Record<string, any>) => T;
  validator?: (row: Record<string, any>, index: number) => string[];
};

export type ExportConfig<T> = {
  filename: string;
  mapper: (item: T) => Record<string, any>;
};

export type FilterConfig = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

type TableauDynamiqueProps<T> = {
  data: T[];
  columns: Column<T>[];
  getRowId?: (item: T) => string | number; // NOUVELLE PROPRIÉTÉ
  onEdit?: (item: T) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onAdd?: (item: T) => Promise<void> | void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  title?: string;
  
  // Configuration import/export
  importConfig?: ImportConfig<T>;
  exportConfig?: ExportConfig<T>;
  
  // Configuration des filtres
  filters?: FilterConfig[];
  
  // Composants personnalisés
  formComponent?: React.ComponentType<{
    itemInitial?: T;
    onSave: (item: T) => Promise<void>;
    onCancel: () => void;
  }>;
  
  // Options d'affichage
  showActions?: boolean;
  showSearch?: boolean;
  showImportExport?: boolean;
  showFilters?: boolean;
  showAddButton?: boolean;
};

function TableauDynamique<T>({
  data,
  columns,
  getRowId, // NOUVEAU: Fonction pour obtenir l'ID unique
  onEdit,
  onDelete,
  onAdd,
  onRowClick,
  emptyMessage = "Aucune donnée disponible",
  title,
  importConfig,
  exportConfig,
  filters = [],
  formComponent: FormComponent,
  showActions = true,
  showSearch = true,
  showImportExport = true,
  showFilters = true,
  showAddButton = true,
}: TableauDynamiqueProps<T>) {
  // États
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewData, setPreviewData] = useState<T[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [filtersVisible, setFiltersVisible] = useState(false);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Fonction pour obtenir l'ID unique d'un élément
  const getUniqueId = (item: T, index: number): string | number => {
    if (getRowId) {
      return getRowId(item);
    }
    
    // Fallback: chercher des propriétés d'ID communes
    const itemAny = item as any;
    if (itemAny.id) return itemAny.id;
    if (itemAny.idStudent) return itemAny.idStudent;
    if (itemAny.idUser) return itemAny.idUser;
    if (itemAny.userId) return itemAny.userId;
    if (itemAny.studentId) return itemAny.studentId;
    
    // Si aucun ID n'est trouvé, utiliser l'index comme fallback
    return `row-${index}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddForm) setShowAddForm(false);
      if (e.key === 'Escape' && editItem) setEditItem(null);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddForm, editItem]);

  // Import Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importConfig) return;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result;
      if (!result) return;

      const dataBuff = new Uint8Array(result as ArrayBuffer);
      const workbook = XLSX.read(dataBuff, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData.length) {
        toast.error("Le fichier est vide !");
        return;
      }

      const errors: string[] = [];
      const mappedData: T[] = [];

      jsonData.forEach((row, index) => {
        // Validation si configurée
        if (importConfig.validator) {
          const rowErrors = importConfig.validator(row, index);
          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
            return;
          }
        }

        mappedData.push(importConfig.mapper(row));
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
    if (!exportConfig) return;

    const exportData = data.map(exportConfig.mapper);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${exportConfig.filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Filtrage des données
  const filteredData = useMemo(() => {
    let result = data;

    // Filtre recherche texte
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(item =>
        Object.values(item as any)
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    // Filtres actifs
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => 
          String((item as any)[key] || '') === String(value)
        );
      }
    });

    return result;
  }, [data, searchTerm, activeFilters]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Gestion des actions
  const handleAddItem = async (item: T) => {
    try {
      if (onAdd) await onAdd(item);
      setShowAddForm(false);
      setCurrentPage(1);
      toast.success("Élément ajouté avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleEditItem = async (item: T) => {
    try {
      if (onEdit) await onEdit(item);
      setEditItem(null);
      toast.success("Élément modifié avec succès !");
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      if (onDelete) await onDelete(id.toString());
      toast.success("Élément supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Template Excel
  const downloadTemplate = () => {
    if (!importConfig) return;
    
    const ws = XLSX.utils.aoa_to_sheet([importConfig.headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Modele_Import.xlsx");
  };

  return (
    <div className="bg-white rounded-lg shadow relative mr-8">
      {/* Barre d'actions */}
      <div className="p-4 mb-8 mx-4">
        {title && <h2 className="text-xl font-bold text-[#0d68ae] mb-4">{title}</h2>}
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          {/* Barre de recherche */}
          {showSearch && (
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
          )}

          {/* Boutons d'action */}
          <div className="flex gap-2 flex-wrap ml-16">
            {showAddButton && onAdd && FormComponent && (
              <Button
                className="flex items-center gap-2 w-28"
                variant="outline"
                size="md"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus /> Ajouter
              </Button>
            )}

            {showImportExport && importConfig && (
              <>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={handleImportExcel}
                />
                <Button
                  className="flex items-center gap-2 w-28"
                  variant="outline"
                  size="md"
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <FaFileImport /> Importer
                </Button>
              </>
            )}

            {showImportExport && exportConfig && (
              <Button
                className="flex items-center gap-2 w-28"
                variant="outline"
                size="md"
                onClick={handleExportExcel}
              >
                <FaFileExport /> Exporter
              </Button>
            )}

            {showImportExport && importConfig && (
              <Button
                className="flex items-center gap-2 w-28"
                variant="outline"
                size="md"
                onClick={downloadTemplate}
              >
                <FaFileExcel /> Modèle
              </Button>
            )}

            {showFilters && filters.length > 0 && (
              <button
                type="button"
                onClick={() => setFiltersVisible(prev => !prev)}
                aria-pressed={filtersVisible}
                className={`ml-2 p-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0d68ae] ${
                  filtersVisible 
                    ? 'bg-[#A52A2A] text-white border-[#A52A2A]' 
                    : 'bg-white text-[#A52A2A] border-[#A52A2A] hover:bg-[#A52A2A] hover:text-white'
                }`}
                title="Filtres"
              >
                <FaFilter className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filtres */}
        {filtersVisible && filters.length > 0 && (
          <div className="flex items-center gap-3 mt-3 w-full p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-[#A52A2A] whitespace-nowrap">Filtrer par:</span>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {filters.map((filter) => (
                <div key={filter.key} className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">{filter.label}</label>
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => {
                      setActiveFilters(prev => ({
                        ...prev,
                        [filter.key]: e.target.value
                      }));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent"
                  >
                    <option value="">Tous</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              
              {/* Bouton pour effacer les filtres */}
              {Object.values(activeFilters).some(Boolean) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setActiveFilters({});
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-sm text-[#A52A2A] hover:text-white hover:bg-[#A52A2A] border border-[#A52A2A] rounded transition-colors duration-200"
                  >
                    Effacer les filtres
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modales pour formulaire d'ajout/édition */}
      {(showAddForm || editItem) && FormComponent && (
        <div className="fixed inset-0 z-50 overflow-hidden transition-opacity duration-300">
          <div
            className="absolute inset-0 bg-transparent transition-opacity duration-300"
            onClick={() => {
              setShowAddForm(false);
              setEditItem(null);
            }}
          ></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-2xl transform transition-transform duration-300 ease-in-out">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between px-6 py-4">
                  <h2 className="text-lg font-bold text-[#0d68ae]">
                    {editItem ? 'Modifier' : 'Ajouter'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditItem(null);
                    }}
                    className="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0d68ae]"
                    aria-label="Fermer"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <FormComponent
                    itemInitial={editItem || undefined}
                    onSave={editItem ? handleEditItem : handleAddItem}
                    onCancel={() => {
                      setShowAddForm(false);
                      setEditItem(null);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale de prévisualisation d'import */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                    {previewData.map((item, index) => {
                      const rowKey = getUniqueId(item, index);
                      return (
                        <tr key={rowKey} className="hover:bg-[#F5F5F5]">
                          {columns.map((column) => {
                            const cellKey = `${rowKey}-${column.key.toString()}`;
                            return (
                              <td 
                                key={cellKey}
                                className="px-2 py-2 text-[10px] text-gray-700 w-24 whitespace-nowrap truncate"
                              >
                                {column.render 
                                  ? column.render(item)
                                  : String((item as any)[column.key as keyof T] ?? '')
                                }
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewData([]);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      if (onAdd) {
                        for (const item of previewData) {
                          await onAdd(item);
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

      {/* Tableau principal */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 mx-4">
        <table className="min-w-max w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  className="px-2 py-2 text-left text-[10px] bg-[#A52A2A] text-white font-semibold tracking-wider whitespace-nowrap"
                >
                  {column.title}
                </th>
              ))}
              {showActions && (onEdit || onDelete) && (
                <th className="px-2 py-2 text-left text-[10px] font-semibold tracking-wider whitespace-nowrap bg-[#A52A2A] text-white">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => {
              const rowKey = getUniqueId(item, index);
              return (
                <tr key={rowKey} className="hover:bg-[#F5F5F5]">
                  {columns.map((column) => {
                    const cellKey = `${rowKey}-${column.key.toString()}`;
                    return (
                      <td
                        key={cellKey}
                        className="px-2 py-2 text-[10px] whitespace-nowrap truncate"
                      >
                        {column.render
                          ? column.render(item)
                          : String((item as any)[column.key as keyof T] ?? '')}
                      </td>
                    );
                  })}
                  {showActions && (onEdit || onDelete) && (
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => setEditItem(item)}
                            className="text-white transition-colors"
                            title="Modifier"
                          >
                            <FaEdit className="h-4 w-4 text-[#D4A017]" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(getUniqueId(item, index))}
                            className="text-white transition-colors"
                            title="Supprimer"
                          >
                            <FaTrash className="h-4 w-4 text-[#A52A2A]" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
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
}

export default TableauDynamique;