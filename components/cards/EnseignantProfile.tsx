"use client";

import { Enseignant, CustomField } from "@/lib/types";
import { FiX, FiDownload } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";

type EnseignantProfileProps = {
  professeur: Enseignant;
  onClose: () => void;
};

export default function EnseignantProfile({ professeur, onClose }: EnseignantProfileProps) {
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
      pdf.save(`${professeur.user.nom}_${professeur.user.prenom}.pdf`);
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

  // Formater la date d'embauche
  const formatDateEmbauche = (dateString: string) => {
    if (!dateString) return "Non définie";
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  // Formater les horaires
  const formatHoraires = () => {
    if (!professeur.horaires) return "Non définis";
    
    if (typeof professeur.horaires === 'string') {
      return professeur.horaires;
    }
    
    // Si c'est un objet TimeSlot
    if (professeur.horaires.day && professeur.horaires.startTime && professeur.horaires.endTime) {
      return `${professeur.horaires.day} : ${professeur.horaires.startTime} - ${professeur.horaires.endTime}`;
    }
    
    return "Horaires non définis";
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
            Profil de l'Enseignant
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
                src={professeur.user.image || "/images/logo.png"}
                alt={`${professeur.user.nom} ${professeur.user.prenom}`}
                className="w-36 h-36 rounded-full object-cover shadow-lg border-4"
                style={{ borderColor: "#ef130cff" }}
              />
              
              {/* QR Code */}
              <div className="p-3 bg-white rounded-lg shadow-md">
                <QRCode
                  value={JSON.stringify({
                    enseignantId: professeur.enseignantId,
                    nom: professeur.user.nom,
                    prenom: professeur.user.prenom,
                    specialite: professeur.specialite
                  })}
                  size={120}
                  bgColor="#FFFFFF"
                  fgColor="#ef130cff"
                />
                <p
                  className="text-center text-sm mt-2 font-medium"
                  style={{ color: "#171717" }}
                >
                  Scanner pour informations
                </p>
              </div>
            </div>

            {/* Informations principales */}
            <div className="flex-1 text-center md:text-left">
              <h1
                className="text-4xl font-extrabold mb-2 tracking-tight"
                style={{ color: "#424444ff" }}
              >
                {professeur.user.prenom} {professeur.user.nom}
              </h1>
              <p className="text-lg mb-4" style={{ color: "#ef130cff" }}>
                {professeur.specialite}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  {professeur.statusEnseignant}
                </span>
                {professeur.heuresTravail && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                    {professeur.heuresTravail} heures
                  </span>
                )}
                {professeur.diplomes && professeur.diplomes.length > 0 && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                    {professeur.diplomes.length} diplôme(s)
                  </span>
                )}
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
                <InfoRow label="Email" value={professeur.user.email} isEmail />
                <InfoRow label="Téléphone" value={professeur.user.telephone} isPhone />
                <InfoRow label="Date d'embauche" value={formatDateEmbauche(professeur.dateEmbauche)} />
                <InfoRow label="Statut" value={professeur.statusEnseignant} />
                <InfoRow label="Spécialité" value={professeur.specialite} />
                <InfoRow label="Heures de travail" value={professeur.heuresTravail} />
              </div>
            </div>

            {/* Colonne droite - Informations professionnelles */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Informations Professionnelles
              </h3>
              <div className="space-y-3">
                <InfoRow label="Horaires" value={formatHoraires()} />
                <InfoRow 
                  label="Diplômes encadrés" 
                  value={professeur.diplomes?.map(d => d.nomDiplome).join(", ") || "Aucun"} 
                />
                <InfoRow 
                  label="Modules enseignés" 
                  value={professeur.modules?.map(m => m.nomModule).join(", ") || "Aucun"} 
                />
                <InfoRow label="ID Enseignant" value={professeur.enseignantId} />
                <InfoRow label="ID Utilisateur" value={professeur.user.id} />
              </div>
            </div>
          </div>

          {/* Champs personnalisés */}
          {professeur.customFields && professeur.customFields.length > 0 && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Informations Complémentaires
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professeur.customFields.map((field) => (
                  <div key={field.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <span className="font-semibold text-sm block mb-1" style={{ color: "#8a8a19" }}>
                      {field.fieldName}:
                    </span>
                    <span className="text-sm" style={{ color: "#171717" }}>
                      {formatCustomFieldValue(field)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              title="Diplômes" 
              value={professeur.diplomes?.length || 0} 
              color="#ef130cff"
            />
            <StatCard 
              title="Modules" 
              value={professeur.modules?.length || 0} 
              color="#ccccccff"
            />
            <StatCard 
              title="Années d'expérience" 
              value={calculateAnneesExperience(professeur.dateEmbauche)} 
              color="#8a8a19"
            />
            <StatCard 
              title="Champs personnalisés" 
              value={professeur.customFields?.length || 0} 
              color="#8f8f8bff"
            />
          </div>

          {/* Liste des diplômes encadrés */}
          {professeur.diplomes && professeur.diplomes.length > 0 && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Diplômes Encadrés
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professeur.diplomes.map((diplome) => (
                  <div key={diplome.idDiplome} className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-bold text-lg mb-2" style={{ color: "#ef130cff" }}>
                      {diplome.nomDiplome}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: "#8a8a19" }}>Type:</span>
                        <span style={{ color: "#171717" }}>{diplome.typeDiplome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "#8a8a19" }}>Niveau:</span>
                        <span style={{ color: "#171717" }}>{diplome.niveau}</span>
                      </div>
                      {diplome.anneeObtention && (
                        <div className="flex justify-between">
                          <span style={{ color: "#8a8a19" }}>Année:</span>
                          <span style={{ color: "#171717" }}>{diplome.anneeObtention}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des modules enseignés */}
          {professeur.modules && professeur.modules.length > 0 && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Modules Enseignés
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professeur.modules.map((module) => (
                  <div key={module.idModule} className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-bold text-lg mb-2" style={{ color: "#ef130cff" }}>
                      {module.nomModule}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: "#8a8a19" }}>Note:</span>
                        <span style={{ color: "#171717" }}>{module.note}/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "#8a8a19" }}>Diplôme:</span>
                        <span style={{ color: "#171717" }}>{module.diplome.nomDiplome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "#8a8a19" }}>Étudiants:</span>
                        <span style={{ color: "#171717" }}>{module.students?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
  value: number | string;
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

// Fonction pour calculer les années d'expérience
const calculateAnneesExperience = (dateEmbauche: string): number => {
  if (!dateEmbauche) return 0;
  
  try {
    const embaucheDate = new Date(dateEmbauche);
    const aujourdhui = new Date();
    const differenceAnnees = aujourdhui.getFullYear() - embaucheDate.getFullYear();
    
    // Ajuster si l'anniversaire d'embauche n'est pas encore passé cette année
    const moisDifference = aujourdhui.getMonth() - embaucheDate.getMonth();
    if (moisDifference < 0 || (moisDifference === 0 && aujourdhui.getDate() < embaucheDate.getDate())) {
      return differenceAnnees - 1;
    }
    
    return differenceAnnees;
  } catch {
    return 0;
  }
};