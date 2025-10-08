"use client";

import { Diplome } from "@/lib/types";
import { FiX, FiDownload } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { generateQrCode } from "@/lib/diplome";

type DiplomeCardProps = {
  diplome: Diplome;
  onClose: () => void;
};

export default function DiplomeCard({ diplome, onClose }: DiplomeCardProps) {
  const [show, setShow] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loadingQrCode, setLoadingQrCode] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShow(true);
    // Charger le QR Code si le diplôme a un ID
    if (diplome.idDiplome) {
      loadQrCode();
    }
  }, [diplome.idDiplome]);

  const loadQrCode = async () => {
    if (!diplome.idDiplome) return;
    
    setLoadingQrCode(true);
    try {
      const url = await generateQrCode(diplome.idDiplome);
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Erreur lors du chargement du QR Code:", error);
    } finally {
      setLoadingQrCode(false);
    }
  };

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
      pdf.save(`${diplome.nomDiplome}_diplome.pdf`);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non spécifié";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Nettoyer l'URL du QR Code lors du démontage du composant
  useEffect(() => {
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [qrCodeUrl]);

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
            Détails du Diplôme
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
          {/* Section en-tête avec QR Code */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Informations principales */}
            <div className="flex-1 text-center md:text-left">
              <h1
                className="text-4xl font-extrabold mb-2 tracking-tight"
                style={{ color: "#424444ff" }}
              >
                {diplome.nomDiplome}
              </h1>
              <p className="text-lg mb-4" style={{ color: "#ef130cff" }}>
                {diplome.typeDiplome}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {diplome.niveau && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                    {diplome.niveau}
                  </span>
                )}
                {diplome.mention && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                    {diplome.mention}
                  </span>
                )}
                <span 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    diplome.estValide 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {diplome.estValide ? "Validé" : "Non validé"}
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-4">
              {loadingQrCode ? (
                <div className="p-3 bg-white rounded-lg shadow-md border-2 border-gray-300 w-32 h-32 flex items-center justify-center">
                  <div className="text-sm text-gray-500">Chargement...</div>
                </div>
              ) : qrCodeUrl ? (
                <div className="p-3 bg-white rounded-lg shadow-md border-2" style={{ borderColor: "#ef130cff" }}>
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code de vérification" 
                    className="w-32 h-32"
                  />
                  <p
                    className="text-center text-sm mt-2 font-medium"
                    style={{ color: "#171717" }}
                  >
                    Scanner pour vérifier
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-lg shadow-md border-2 border-gray-300 w-32 h-32 flex items-center justify-center">
                  <div className="text-sm text-gray-500">QR Code non disponible</div>
                </div>
              )}
            </div>
          </div>

          {/* Informations du diplôme */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations principales */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Informations du Diplôme
              </h3>
              <div className="space-y-3">
                <InfoRow label="Type de diplôme" value={diplome.typeDiplome} />
                <InfoRow label="Niveau" value={diplome.niveau} />
                <InfoRow label="Année d'obtention" value={diplome.anneeObtention} />
                <InfoRow label="Mention" value={diplome.mention} />
                <InfoRow 
                  label="Statut de validation" 
                  value={diplome.estValide ? "Validé" : "Non validé"} 
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
                <InfoRow label="Date de délivrance" value={formatDate(diplome.dateDelivrance)} />
                <InfoRow label="Mode de remise" value={diplome.modeRemise} />
                <InfoRow label="Signé par" value={diplome.signatureAdmin} />
                <InfoRow label="Fichier disponible" value={diplome.fichierDiplome ? "Oui" : "Non"} />
                <InfoRow 
                  label="QR Code" 
                  value={qrCodeUrl ? "Disponible" : loadingQrCode ? "Chargement..." : "Non disponible"} 
                />
              </div>
            </div>
          </div>

          {/* Professeurs */}
          {diplome.professeurs && diplome.professeurs.length > 0 && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Professeurs Associés
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diplome.professeurs.map((prof) => (
                  <div key={prof.id} className="bg-white rounded-lg p-3 shadow-sm">
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Étudiant */}
          {diplome.student && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Informations de l'Étudiant
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="space-y-2">
                    <InfoRow label="Nom complet" value={`${diplome.student.prenom} ${diplome.student.nom}`} />
                    <InfoRow label="Email" value={diplome.student.email} />
                    <InfoRow label="Téléphone" value={diplome.student.telephone} />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="space-y-2">
                    <InfoRow label="Date de naissance" value={formatDate(diplome.student.dateNaissance)} />
                    <InfoRow label="Lieu de naissance" value={diplome.student.lieuNaissance} />
                    <InfoRow label="Nationalité" value={diplome.student.nationalite} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commentaire */}
          {diplome.commentaire && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Commentaire
              </h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm" style={{ color: "#171717" }}>
                  {diplome.commentaire}
                </p>
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Professeur(s)" 
              value={diplome.professeurs?.length || 0} 
              color="#ef130cff"
            />
            <StatCard 
              title="Année" 
              value={diplome.anneeObtention || "N/A"} 
              color="#ccccccff"
            />
            <StatCard 
              title="Statut" 
              value={diplome.estValide ? "Validé" : "En attente"} 
              color={diplome.estValide ? "#8a8a19" : "#eb7c78ff"}
            />
          </div>

          {/* Informations de vérification */}
          <div
            className="rounded-xl p-6 text-center"
            style={{ backgroundColor: "#f8f9fa", border: "2px dashed #ccccccff" }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: "#424444ff" }}>
              Vérification du Diplôme
            </h3>
            <p className="text-sm" style={{ color: "#171717" }}>
              Ce diplôme peut être vérifié en scannant le QR Code ou en contactant l'administration.
            </p>
            {diplome.id && (
              <p className="text-xs mt-2" style={{ color: "#838380ff" }}>
                ID du diplôme: {diplome.id}
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
  if (!value || value === "Non spécifié") return null;

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-300">
      <span className="font-semibold text-sm" style={{ color: "#8a8a19" }}>
        {label}:
      </span>
      <span 
        className={`text-sm text-right ${
          isStatus ? "font-semibold" : ""
        }`}
        style={{ 
          color: isStatus 
            ? (value === "Validé" ? "#8a8a19" : "#ef130cff")
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
  <div className="bg-white rounded-lg p-4 shadow-md text-center">
    <div className="text-2xl font-bold mb-1" style={{ color }}>
      {value}
    </div>
    <div className="text-sm font-medium text-gray-600">{title}</div>
  </div>
);