"use client";

import { Etudiant } from "@/lib/types";
import { FiX, FiMail, FiPhone, FiMapPin, FiCalendar, FiGlobe, FiDollarSign, FiUser, FiHome, FiBook, FiAward, FiUsers, FiHeart } from "react-icons/fi";
import { useState, useEffect } from "react";

type StudentProfileProps = {
  etudiant: Etudiant;
  onClose: () => void;
};

export default function StudentProfile({ etudiant, onClose }: StudentProfileProps) {
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
          <h1 className="text-xl font-semibold text-[#0274be]">Profil Étudiant</h1>
          <button
            onClick={handleClose}
            className="p-1 text-[#8a8a19] hover:text-[#0d68ae]"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Section - Information */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#0274be]">{etudiant.prenom} {etudiant.nom}</h2>
              <p className="text-[#00d084]">{etudiant.matricule} (ID: {etudiant.id})</p>
            </div>

            <div >
              {/* Informations Personnelles */}
              <div>
                <h3 className="text-base font-medium text-[#0d68ae] mb-2">Informations Personnelles</h3>
                <div  className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-xs text-[#8a8a19]">Date de Naissance</p>
                      <p className="text-sm text-[#0274be]">{etudiant.dateNaissance}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-xs text-[#8a8a19]">Lieu de Naissance</p>
                      <p className="text-sm text-[#0274be]">{etudiant.lieuNaissance}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUser className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-xs text-[#8a8a19]">Sexe</p>
                      <p className="text-sm text-[#0274be]">{etudiant.sexe}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiGlobe className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-xs text-[#8a8a19]">Nationalité</p>
                      <p className="text-sm text-[#0274be]">{etudiant.nationalite}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiHeart className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-xs text-[#8a8a19]">Situation Familiale</p>
                      <p className="text-sm text-[#0274be]">{etudiant.situationFamiliale || "Non spécifié"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-xs text-[#8a8a19]">Statut Boursier</p>
                      <p className="text-sm text-[#0274be]">{etudiant.boursier ? "Oui" : "Non"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUser className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-xs text-[#8a8a19]">Handicap</p>
                      <p className="text-sm text-[#0274be]">{etudiant.handicap ? "Oui" : "Non"}</p>
                    </div>
                  </div>

                </div>
              </div>

            
            </div>
              {/* Coordonnées */}
              <div className="pt-4 border-t border-[#7bdcb5]">
                <h3 className="text-base font-medium text-[#0d68ae] mb-2">Coordonnées</h3>
                <div  className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <FiMail className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-xs text-[#8a8a19]">Email</p>
                      <a href={`mailto:${etudiant.email}`} className="text-sm text-[#0274be] hover:text-[#9de37f]">
                        {etudiant.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-xs text-[#8a8a19]">Téléphone</p>
                      <a href={`tel:${etudiant.telephone}`} className="text-sm text-[#0274be] hover:text-[#9de37f]">
                        {etudiant.telephone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-[#00d084]" size={16} />
                    <div>
                      <p className="text-xs text-[#8a8a19]">Adresse</p>
                      <p className="text-sm text-[#0274be]">{etudiant.adresse}, {etudiant.ville}</p>
                    </div>
                  </div>
                </div>
              </div>

            {/* Informations Académiques */}
            <div className="pt-4 border-t border-[#7bdcb5]">
              <h3 className="text-base font-medium text-[#0d68ae] mb-2">Informations Académiques</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[#8a8a19]">Formation Actuelle</p>
                  <p className="text-sm text-[#0274be]">{etudiant.formationActuelle?.nom || "Non spécifié"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a19]">Niveau Scolaire</p>
                  <p className="text-sm text-[#0274be]">{etudiant.niveauScolaire || "Non spécifié"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a19]">Groupe Scolaire</p>
                  <p className="text-sm text-[#0274be]">{etudiant.groupeScolaire || "Non spécifié"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a19]">Année Académique</p>
                  <p className="text-sm text-[#0274be]">{etudiant.anneeAcademique || "Non spécifié"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a19]">Statut</p>
                  <p className="text-sm text-[#0274be]">{etudiant.statut || "Non spécifié"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a19]">Date d'Inscription</p>
                  <p className="text-sm text-[#0274be]">{etudiant.dateInscription || "Non spécifié"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a19]">Diplôme</p>
                  <p className="text-sm text-[#0274be]">{etudiant.diplome?.nom || "Non spécifié"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a19]">Formations Suivies</p>
                  <p className="text-sm text-[#0274be]">
                    {etudiant.formations?.length ? etudiant.formations.map(f => f.nom).join(", ") : "Aucune"}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations Tuteur */}
            {(etudiant.nomTuteur || etudiant.contactTuteur) && (
              <div className="pt-4 border-t border-[#7bdcb5]">
                <h3 className="text-base font-medium text-[#0d68ae] mb-2">Informations Tuteur</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#8a8a19]">Nom du Tuteur</p>
                    <p className="text-sm text-[#0274be]">{etudiant.nomTuteur || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8a8a19]">Contact du Tuteur</p>
                    <p className="text-sm text-[#0274be]">{etudiant.contactTuteur || "Non spécifié"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Photo and ID */}
          <div className="flex flex-col items-center">
            <img
              src={etudiant.photo || "/images/logo.png"}
              alt={`${etudiant.prenom} ${etudiant.nom}`}
              className="w-32 h-32 rounded-full border-2 border-[#7bdcb5] object-cover mb-4"
            />
            <div className="text-center">
              <h3 className="text-sm font-medium text-[#0d68ae] mb-1">Matricule Étudiant</h3>
              <p className="text-sm text-[#0274be] border border-[#7bdcb5] rounded px-2 py-1">{etudiant.matricule}</p>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
}