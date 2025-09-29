"use client";

import { Student, CustomField } from "@/lib/types";
import { FiX, FiDownload } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";

type StudentProfileProps = {
  student: Student & { presenceToken?: string };
  onClose: () => void;
};

export default function StudentProfile({ student, onClose }: StudentProfileProps) {
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
      pdf.save(`${student.nom}_${student.prenom}.pdf`);
    }
  };

  // Fonction pour formater les valeurs des champs personnalisés
  const formatCustomFieldValue = (field: CustomField): string => {
    if (field.fieldValue === null || field.fieldValue === undefined) return "Non défini";
    
    // Vérifier si c'est une valeur booléenne
    if (field.fieldValue.toLowerCase() === 'true' || field.fieldValue.toLowerCase() === 'false') {
      return field.fieldValue.toLowerCase() === 'true' ? 'Oui' : 'Non';
    }
    
    // Vérifier si c'est une date
    if (!isNaN(Date.parse(field.fieldValue))) {
      return new Date(field.fieldValue).toLocaleDateString('fr-FR');
    }
    
    return field.fieldValue;
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
          style={{ backgroundColor: "#8f8f8bff" }}
        >
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FiX size={26} />
          </button>
          <h2 className="text-xl font-bold text-white text-center flex-1 mx-4">
            Profil de l'Étudiant
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
          {/* Section Photo et QR Code */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <img
                src={student.image || "/images/logo.png"}
                alt={`${student.nom} ${student.prenom}`}
                className="w-36 h-36 rounded-full object-cover shadow-lg border-4"
                style={{ borderColor: "#ef130cff" }}
              />
              
              {/* QR Code */}
              <div className="p-3 bg-white rounded-lg shadow-md">
                <QRCode
                  value={JSON.stringify({
                    matricule: student.matricule,
                    token: student.presenceToken || "no-token",
                  })}
                  size={120}
                  bgColor="#FFFFFF"
                  fgColor="#ef130cff"
                />
                <p
                  className="text-center text-sm mt-2 font-medium"
                  style={{ color: "#171717" }}
                >
                  Scanner pour valider la présence
                </p>
              </div>
            </div>

            {/* Informations principales */}
            <div className="flex-1 text-center md:text-left">
              <h1
                className="text-4xl font-extrabold mb-2 tracking-tight"
                style={{ color: "#424444ff" }}
              >
                {student.prenom} {student.nom}
              </h1>
              <p className="text-lg mb-4" style={{ color: "#ef130cff" }}>
                {student.matricule}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  {student.niveau}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  {student.groupe}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  {student.statut}
                </span>
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations de base */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Informations Personnelles
              </h3>
              <div className="space-y-3">
                <InfoRow label="Email" value={student.email} isEmail />
                <InfoRow label="Téléphone" value={student.telephone} isPhone />
                <InfoRow label="Date de Naissance" value={student.dateNaissance} />
                <InfoRow label="Lieu de Naissance" value={student.lieuNaissance} />
                <InfoRow label="Sexe" value={student.sexe} />
                <InfoRow label="Nationalité" value={student.nationalite} />
                <InfoRow label="Situation Familiale" value={student.situationFamiliale} />
              </div>
            </div>

            {/* Colonne droite - Informations académiques */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Informations Académiques
              </h3>
              <div className="space-y-3">
                <InfoRow label="Année Académique" value={student.anneeAcademique} />
                <InfoRow label="Niveau" value={student.niveau} />
                <InfoRow label="Groupe" value={student.groupe} />
                <InfoRow label="Statut" value={student.statut} />
                <InfoRow label="Boursier" value={student.bourse ? "Oui" : "Non"} />
                <InfoRow label="Handicap" value={student.handicap ? "Oui" : "Non"} />
                <InfoRow label="Adresse" value={student.adresse} />
                <InfoRow label="Ville" value={student.ville} />
              </div>
            </div>
          </div>

          {/* Champs personnalisés */}
          {student.customFields && student.customFields.length > 0 && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccffs" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Informations Complémentaires
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.customFields.map((field) => (
                  <div key={field.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <span className="font-semibold text-sm block mb-1" style={{ color: "#8a8a19" }}>
                      {field.fieldName}:
                    </span>
                    <span className="text-sm" style={{ color: "#171717" }}>
                      {field.fieldValue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Diplômes" 
              value={student.diplomes?.length || 0} 
              color="#ef130cff"
            />
            <StatCard 
              title="Modules" 
              value={student.modules?.length || 0} 
              color="#ccccccff"
            />
            <StatCard 
              title="Absences" 
              value={student.absences?.length || 0} 
              color="#8a8a19"
            />
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
  isEmail?: boolean;
  isPhone?: boolean;
}

const InfoRow = ({ label, value, isEmail = false, isPhone = false }: InfoRowProps) => {
  if (!value) return null;

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-300">
      <span className="font-semibold text-sm" style={{ color: "#8a8a19" }}>
        {label}:
      </span>
      <span className="text-sm text-right" style={{ color: "#171717" }}>
        {isEmail ? (
          <a href={`mailto:${value}`} style={{ color: "#ef130cff" }} className="hover:underline">
            {value}
          </a>
        ) : isPhone ? (
          <a href={`tel:${value}`} style={{ color: "#ef130cff" }} className="hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </span>
    </div>
  );
};

// Composant pour les cartes de statistiques
interface StatCardProps {
  title: string;
  value: number;
  color: string;
}

const StatCard = ({ title, value, color }: StatCardProps) => (
  <div className="bg-white rounded-lg p-4 shadow-md text-center">
    <div className="text-3xl font-bold mb-1" style={{ color }}>
      {value}
    </div>
    <div className="text-sm font-medium text-gray-600">{title}</div>
  </div>
);