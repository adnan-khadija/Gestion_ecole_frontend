"use client";

import { ModuleResponse } from "@/lib/types";
import { FiX, FiDownload } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type ModuleCardProps = {
  module: ModuleResponse;
  onClose: () => void;
};

export default function ModuleCard({ module, onClose }: ModuleCardProps) {
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
        pdf.save(`${module.nom || 'module'}.pdf`);
      } catch (error) {
        console.error("Erreur lors de la génération du PDF:", error);
      }
    }
  };

  // Fonction pour calculer les heures restantes
  const calculateHeuresRestantes = () => {
    const totalCalculé = module.heuresCours + module.heuresTD + module.heuresTP;
    return Math.max(0, module.heuresTotal - totalCalculé);
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
            Détails du Module
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
          {/* Section en-tête */}
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Coefficient */}
            <div className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Coefficient: {module.coefficient}
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <h1
                className="text-4xl font-extrabold mb-2 tracking-tight"
                style={{ color: "#424444ff" }}
              >
                {module.nom}
              </h1>
              <p className="text-lg mb-4" style={{ color: "#ef130cff" }}>
                {module.diplomeNom}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  Note: {module.note}/20
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  {module.nombreEtudiants} étudiants
                </span>
              </div>
            </div>
          </div>

          {/* Informations du module */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations principales */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Informations du Module
              </h3>
              <div className="space-y-3">
                <InfoRow label="Nom" value={module.nom} />
                <InfoRow label="Diplôme" value={module.diplomeNom} />
                <InfoRow label="Coefficient" value={module.coefficient?.toString()} />
                <InfoRow label="Note moyenne" value={`${module.note}/20`} />
              </div>
            </div>

            {/* Colonne droite - Répartition des heures */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Répartition des Heures
              </h3>
              <div className="space-y-3">
                <InfoRow label="Heures totales" value={module.heuresTotal?.toString()} />
                <InfoRow label="Heures de cours" value={module.heuresCours?.toString()} />
                <InfoRow label="Heures de TD" value={module.heuresTD?.toString()} />
                <InfoRow label="Heures de TP" value={module.heuresTP?.toString()} />
                <InfoRow 
                  label="Heures restantes" 
                  value={calculateHeuresRestantes()?.toString()} 
                />
              </div>
            </div>
          </div>

          {/* Description */}
          {module.description && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Description
              </h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm" style={{ color: "#171717" }}>
                  {module.description}
                </p>
              </div>
            </div>
          )}

          {/* Enseignant */}
          <div
            className="rounded-xl p-6 shadow-inner"
            style={{ backgroundColor: "#ccccccff" }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
              Enseignant Responsable
            </h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm" style={{ color: "#8a8a19" }}>
                    Nom:
                  </span>
                  <span className="text-sm" style={{ color: "#171717" }}>
                    {module.enseignantPrenom} {module.enseignantNom}
                  </span>
                </div>
                
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              title="Coefficient" 
              value={module.coefficient || 0} 
              color="#ef130cff"
            />
            <StatCard 
              title="Heures Total" 
              value={module.heuresTotal || 0} 
              color="#ccccccff"
            />
            <StatCard 
              title="Étudiants" 
              value={module.nombreEtudiants || 0} 
              color="#8a8a19"
            />
            <StatCard 
              title="Note Moyenne" 
              value={`${module.note}/20`} 
              color="#eb7c78ff"
            />
          </div>

          {/* Détail des heures */}
          <div
            className="rounded-xl p-6 shadow-inner"
            style={{ backgroundColor: "#ccccccff" }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
              Détail de la Répartition Horaires
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <HourDetailCard 
                title="Cours" 
                hours={module.heuresCours} 
                totalHours={module.heuresTotal}
                color="#ef130cff"
              />
              <HourDetailCard 
                title="TD" 
                hours={module.heuresTD} 
                totalHours={module.heuresTotal}
                color="#8a8a19"
              />
              <HourDetailCard 
                title="TP" 
                hours={module.heuresTP} 
                totalHours={module.heuresTotal}
                color="#ccccccff"
              />
              <HourDetailCard 
                title="Restantes" 
                hours={calculateHeuresRestantes()} 
                totalHours={module.heuresTotal}
                color="#eb7c78ff"
              />
            </div>
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
}

const InfoRow = ({ label, value }: InfoRowProps) => {
  if (!value || value === "Non spécifié" || value === "null" || value === "undefined") return null;

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-300 last:border-b-0">
      <span className="font-semibold text-sm" style={{ color: "#8a8a19" }}>
        {label}:
      </span>
      <span className="text-sm text-right max-w-[60%] break-words" style={{ color: "#171717" }}>
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

// Composant pour le détail des heures
interface HourDetailCardProps {
  title: string;
  hours: number;
  totalHours: number;
  color: string;
}

const HourDetailCard = ({ title, hours, totalHours, color }: HourDetailCardProps) => {
  const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm text-center">
      <div className="text-xl font-bold mb-1" style={{ color }}>
        {hours}h
      </div>
      <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full"
          style={{ 
            backgroundColor: color,
            width: `${percentage}%`
          }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {percentage.toFixed(1)}%
      </div>
    </div>
  );
};