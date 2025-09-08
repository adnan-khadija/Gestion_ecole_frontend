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
      const canvas = await html2canvas(cardRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formation.nom}_.pdf`);
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
         

          {/* Right column: Info Table */}
          <div
            className="flex-1 rounded-xl p-4 shadow-inner"
            style={{ backgroundColor: "#b5b7b9ff" }} // light gray-blue
          >
            <h2
              className="text-3xl font-extrabold mb-4 tracking-tight"
              style={{ color: "#424444ff" }} // darker gray-blue
            >
               {formation.nom}
            </h2>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="font-semibold" style={{ color: "#8a8a19" }}>
               Cout:
              </span>
              <span style={{ color: "#171717" }}>{formation.cout}</span>

              <span className="font-semibold" style={{ color: "#8a8a19" }}>
                Capacité max:
              </span>
              <span>
                
                  {formation.capaciteMax}
               
              </span>


              {formation.description&& (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>
                    Description:
                  </span>
                  <span style={{ color: "#171717" }}>{formation.description}</span>
                </>
              )}

              {formation.modeFormation && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>
                   Mode de formation:
                  </span>
                  <span style={{ color: "#171717" }}>{formation.modeFormation}</span>
                </>
              )}

              {formation.niveauAcces  && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>
                    Niveau d'accès:
                  </span>
                  <span style={{ color: "#171717" }}>{formation.niveauAcces}</span>
                </>
              )}

{formation.professeurs && formation.professeurs.length > 0 && (
  <>
    <span className="font-semibold" style={{ color: "#8a8a19" }}>
      Professeurs:
    </span>
    <span style={{ color: "#171717" }}>
      {formation.professeurs.map((prof, index) => (
        <span key={prof.id}>
          {prof.nom} {prof.prenom}
          {index < formation.professeurs.length - 1 && ", "}
        </span>
      ))}
    </span>
  </>
)}
                {formation.anneeFormation && (
                <>
                  <span className="font-semibold" style={{ color: "#8a8a19" }}>
                    Année de formation:
                  </span>
                  <span style={{ color: "#171717" }}>{formation.anneeFormation}</span>
                </>
              )}

              <span className="font-semibold" style={{ color: "#8a8a19" }}>
                Active :
              </span>
              <span style={{ color: "#171717" }}>
                {formation.estActive ? "Oui" : "Non"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
