"use client";

import { NoteResponse } from "@/lib/types";
import { FiX, FiDownload } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";

type NoteCardProps = {
  note: NoteResponse;
  onClose: () => void;
};

export default function NoteCard({ note, onClose }: NoteCardProps) {
  const [show, setShow] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non spécifié";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNoteColor = (valeur: number) => {
    if (valeur >= 16) return "text-green-600";
    if (valeur >= 12) return "text-blue-600";
    if (valeur >= 10) return "text-orange-600";
    return "text-red-600";
  };

  const getNoteStatus = (valeur: number) => {
    if (valeur >= 10) return { text: "Validé", color: "bg-green-100 text-green-800" };
    return { text: "Non validé", color: "bg-red-100 text-red-800" };
  };

  const noteStatus = getNoteStatus(note.valeur);

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
            Détails de la Note
          </h2>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm opacity-50 cursor-not-allowed"
            style={{
              backgroundColor: "#eb7c78ff",
              color: "#171717",
            }}
            disabled
          >
            <FiDownload />
            Export
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Section en-tête avec note */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Informations principales */}
            <div className="flex-1 text-center md:text-left">
              <h1
                className="text-4xl font-extrabold mb-2 tracking-tight"
                style={{ color: "#424444ff" }}
              >
                {note.moduleNom}
              </h1>
              <p className="text-lg mb-4" style={{ color: "#ef130cff" }}>
                {note.typeNote}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${noteStatus.color}`}>
                  {noteStatus.text}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  {note.anneeScolaire}
                </span>
              </div>
            </div>

            {/* Note principale */}
            <div className="flex flex-col items-center gap-4">
              <div className="p-6 bg-white rounded-lg shadow-md border-2" style={{ borderColor: "#ef130cff" }}>
                <div className={`text-4xl font-bold ${getNoteColor(note.valeur)}`}>
                  {note.valeur}/20
                </div>
                <p
                  className="text-center text-sm mt-2 font-medium"
                  style={{ color: "#171717" }}
                >
                  Note obtenue
                </p>
              </div>
            </div>
          </div>

          {/* Informations de la note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations étudiant */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Informations de l'Étudiant
              </h3>
              <div className="space-y-3">
                <InfoRow label="Nom complet" value={`${note.studentPrenom} ${note.studentNom}`} />
                <InfoRow label="Matricule" value={note.matricule} />
                <InfoRow label="ID Étudiant" value={note.studentId} />
              </div>
            </div>

            {/* Colonne droite - Détails académiques */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Détails Académiques
              </h3>
              <div className="space-y-3">
                <InfoRow label="Module" value={note.moduleNom} />
                <InfoRow label="Type de note" value={note.typeNote} />
                <InfoRow label="Année scolaire" value={note.anneeScolaire} />
                <InfoRow label="Saisi par" value={note.saisiePar} />
              </div>
            </div>
          </div>

          {/* Informations temporelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Dates
              </h3>
              <div className="space-y-3">
                <InfoRow label="Date de création" value={formatDate(note.dateCreation)} />
                <InfoRow label="Dernière modification" value={formatDate(note.dateModification)} />
              </div>
            </div>

            {/* Statistiques */}
            <div className="rounded-xl p-6 shadow-inner" style={{ backgroundColor: "#ccccccff" }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Statistiques
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  title="Note" 
                  value={note.valeur} 
                  color={getNoteColor(note.valeur).replace('text-', '')}
                />
                <StatCard 
                  title="Statut" 
                  value={noteStatus.text} 
                  color={note.valeur >= 10 ? "green-600" : "red-600"}
                />
              </div>
            </div>
          </div>

          {/* Informations de vérification */}
          <div
            className="rounded-xl p-6 text-center"
            style={{ backgroundColor: "#f8f9fa", border: "2px dashed #ccccccff" }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: "#424444ff" }}>
              Vérification de la Note
            </h3>
            <p className="text-sm" style={{ color: "#171717" }}>
              Cette note a été saisie par {note.saisiePar} et peut être vérifiée auprès de l'administration.
            </p>
            {note.idNote && (
              <p className="text-xs mt-2" style={{ color: "#838380ff" }}>
                ID de la note: {note.idNote}
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
        style={{ color: "#171717" }}
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
    <div className={`text-2xl font-bold mb-1 text-${color}`}>
      {value}
    </div>
    <div className="text-sm font-medium text-gray-600">{title}</div>
  </div>
);