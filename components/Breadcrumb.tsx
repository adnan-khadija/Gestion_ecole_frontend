"use client";

import Link from "next/link";
import { FaChevronRight, FaHome } from "react-icons/fa";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const PRIMARY_BROWN = "#A52A2A";

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {/* Accueil */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-[#A52A2A] transition-colors"
      >
        <FaHome className="h-3 w-3" />
        <span>Accueil</span>
      </Link>
      
      {/* Séparateur */}
      <FaChevronRight className="h-3 w-3 text-gray-400" />
      
      {/* Items du breadcrumb */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {item.href && !item.active ? (
            <Link
              href={item.href}
              className="hover:text-[#A52A2A] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={`${
                item.active 
                  ? "text-[#A52A2A] font-semibold" 
                  : "text-gray-600"
              }`}
            >
              {item.label}
            </span>
          )}
          
          {/* Séparateur sauf pour le dernier */}
          {index < items.length - 1 && (
            <FaChevronRight className="h-3 w-3 text-gray-400" />
          )}
        </div>
      ))}
    </nav>
  );
}