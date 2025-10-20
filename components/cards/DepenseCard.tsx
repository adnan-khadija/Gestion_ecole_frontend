// components/cards/DepenseCard.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { DepenseResponse, StatutDepense, CategorieDepense } from '@/lib/types';
import { FiX, FiDownload, FiDollarSign, FiCalendar, FiTag, FiUser, FiBook } from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DepenseCardProps {
  depense: DepenseResponse;
  onClose: () => void;
}

const PRIMARY_COLOR = '#424444ff';
const SECONDARY_COLOR = '#ef130cff';
const BACKGROUND_COLOR = '#ccccccff';
const ACCENT_COLOR = '#8a8a19';

const getCategoryColor = (category: CategorieDepense) => {
  switch (category) {
    case CategorieDepense.SALAIRE_ENSEIGNANT:
      return '#e3f2fd';
    case CategorieDepense.SALAIRE_PERSONNEL:
      return '#e8f5e8';
    case CategorieDepense.FACTURE_ELECTRICITE:
      return '#fff3e0';
    case CategorieDepense.FACTURE_EAU:
      return '#e0f7fa';
    case CategorieDepense.FACTURE_INTERNET:
      return '#f3e5f5';
    case CategorieDepense.MATERIEL_PEDAGOGIQUE:
      return '#e8f5e8';
    case CategorieDepense.MATERIEL_INFORMATIQUE:
      return '#fce4ec';
    case CategorieDepense.MATERIEL_BUREAU:
      return '#fff3e0';
    case CategorieDepense.MAINTENANCE:
      return '#e8f5e8';
    case CategorieDepense.EVENEMENT:
      return '#f3e5f5';
    case CategorieDepense.FORMATION:
      return '#e0f2f1';
    case CategorieDepense.AUTRE:
      return '#f5f5f5';
    default:
      return '#f5f5f5';
  }
};

const getCategoryText = (category: CategorieDepense) => {
  switch (category) {
    case CategorieDepense.SALAIRE_ENSEIGNANT:
      return 'Salaire Enseignant';
    case CategorieDepense.SALAIRE_PERSONNEL:
      return 'Salaire Personnel';
    case CategorieDepense.FACTURE_ELECTRICITE:
      return 'Facture Électricité';
    case CategorieDepense.FACTURE_EAU:
      return 'Facture Eau';
    case CategorieDepense.FACTURE_INTERNET:
      return 'Facture Internet';
    case CategorieDepense.MATERIEL_PEDAGOGIQUE:
      return 'Matériel Pédagogique';
    case CategorieDepense.MATERIEL_INFORMATIQUE:
      return 'Matériel Informatique';
    case CategorieDepense.MATERIEL_BUREAU:
      return 'Matériel Bureau';
    case CategorieDepense.MAINTENANCE:
      return 'Maintenance';
    case CategorieDepense.EVENEMENT:
      return 'Événement';
    case CategorieDepense.FORMATION:
      return 'Formation';
    case CategorieDepense.AUTRE:
      return 'Autre';
    default:
      return category;
  }
};

const getStatusColor = (status: StatutDepense) => {
  switch (status) {
    case StatutDepense.EN_ATTENTE:
      return '#f59e0b';
    case StatutDepense.APPROUVEE:
      return '#3b82f6';
    case StatutDepense.REJETEE:
      return '#ef4444';
    case StatutDepense.PAYEE:
      return '#10b981';
    default:
      return '#6b7280';
  }
};

const getStatusText = (status: StatutDepense) => {
  switch (status) {
    case StatutDepense.EN_ATTENTE:
      return 'En attente';
    case StatutDepense.APPROUVEE:
      return 'Approuvée';
    case StatutDepense.REJETEE:
      return 'Rejetée';
    case StatutDepense.PAYEE:
      return 'Payée';
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount);
};

const DepenseCard: React.FC<DepenseCardProps> = ({ depense, onClose }) => {
  const [show, setShow] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300);
  };

  const generatePDF = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${depense.libelle}_depense.pdf`);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        ref={cardRef}
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ${
          show ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="rounded-t-2xl p-5 flex justify-between items-center sticky top-0 z-10"
          style={{ backgroundColor: "#838380ff" }}
        >
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FiX size={26} />
          </button>
          <h2 className="text-xl font-bold text-white text-center flex-1 mx-4">
            Détails de la Dépense
          </h2>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm"
            style={{
              backgroundColor: "#eb7c78ff",
              color: "#171717",
            }}
          >
            <FiDownload />
            PDF
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Section en-tête avec montant */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Informations principales */}
            <div className="flex-1 text-center md:text-left">
              <h1
                className="text-4xl font-extrabold mb-2 tracking-tight"
                style={{ color: PRIMARY_COLOR }}
              >
                {formatCurrency(depense.montant)}
              </h1>
              <p className="text-lg mb-4" style={{ color: SECONDARY_COLOR }}>
                {depense.libelle}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: getStatusColor(depense.statutDepense) + '20',
                    color: getStatusColor(depense.statutDepense)
                  }}
                >
                  {getStatusText(depense.statutDepense)}
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: getCategoryColor(depense.categorieDepense),
                    color: '#171717'
                  }}
                >
                  {getCategoryText(depense.categorieDepense)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  {depense.anneeAcademique}
                </span>
              </div>
            </div>

            {/* Numéro de dépense */}
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg shadow-md border-2" style={{ borderColor: SECONDARY_COLOR }}>
                <div className="text-center">
                  <FiDollarSign size={32} style={{ color: SECONDARY_COLOR }} className="mx-auto mb-2" />
                  <p className="text-sm font-bold" style={{ color: PRIMARY_COLOR }}>
                    Référence
                  </p>
                  <p className="text-lg font-mono font-bold mt-1" style={{ color: SECONDARY_COLOR }}>
                    {depense.numeroDepense}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de la dépense */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations principales */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: BACKGROUND_COLOR }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                Informations Principales
              </h3>
              <div className="space-y-3">
                <InfoRow 
                  label="Libellé" 
                  value={depense.libelle} 
                  icon={<FiDollarSign />}
                />
                <InfoRow 
                  label="Description" 
                  value={depense.description || 'Aucune description fournie'} 
                  icon={<FiBook />}
                />
                <InfoRow 
                  label="Catégorie" 
                  value={getCategoryText(depense.categorieDepense)} 
                  icon={<FiTag />}
                />
                <InfoRow 
                  label="Bénéficiaire" 
                  value={depense.beneficiaire} 
                  icon={<FiUser />}
                />
              </div>
            </div>

            {/* Colonne droite - Détails administratifs */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: BACKGROUND_COLOR }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                Détails Administratifs
              </h3>
              <div className="space-y-3">
                <InfoRow 
                  label="Statut" 
                  value={getStatusText(depense.statutDepense)} 
                  isStatus 
                  statusColor={getStatusColor(depense.statutDepense)}
                />
                <InfoRow 
                  label="Date de la dépense" 
                  value={formatDate(depense.dateDepense)} 
                  icon={<FiCalendar />}
                />
                <InfoRow 
                  label="Année académique" 
                  value={depense.anneeAcademique} 
                />
                {depense.numeroPiece && (
                  <InfoRow 
                    label="Numéro de pièce" 
                    value={depense.numeroPiece} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Enseignant */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: BACKGROUND_COLOR }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                <div className="flex items-center gap-2">
                  <FiUser />
                  Enseignant
                </div>
              </h3>
              <div className="space-y-3">
             
                {depense.enseignantName && (
                  <InfoRow 
                    label="Nom de l'enseignant" 
                    value={depense.enseignantName} 
                  />
                )}
              </div>
            </div>

            {/* Dates */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: BACKGROUND_COLOR }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                <div className="flex items-center gap-2">
                  <FiCalendar />
                  Historique
                </div>
              </h3>
              <div className="space-y-3">
                <InfoRow 
                  label="Créée le" 
                  value={formatDate(depense.createdAt)} 
                />
                <InfoRow 
                  label="Modifiée le" 
                  value={formatDate(depense.updatedAt)} 
                />
              </div>
            </div>
          </div>

          {/* Remarques */}
          {depense.remarques && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: BACKGROUND_COLOR }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                Remarques
              </h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm" style={{ color: "#171717" }}>
                  {depense.remarques}
                </p>
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              title="Montant" 
              value={formatCurrency(depense.montant)} 
              color={SECONDARY_COLOR}
            />
            <StatCard 
              title="Statut" 
              value={getStatusText(depense.statutDepense)} 
              color={getStatusColor(depense.statutDepense)}
            />
            <StatCard 
              title="Catégorie" 
              value={getCategoryText(depense.categorieDepense)} 
              color={PRIMARY_COLOR}
            />
            <StatCard 
              title="Année" 
              value={depense.anneeAcademique} 
              color={ACCENT_COLOR}
            />
          </div>

          {/* Informations techniques */}
          <div
            className="rounded-xl p-6 text-center"
            style={{ backgroundColor: "#f8f9fa", border: "2px dashed #ccccccff" }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: PRIMARY_COLOR }}>
              Informations Techniques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: ACCENT_COLOR }}>ID Dépense</p>
                <p className="text-xs font-mono" style={{ color: "#171717" }}>{depense.idDepense}</p>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: ACCENT_COLOR }}>Numéro Dépense</p>
                <p className="text-xs" style={{ color: "#171717" }}>{depense.numeroDepense}</p>
              </div>
            </div>
          </div>

          {/* Justificatif */}
          {depense.justificatifPath && (
            <div className="flex justify-center">
              <a
                href={depense.justificatifPath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg transition font-medium"
                style={{
                  backgroundColor: SECONDARY_COLOR,
                  color: "white",
                }}
              >
                <FiDownload />
                Télécharger le justificatif
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher une ligne d'information
interface InfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isStatus?: boolean;
  isCode?: boolean;
  statusColor?: string;
}

const InfoRow = ({ label, value, icon, isStatus = false, isCode = false, statusColor }: InfoRowProps) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-300">
      <div className="flex items-center gap-2">
        {icon && <span style={{ color: ACCENT_COLOR }}>{icon}</span>}
        <span className="font-semibold text-sm" style={{ color: ACCENT_COLOR }}>
          {label}:
        </span>
      </div>
      <span 
        className={`text-sm text-right ${isCode ? 'font-mono' : ''} ${
          isStatus ? "font-semibold" : ""
        }`}
        style={{ 
          color: isStatus ? statusColor : "#171717" 
        }}
      >
        {value}
      </span>
    </div>
  );
};

// Composant pour les cartes de statistiques
interface StatCardProps {
  title: string;
  value: string;
  color: string;
}

const StatCard = ({ title, value, color }: StatCardProps) => (
  <div className="bg-white rounded-lg p-4 shadow-md text-center">
    <div className="text-lg font-bold mb-1" style={{ color }}>
      {value}
    </div>
    <div className="text-sm font-medium text-gray-600">{title}</div>
  </div>
);

export default DepenseCard;