// components/cards/PaiementCard.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PaiementResponse, StatutPaiement, TypePaiement, ModePaiement } from '@/lib/types';
import { FiX, FiDownload, FiDollarSign, FiCalendar, FiUser, FiCreditCard, FiFileText } from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PaiementCardProps {
  paiement: PaiementResponse;
  onClose: () => void;
}

const PRIMARY_COLOR = '#424444ff';
const SECONDARY_COLOR = '#2e7d32';
const BACKGROUND_COLOR = '#ccccccff';
const ACCENT_COLOR = '#8a8a19';

const getTypeColor = (type: TypePaiement) => {
  switch (type) {
    case TypePaiement.FRAIS_SCOLARITE:
      return '#e8f5e8';
    case TypePaiement.FRAIS_INSCRIPTION:
      return '#e3f2fd';
    case TypePaiement.FRAIS_EXAMEN:
      return '#fff3e0';
    case TypePaiement.FRAIS_BIBLIOTHEQUE:
      return '#f3e5f5';
    case TypePaiement.FRAIS_TRANSPORT:
      return '#e0f7fa';
    case TypePaiement.FRAIS_HEBERGEMENT:
      return '#fce4ec';
    case TypePaiement.FRAIS_MATERIEL:
      return '#fff3e0';
    case TypePaiement.AUTRE:
      return '#f5f5f5';
    default:
      return '#f5f5f5';
  }
};

const getTypeText = (type: TypePaiement) => {
  switch (type) {
    case TypePaiement.FRAIS_SCOLARITE:
      return 'Frais de scolarité';
    case TypePaiement.FRAIS_INSCRIPTION:
      return 'Frais d\'inscription';
    case TypePaiement.FRAIS_EXAMEN:
      return 'Frais d\'examen';
    case TypePaiement.FRAIS_BIBLIOTHEQUE:
      return 'Frais de bibliothèque';
    case TypePaiement.FRAIS_TRANSPORT:
      return 'Frais de transport';
    case TypePaiement.FRAIS_HEBERGEMENT:
      return 'Frais d\'hébergement';
    case TypePaiement.FRAIS_MATERIEL:
      return 'Frais de matériel';
    case TypePaiement.AUTRE:
      return 'Autre';
    default:
      return type;
  }
};

const getStatusColor = (status: StatutPaiement) => {
  switch (status) {
    case StatutPaiement.EN_ATTENTE:
      return '#f59e0b';
    case StatutPaiement.VALIDE:
      return '#10b981';
    case StatutPaiement.ANNULE:
      return '#ef4444';
    case StatutPaiement.REMBOURSE:
      return '#3b82f6';
    default:
      return '#6b7280';
  }
};

const getStatusText = (status: StatutPaiement) => {
  switch (status) {
    case StatutPaiement.EN_ATTENTE:
      return 'En attente';
    case StatutPaiement.VALIDE:
      return 'Validé';
    case StatutPaiement.ANNULE:
      return 'Annulé';
    case StatutPaiement.REMBOURSE:
      return 'Remboursé';
    default:
      return status;
  }
};

const getModeText = (mode: ModePaiement) => {
  switch (mode) {
    case ModePaiement.ESPECES:
      return 'Espèces';
    case ModePaiement.CHEQUE:
      return 'Chèque';
    case ModePaiement.VIREMENT_BANCAIRE:
      return 'Virement bancaire';
    case ModePaiement.CARTE_BANCAIRE:
      return 'Carte bancaire';
    case ModePaiement.MENSUEL:
      return 'Mensuel';
    case ModePaiement.TRIMESTRIEL:
      return 'Trimestriel';
    case ModePaiement.ANNUEL:
      return 'Annuel';
    default:
      return mode;
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

const PaiementCard: React.FC<PaiementCardProps> = ({ paiement, onClose }) => {
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
      pdf.save(`${paiement.numeroPaiement}_paiement.pdf`);
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
            Détails du Paiement
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
                {formatCurrency(paiement.montant)}
              </h1>
              <p className="text-lg mb-4" style={{ color: SECONDARY_COLOR }}>
                {getTypeText(paiement.typePaiement)}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: getStatusColor(paiement.statutPaiement) + '20',
                    color: getStatusColor(paiement.statutPaiement)
                  }}
                >
                  {getStatusText(paiement.statutPaiement)}
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: getTypeColor(paiement.typePaiement),
                    color: '#171717'
                  }}
                >
                  {getTypeText(paiement.typePaiement)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  {paiement.anneeAcademique}
                </span>
              </div>
            </div>

            {/* Numéro de paiement */}
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg shadow-md border-2" style={{ borderColor: SECONDARY_COLOR }}>
                <div className="text-center">
                  <FiDollarSign size={32} style={{ color: SECONDARY_COLOR }} className="mx-auto mb-2" />
                  <p className="text-sm font-bold" style={{ color: PRIMARY_COLOR }}>
                    Référence
                  </p>
                  <p className="text-lg font-mono font-bold mt-1" style={{ color: SECONDARY_COLOR }}>
                    {paiement.numeroPaiement}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations du paiement */}
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
                  label="Type de paiement" 
                  value={getTypeText(paiement.typePaiement)} 
                  icon={<FiDollarSign />}
                />
                <InfoRow 
                  label="Mode de paiement" 
                  value={getModeText(paiement.modePaiement)} 
                  icon={<FiCreditCard />}
                />
                <InfoRow 
                  label="Statut" 
                  value={getStatusText(paiement.statutPaiement)} 
                  isStatus 
                  statusColor={getStatusColor(paiement.statutPaiement)}
                />
                <InfoRow 
                  label="Année académique" 
                  value={paiement.anneeAcademique} 
                  icon={<FiCalendar />}
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
                  label="Date de paiement" 
                  value={formatDate(paiement.datePaiement)} 
                  icon={<FiCalendar />}
                />
                {paiement.referenceTransaction && (
                  <InfoRow 
                    label="Référence transaction" 
                    value={paiement.referenceTransaction} 
                    isCode
                  />
                )}
                {paiement.description && (
                  <InfoRow 
                    label="Description" 
                    value={paiement.description} 
                    icon={<FiFileText />}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Étudiant */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: BACKGROUND_COLOR }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                <div className="flex items-center gap-2">
                  <FiUser />
                  Étudiant
                </div>
              </h3>
              <div className="space-y-3">
                <InfoRow 
                  label="Nom complet" 
                  value={paiement.studentName} 
                />
                <InfoRow 
                  label="Matricule" 
                  value={paiement.studentMatricule} 
                  isCode
                />
                <InfoRow 
                  label="ID Étudiant" 
                  value={paiement.studentId} 
                  isCode
                />
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
                  label="Créé le" 
                  value={formatDate(paiement.createdAt)} 
                />
                <InfoRow 
                  label="Modifié le" 
                  value={formatDate(paiement.updatedAt)} 
                />
                {paiement.annule && paiement.dateAnnulation && (
                  <InfoRow 
                    label="Annulé le" 
                    value={formatDate(paiement.dateAnnulation)} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Remarques et informations d'annulation */}
          {paiement.remarques && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: BACKGROUND_COLOR }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>
                Remarques
              </h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm" style={{ color: "#171717" }}>
                  {paiement.remarques}
                </p>
              </div>
            </div>
          )}

          {paiement.annule && paiement.motifAnnulation && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#fee2e2" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#dc2626" }}>
                Motif d'annulation
              </h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm" style={{ color: "#171717" }}>
                  {paiement.motifAnnulation}
                </p>
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              title="Montant" 
              value={formatCurrency(paiement.montant)} 
              color={SECONDARY_COLOR}
            />
            <StatCard 
              title="Statut" 
              value={getStatusText(paiement.statutPaiement)} 
              color={getStatusColor(paiement.statutPaiement)}
            />
            <StatCard 
              title="Type" 
              value={getTypeText(paiement.typePaiement)} 
              color={PRIMARY_COLOR}
            />
            <StatCard 
              title="Année" 
              value={paiement.anneeAcademique} 
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
                <p className="text-sm font-semibold" style={{ color: ACCENT_COLOR }}>ID Paiement</p>
                <p className="text-xs font-mono" style={{ color: "#171717" }}>{paiement.idPaiement}</p>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: ACCENT_COLOR }}>Numéro Paiement</p>
                <p className="text-xs" style={{ color: "#171717" }}>{paiement.numeroPaiement}</p>
              </div>
            </div>
          </div>

          {/* Reçu PDF */}
          {paiement.recuPdfPath && (
            <div className="flex justify-center">
              <a
                href={paiement.recuPdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg transition font-medium"
                style={{
                  backgroundColor: SECONDARY_COLOR,
                  color: "white",
                }}
              >
                <FiDownload />
                Télécharger le reçu PDF
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

export default PaiementCard;