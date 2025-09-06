export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  pageSizeOptions
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  pageSizeOptions: number[];
}) => {
  const visiblePages = 5; // Nombre de pages visibles autour de la page courante

  const getPageNumbers = () => {
    if (totalPages <= 1) return [];
    
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Éléments par page :</span>
        <select
          value={itemsPerPage}
          onChange={onItemsPerPageChange}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017]"
        >
          {pageSizeOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            currentPage === 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-[#D4A017] hover:bg-[#D4A017] hover:text-white transition-colors'
          }`}
          title="Première page"
        >
          <span>«</span>
          <span className="hidden sm:inline">Première</span>
        </button>

        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            currentPage === 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-[#D4A017] hover:bg-[#D4A017] hover:text-white transition-colors'
          }`}
          title="Page précédente"
        >
          <span>‹</span>
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md text-sm min-w-[2rem] ${
              currentPage === page 
                ? 'bg-[#D4A017] text-white font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            currentPage === totalPages || totalPages === 0 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-[#D4A017] hover:bg-[#D4A017] hover:text-white transition-colors'
          }`}
          title="Page suivante"
        >
          <span className="hidden sm:inline">Suivant</span>
          <span>›</span>
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            currentPage === totalPages || totalPages === 0 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-[#D4A017] hover:bg-[#D4A017] hover:text-white transition-colors'
          }`}
          title="Dernière page"
        >
          <span className="hidden sm:inline">Dernière</span>
          <span>»</span>
        </button>
      </div>

      <div className="text-sm text-gray-600">
        Page {currentPage} sur {totalPages || 1}
      </div>
    </div>
  );
};