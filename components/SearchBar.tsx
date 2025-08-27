import { FaSearch, FaTimes } from 'react-icons/fa';
import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit: () => void; // Nouvelle prop pour le submit
  onReset: () => void;
  placeholder?: string;
  className?: string;
  showReset?: boolean;
}

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onReset,
  placeholder = 'Recherche...',
  className = '',
  showReset = true
}: SearchBarProps) => {
  return (
    <div className={`relative flex-1 min-w-[100px] ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        className="pl-10 pr-16 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-[#55b7f3]"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit()} 
      />
      <button
        onClick={onSearchSubmit}
        className="absolute inset-y-0 right-0 px-4 flex items-center bg-[#55b7f3] hover:bg-[#8ed1fc] text-white rounded-r-md transition-colors"
      >
        <FaSearch />
      </button>
      {showReset && searchTerm && (
        <button
          onClick={onReset}
          className="absolute inset-y-0 right-12 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};