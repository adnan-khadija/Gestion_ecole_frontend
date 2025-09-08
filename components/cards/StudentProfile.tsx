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
        <div
          className="rounded-t-2xl p-5 flex justify-between items-center"
          style={{ backgroundColor: "#838380ff" }} // dark gray-blue
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
              backgroundColor: "#eb7c78ff", // coral-red
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
              src={etudiant.photo || "/images/logo.png"}
              alt={`${etudiant.nom} ${etudiant.prenom}`}
              className="w-36 h-36 rounded-full object-cover shadow-lg border-4"
              style={{ borderColor: "#ef130cff" }} // vivid red
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

          {/* Right column: Info Table */}
          <div
            className="flex-1 rounded-xl p-4 shadow-inner"
            style={{ backgroundColor: "#b5b7b9ff" }} // light gray-blue
          >
            <h2
              className="text-3xl font-extrabold mb-4 tracking-tight"
              style={{ color: "#424444ff" }} // darker gray-blue
            >
              {etudiant.prenom} {etudiant.nom}
            </h2>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="font-semibold" style={{ color: "#8a8a19" }}>
                Matricule:
              </span>
              <span style={{ color: "#171717" }}>{etudiant.matricule}</span>

              <span className="font-semibold" style={{ color: "#8a8a19" }}>
                Email:
              </span>
              <span>
                <a
                  href={`mailto:${etudiant.email}`}
                  style={{ color: "#ef130cff" }}
                  className="hover:underline"
                >
                  {etudiant.email}
                </a>
              </span>

              {etudiant.telephone && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>
                    Téléphone:
                  </span>
                  <span>
                    <a
                      href={`tel:${etudiant.telephone}`}
                      style={{ color: "#ef130cff" }}
                      className="hover:underline"
                    >
                      {etudiant.telephone}
                    </a>
                  </span>
                </>
              )}

              {etudiant.adresse && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>
                    Adresse:
                  </span>
                  <span style={{ color: "#171717" }}>{etudiant.adresse}</span>
                </>
              )}

              {etudiant.dateNaissance && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>
                    Date de Naissance:
                  </span>
                  <span style={{ color: "#171717" }}>{etudiant.dateNaissance}</span>
                </>
              )}

              {etudiant.ville && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>
                    Ville:
                  </span>
                  <span style={{ color: "#171717" }}>{etudiant.ville}</span>
                </>
              )}

              {etudiant.nationalite && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>
                    Nationalité:
                  </span>
                  <span style={{ color: "#171717" }}>{etudiant.nationalite}</span>
                </>
              )}

              <span className="font-semibold" style={{ color: "#8a8a19" }}>
                Boursier:
              </span>
              <span style={{ color: "#171717" }}>
                {etudiant.boursier ? "Oui" : "Non"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
