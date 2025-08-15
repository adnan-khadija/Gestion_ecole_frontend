"use client";

import { Etudiant } from "@/lib/types";
import { FiX, FiDownload } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type StudentProfileProps = {
  etudiant: Etudiant;
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
        className={`bg-white rounded-xl shadow-lg max-w-xl w-full p-6 relative transform transition-transform duration-300 ${
          show ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FiX size={24} />
        </button>

        {/* Generate PDF button */}
        <button
          onClick={generatePDF}
          className="absolute top-4 left-4 flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
        >
          <FiDownload />
          PDF
        </button>

        {/* Student Card */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={etudiant.photo || "/images/logo.png"}
            alt={etudiant.nom}
            className="w-32 h-32 rounded-full object-cover shadow-md"
          />

          <div className="flex-1 space-y-2 text-gray-700">
            <h2 className="text-2xl font-bold text-gray-900">{etudiant.nom} {etudiant.prenom}</h2>
            <p><span className="font-medium">Matricule:</span> {etudiant.matricule}</p>
            <p><span className="font-medium">Email:</span> <a href={`mailto:${etudiant.email}`} className="text-blue-600 hover:underline">{etudiant.email}</a></p>
            <p><span className="font-medium">Téléphone:</span> <a href={`tel:${etudiant.telephone}`} className="text-blue-600 hover:underline">{etudiant.telephone}</a></p>
            <p><span className="font-medium">Adresse:</span> {etudiant.adresse}</p>
            <p><span className="font-medium">Date de Naissance:</span> {etudiant.dateNaissance}</p>
            <p><span className="font-medium">Ville:</span> {etudiant.ville}</p>
            <p><span className="font-medium">Nationalité:</span> {etudiant.nationalite}</p>
            <p><span className="font-medium">Boursier:</span> {etudiant.boursier ? "Oui" : "Non"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
