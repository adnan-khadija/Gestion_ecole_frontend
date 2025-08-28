"use client";

import { Etudiant } from "@/lib/types";
import { FiX, FiDownload } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";

type StudentProfileProps = {
  etudiant: Etudiant & { presenceToken?: string };
  onClose: () => void;
};

export default function StudentProfile({ etudiant, onClose }: StudentProfileProps) {
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
      pdf.save(`${etudiant.nom}_${etudiant.prenom}.pdf`);
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
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-transform duration-300 ${
          show ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-purple-300 rounded-t-2xl p-5 flex justify-between items-center">
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200"
          >
            <FiX size={26} />
          </button>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-sm"
          >
            <FiDownload />
            PDF
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row items-start gap-6 p-6">
          {/* Left column: photo + QR */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <img
              src={etudiant.photo || "/images/logo.png"}
              alt={etudiant.nom}
              className="w-36 h-36 rounded-full object-cover shadow-lg border-4 border-purple-300"
            />

            {/* QR Code */}
            <div className="p-3 bg-white rounded-lg shadow-md">
              <QRCode
                value={JSON.stringify({
                  matricule: etudiant.matricule,
                  token: etudiant.presenceToken || "no-token",
                })}
                size={120}
                bgColor="#FFFFFF"
                fgColor="#6B46C1"
              />
              <p className="text-center text-sm text-gray-600 mt-2 font-medium">
                Scanner pour valider la présence
              </p>
            </div>
          </div>

          {/* Right column: Info Table with light purple background */}
          <div className="flex-1 bg-purple-100 rounded-xl p-4 shadow-inner">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
              {etudiant.nom} {etudiant.prenom}
            </h2>
            <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700">
              <span className="font-semibold">Matricule:</span>
              <span>{etudiant.matricule}</span>

              <span className="font-semibold">Email:</span>
              <span>
                <a href={`mailto:${etudiant.email}`} className="text-purple-600 hover:underline">
                  {etudiant.email}
                </a>
              </span>

              <span className="font-semibold">Téléphone:</span>
              <span>
                <a href={`tel:${etudiant.telephone}`} className="text-purple-600 hover:underline">
                  {etudiant.telephone}
                </a>
              </span>

              <span className="font-semibold">Adresse:</span>
              <span>{etudiant.adresse}</span>

              <span className="font-semibold">Date de Naissance:</span>
              <span>{etudiant.dateNaissance}</span>

              <span className="font-semibold">Ville:</span>
              <span>{etudiant.ville}</span>

              <span className="font-semibold">Nationalité:</span>
              <span>{etudiant.nationalite}</span>

              <span className="font-semibold">Boursier:</span>
              <span>{etudiant.boursier ? "Oui" : "Non"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
