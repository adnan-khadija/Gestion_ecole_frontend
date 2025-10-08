"use client";

import { Formation } from "@/lib/types";
import { FiX, FiDownload } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type FormationCardProps = {
  formation: Formation & { presenceToken?: string };
  onClose: () => void;
};

export default function FormationCard({ formation, onClose }: FormationCardProps) {
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
      try {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${formation.nom || 'formation'}.pdf`);
      } catch (error) {
        console.error("Erreur lors de la génération du PDF:", error);
      }
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non spécifié";
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return "Date invalide";
    }
  };

  // Fonction pour formater le coût
  const formatCout = (cout?: number) => {
    if (!cout) return "Gratuit";
    return `${cout.toLocaleString('fr-FR')} €`;
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
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ${
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
            Détails de la Formation
          </h2>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm hover:opacity-90"
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
          {/* Section en-tête sans image */}
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Statut */}
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              formation.estActive 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {formation.estActive ? "Active" : "Inactive"}
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <h1
                className="text-4xl font-extrabold mb-2 tracking-tight"
                style={{ color: "#424444ff" }}
              >
                {formation.nom}
              </h1>
              <p className="text-lg mb-4" style={{ color: "#ef130cff" }}>
                {formation.modeFormation}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {formation.niveauAcces && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                    {formation.niveauAcces}
                  </span>
                )}
                {formation.anneeFormation && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                    {formation.anneeFormation}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  Capacité: {formation.capaciteMax} places
                </span>
                {formation.cout && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                    {formatCout(formation.cout)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Informations de la formation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations principales */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Informations de la Formation
              </h3>
              <div className="space-y-3">
                <InfoRow label="Nom" value={formation.nom} />
                <InfoRow label="Mode de formation" value={formation.modeFormation} />
                <InfoRow label="Niveau d'accès" value={formation.niveauAcces} />
                <InfoRow label="Année de formation" value={formation.anneeFormation} />
                <InfoRow label="Coût" value={formatCout(formation.cout)} />
                <InfoRow 
                  label="Statut" 
                  value={formation.estActive ? "Active" : "Inactive"} 
                  isStatus 
                />
              </div>
            </div>

            {/* Colonne droite - Détails administratifs */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Détails Administratifs
              </h3>
              <div className="space-y-3">
                <InfoRow label="Capacité maximale" value={formation.capaciteMax?.toString()} />
                <InfoRow label="Durée" value={formation.duree} />
              
              
              </div>
            </div>
          </div>

          {/* Description */}
          {formation.description && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Description
              </h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm" style={{ color: "#171717" }}>
                  {formation.description}
                </p>
              </div>
            </div>
          )}

         

          {/* Professeurs */}
          {formation.professeurs && formation.professeurs.length > 0 && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Professeurs Associés
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formation.professeurs.map((prof, index) => (
                  <div key={prof.id || `prof-${index}`} className="bg-white rounded-lg p-3 shadow-sm">
                    <span className="font-semibold text-sm block mb-1" style={{ color: "#8a8a19" }}>
                      {prof.prenom} {prof.nom}
                    </span>
                    {prof.email && (
                      <span className="text-xs block" style={{ color: "#171717" }}>
                        <a 
                          href={`mailto:${prof.email}`} 
                          style={{ color: "#ef130cff" }} 
                          className="hover:underline"
                        >
                          {prof.email}
                        </a>
                      </span>
                    )}
                    {prof.specialite && (
                      <span className="text-xs text-gray-600 block mt-1">
                        {prof.specialite}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modules */}
          {formation.modules && formation.modules.length > 0 && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Modules de la Formation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formation.modules.map((module, index) => (
                  <div key={module.id || `module-${index}`} className="bg-white rounded-lg p-3 shadow-sm">
                    <span className="font-semibold text-sm block mb-1" style={{ color: "#8a8a19" }}>
                      {module.nom}
                    </span>
                    {module.description && (
                      <span className="text-xs block" style={{ color: "#171717" }}>
                        {module.description}
                      </span>
                    )}
                    {module.duree && (
                      <span className="text-xs text-gray-600 block mt-1">
                        Durée: {module.duree}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              title="Capacité" 
              value={formation.capaciteMax || 0} 
              color="#ef130cff"
            />
            <StatCard 
              title="Professeurs" 
              value={formation.professeurs?.length || 0} 
              color="#ccccccff"
            />
            <StatCard 
              title="Modules" 
              value={formation.modules?.length || 0} 
              color="#8a8a19"
            />
            <StatCard 
              title="Statut" 
              value={formation.estActive ? "Active" : "Inactive"} 
              color={formation.estActive ? "#8a8a19" : "#eb7c78ff"}
            />
          </div>

          {/* Informations complémentaires */}
          <div
            className="rounded-xl p-6 text-center"
            style={{ backgroundColor: "#f8f9fa", border: "2px dashed #ccccccff" }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: "#424444ff" }}>
              Informations Complémentaires
            </h3>
            <p className="text-sm" style={{ color: "#171717" }}>
              Pour plus d'informations sur cette formation, contactez l'administration.
            </p>
            {formation.id && (
              <p className="text-xs mt-2" style={{ color: "#838380ff" }}>
                ID de la formation: {formation.id}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour afficher une ligne d'information
interface InfoRowProps {
  label: string;
  value: string | undefined | null;
  isStatus?: boolean;
}

const InfoRow = ({ label, value, isStatus = false }: InfoRowProps) => {
  if (!value || value === "Non spécifié" || value === "null" || value === "undefined") return null;

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-300 last:border-b-0">
      <span className="font-semibold text-sm" style={{ color: "#8a8a19" }}>
        {label}:
      </span>
      <span 
        className={`text-sm text-right max-w-[60%] break-words ${
          isStatus ? "font-semibold" : ""
        }`}
        style={{ 
          color: isStatus 
            ? (value === "Active" ? "#8a8a19" : "#ef130cff")
            : "#171717" 
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
  value: string | number;
  color: string;
}

const StatCard = ({ title, value, color }: StatCardProps) => (
  <div className="bg-white rounded-lg p-4 shadow-md text-center border border-gray-200">
    <div className="text-2xl font-bold mb-1" style={{ color }}>
      {value}
    </div>
    <div className="text-sm font-medium text-gray-600">{title}</div>
  </div>
);