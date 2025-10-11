import { FaEdit, FaTrash, FaInfoCircle, FaTimes, FaPlus, FaFileExcel, FaFileExport, FaFileImport, FaFilter } from 'react-icons/fa';
import React, { useState, useMemo, useEffect } from 'react';
import { PaginationControls } from './Pagination';
import Button from './Button';
import { SearchBar } from './SearchBar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';

// Types génériques
export type Column<T> = {
  key: keyof T | string;
  title: string;
  render?: (item: T) => React.ReactNode;
};

export type ImportConfig<T> = {
  apiUrl?: string; 
  headers: string[];
};


export type ExportConfig<T> = {
  filename: string;
  apiUrl?: string; // URL de l'endpoint backend
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
// Remplacer l'ancienne handleImportExcel par celle-ci
const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    // Lire le fichier côté client (FileReader)
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        toast.error("Feuille non trouvée dans le fichier.");
        return;
      }

      // Lire toutes les lignes en tant que tableaux (header:1)
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (!rows || rows.length === 0) {
        toast.error("Fichier vide ou format non supporté.");
        return;
      }

      const providedHeaders: string[] = importConfig?.headers ?? [];

      // Normaliser la 1ere ligne pour comparaison
      const firstRow = rows[0].map((h: any) => String(h ?? '').trim().toLowerCase());

      // Détecte si la première ligne correspond aux headers fournis
      const headersMatch =
        providedHeaders.length > 0 &&
        providedHeaders.length <= firstRow.length &&
        providedHeaders.every((h, idx) => String(h ?? '').trim().toLowerCase() === firstRow[idx]);

      let headersToUse: string[] = [];

      if (providedHeaders.length > 0) {
        // cas : headers fournis dans importConfig
        headersToUse = providedHeaders;
      } else {
        // pas de headers fournis : on tente de dériver du fichier
        // si première ligne ressemble à des headers (texte non vide), on l'utilise
        const firstRowNonEmptyCount = firstRow.filter((c: string) => c !== '').length;
        if (firstRowNonEmptyCount >= 1 && rows.length > 1) {
          // utiliser la première ligne comme headers (pas de transformation)
          headersToUse = rows[0].map((h: any, i: number) => String(h ?? `col${i}`).trim());
        } else {
          // fallback : créer headers génériques selon le nombre max de colonnes
          const maxCols = Math.max(...rows.map(r => r.length));
          headersToUse = Array.from({ length: maxCols }, (_, i) => `col${i + 1}`);
        }
      }

      // Déterminer l'index de départ des données (si première ligne contient des en-têtes, la sauter)
      const startIndex = headersMatch || (providedHeaders.length === 0 && rows.length > 1 && headersToUse.every(h => h.toString().trim() !== '')) 
        ? 1 
        : 0;

      // Construire les objets à partir des lignes et des headersToUse
      const parsed: T[] = [];
      for (let r = startIndex; r < rows.length; r++) {
        const row = rows[r] || [];
        const obj: any = {};
        for (let c = 0; c < headersToUse.length; c++) {
          // Utiliser la valeur de la colonne ou '' si absent
          const val = row[c] ?? '';
          // garder la valeur brute (string/number), mais convertir null/undefined en ''
          obj[headersToUse[c]] = val;
        }
        // Optionnel : ignorer les lignes totalement vides
        const allEmpty = Object.values(obj).every(v => v === '' || v === null || v === undefined);
        if (!allEmpty) parsed.push(obj as T);
      }

      // Mise à jour de la preview et ouverture de la modale
      setPreviewData(parsed);
      setShowPreview(true);
      toast.success(`Fichier chargé : ${parsed.length} ligne(s) prêtes à prévisualiser.`);
      console.log("Données parsées pour la prévisualisation:", parsed);
    };

    // Lire en binaire pour XLSX
    reader.readAsBinaryString(file);
  } catch (err: any) {
    console.error("Erreur lors de la lecture du fichier:", err);
    toast.error("Erreur lors de la lecture du fichier Excel.");
  } finally {
    // réinitialiser valeur input pour permettre re-upload du même fichier
    if (e.target) e.target.value = '';
  }
  
};

const handleConfirmImport = async () => {
  if (!importConfig?.apiUrl || previewData.length === 0) {
    toast.error("Configuration d'import manquante ou aucune donnée à importer.");
    return;
  }

  try {
    const token = Cookies.get('token');
    if (!token) {
      toast.error("Token manquant. Veuillez vous reconnecter.");
      return;
    }

    // Convertir previewData en fichier Excel
    const ws = XLSX.utils.json_to_sheet(previewData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    const formData = new FormData();
    formData.append('file', file, 'import.xlsx');

    await axios.post(importConfig.apiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Fichier importé avec succès !");
    setShowPreview(false);
    setPreviewData([]);
    

    
  } catch (error) {
    console.error("Erreur lors de l'importation du fichier:", error);
    toast.error("Erreur lors de l'importation du fichier Excel.");
  }
};

  // Export Excel
  const handleExportExcel = async () => {
  if (!exportConfig || !exportConfig.apiUrl) return;

  try {
    // Récupérer le token depuis le cookie
    const token = Cookies.get('token');
    if (!token) {
      toast.error("Token manquant. Veuillez vous reconnecter.");
      return;
    }

    const response = await axios.get(exportConfig.apiUrl, {
      responseType: 'blob', // Important pour récupérer un fichier
      headers: {
        Authorization: `Bearer ${token}`, // Ajouter le token ici
      },
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    
    saveAs(blob, `${exportConfig.filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Exportation réussie !");
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de l'exportation !");
  }
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
    saveAs(blob, `Modele_${exportConfig?.filename}.xlsx`);
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
                  onClick={handleConfirmImport}
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