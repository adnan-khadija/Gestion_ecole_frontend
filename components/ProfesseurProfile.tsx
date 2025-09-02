"use client";

import { Professeur } from "@/lib/types";
import { FiX, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiBook, FiAward, FiUsers } from "react-icons/fi";
import { useState, useEffect } from "react";

type ProfesseurProfileProps = {
  professeur: Professeur;
  onClose: () => void;
};

export default function ProfesseurProfile({ professeur, onClose }: ProfesseurProfileProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0d68ae]/50 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full mx-4 p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-[#7bdcb5] pb-2">
          <h1 className="text-xl font-semibold text-[#0274be]">Profil Professeur</h1>
          <button
            onClick={handleClose}
            className="p-1 text-[#8a8a19] hover:text-[#0d68ae]"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Section */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#0274be]">
                {professeur.prenom} {professeur.nom}
              </h2>
              <p className="text-[#00d084]">(ID: {professeur.id})</p>
            </div>

            {/* Informations Personnelles */}
            <div>
              <h3 className="text-base font-medium text-[#0d68ae] mb-2">Informations Personnelles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {professeur.dateEmbauche && (
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-sm text-[#8a8a19]">Date d'Embauche</p>
                      <p className="text-xs text-[#0274be]">{professeur.dateEmbauche}</p>
                    </div>
                  </div>
                )}
                {professeur.specialite && (
                  <div className="flex items-center gap-2">
                    <FiBook className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-sm text-[#8a8a19]">Spécialité</p>
                      <p className="text-xs text-[#0274be]">{professeur.specialite}</p>
                    </div>
                  </div>
                )}
                {professeur.statut && (
                  <div className="flex items-center gap-2">
                    <FiUser className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-sm text-[#8a8a19]">Statut</p>
                      <p className="text-xs text-[#0274be]">{professeur.statut}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coordonnées */}
            <div className="pt-4 border-t border-[#7bdcb5]">
              <h3 className="text-base font-medium text-[#0d68ae] mb-2">Coordonnées</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <FiMail className="text-[#00d084]" size={16} />
                  <div>
                    <p className="text-sm text-[#8a8a19]">Email</p>
                    <a href={`mailto:${professeur.email}`} className="text-xs text-[#0274be] hover:text-[#9de37f]">
                      {professeur.email}
                    </a>
                  </div>
                </div>
                {professeur.telephone && (
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-sm text-[#8a8a19]">Téléphone</p>
                      <a href={`tel:${professeur.telephone}`} className="text-xs text-[#0274be] hover:text-[#9de37f]">
                        {professeur.telephone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informations Académiques */}
            <div className="pt-4 border-t border-[#7bdcb5]">
              <h3 className="text-base font-medium text-[#0d68ae] mb-2">Informations Académiques</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {professeur.diplomes && (
                  <div>
                    <p className="text-sm text-[#8a8a19]">Diplômes</p>
                    <p className="text-xs text-[#0274be]">
                      {professeur.diplomes.length ? professeur.diplomes.map(d => d.nom).join(", ") : "Aucun"}
                    </p>
                  </div>
                )}
                {professeur.formations && (
                  <div>
                    <p className="text-sm text-[#8a8a19]">Formations Assurées</p>
                    <p className="text-xs text-[#0274be]">
                      {professeur.formations.length ? professeur.formations.map(f => f.nom).join(", ") : "Aucune"}
                    </p>
                  </div>
                )}
                {professeur.heuresTravail && (
                  <div>
                    <p className="text-sm text-[#8a8a19]">Heures de Travail</p>
                    <p className="text-xs text-[#0274be]">{professeur.heuresTravail} h/semaine</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-col items-center">
            <img
              src={professeur.photo || "/images/logo.png"}
              alt={`${professeur.prenom} ${professeur.nom}`}
              className="w-32 h-32 rounded-full border-2 border-[#7bdcb5] object-cover mb-4"
            />
         
          </div>
        </div>
      </div>
    </div>
  );
}
