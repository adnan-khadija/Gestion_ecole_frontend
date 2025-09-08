"use client";

import { Professeur } from "@/lib/types";
import { FiX, FiDownload } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";

type ProfesseurProfileProps = {
  professeur: Professeur & { qrToken?: string };
  onClose: () => void;
};

export default function ProfesseurProfile({ professeur, onClose }: ProfesseurProfileProps) {
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
      pdf.save(`${professeur.nom}_${professeur.prenom}.pdf`);
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
        <div
          className="rounded-t-2xl p-5 flex justify-between items-center"
          style={{ backgroundColor: "#838380ff" }} // bleu-foncé
        >
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200"
          >
            <FiX size={26} />
          </button>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm"
            style={{
              backgroundColor: "#eb7c78ff", // solid-electric-grass
              color: "#171717",
            }}
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
              src={professeur.photo || "/images/logo.png"}
              alt={`${professeur.nom} ${professeur.prenom}`}
              className="w-36 h-36 rounded-full object-cover shadow-lg border-4"
              style={{ borderColor: "#ef130cff" }} // light-green-cyan
            />

            {/* QR Code */}
            <div className="p-3 bg-white rounded-lg shadow-md">
              <QRCode
                value={JSON.stringify({
                  id: professeur.id,
                  token: professeur.qrToken || "no-token",
                })}
                size={120}
                bgColor="#FFFFFF"
                fgColor="#ef130cff" // vivid-green-cyan
              />
              <p className="text-center text-sm mt-2 font-medium" style={{ color: "#171717" }}>
                Scanner pour valider
              </p>
            </div>
          </div>

          {/* Right column: Info Table */}
          <div
            className="flex-1 rounded-xl p-4 shadow-inner"
            style={{ backgroundColor: "#b5b7b9ff" }} // bleu clair
          >
            <h2
              className="text-3xl font-extrabold mb-4 tracking-tight"
              style={{ color: "#424444ff" }} // bleu-clair
            >
              {professeur.prenom} {professeur.nom}
            </h2>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="font-semibold" style={{ color: "#8a8a19" }}>ID:</span>
              <span style={{ color: "#171717" }}>{professeur.id}</span>

              <span className="font-semibold" style={{ color: "#8a8a19" }}>Email:</span>
              <span>
                <a
                  href={`mailto:${professeur.email}`}
                  style={{ color: "#ef130cff" }}
                  className="hover:underline"
                >
                  {professeur.email}
                </a>
              </span>

              {professeur.telephone && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>Téléphone:</span>
                  <span>
                    <a
                      href={`tel:${professeur.telephone}`}
                      style={{ color: "#ef130cff" }}
                      className="hover:underline"
                    >
                      {professeur.telephone}
                    </a>
                  </span>
                </>
              )}

              {professeur.specialite && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>Spécialité:</span>
                  <span style={{ color: "#171717" }}>{professeur.specialite}</span>
                </>
              )}

              {professeur.statut && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>Statut:</span>
                  <span style={{ color: "#171717" }}>{professeur.statut}</span>
                </>
              )}

              {professeur.dateEmbauche && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>Date d'embauche:</span>
                  <span style={{ color: "#171717" }}>{professeur.dateEmbauche}</span>
                </>
              )}

              {professeur.diplomes && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>Diplômes:</span>
                  <span style={{ color: "#171717" }}>
                    {professeur.diplomes.length
                      ? professeur.diplomes.map(d => d.nomDiplome).join(", ")
                      : "Aucun"}
                  </span>
                </>
              )}

              {professeur.formations && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>Formations:</span>
                  <span style={{ color: "#171717" }}>
                    {professeur.formations.length
                      ? professeur.formations.map(f => f.nom).join(", ")
                      : "Aucune"}
                  </span>
                </>
              )}

              {professeur.heuresTravail && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>Heures de Travail:</span>
                  <span style={{ color: "#171717" }}>{professeur.heuresTravail} h/semaine</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
