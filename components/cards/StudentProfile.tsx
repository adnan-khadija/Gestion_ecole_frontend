"use client";

import { Student, CustomField, Diplome, TypeNote, NoteResponse } from "@/lib/types";
import { FiX, FiDownload, FiAward, FiCalendar, FiBook, FiPlus, FiTrash2, FiFileText } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";
import { genererCartesScolaires, consulterDiplomes, ajouterDiplome, supprimerDiplome } from '@/lib/students';
import toast from 'react-hot-toast';
import { fetchDiplomes } from "@/lib/diplome";
import { downloadBulletinPDF } from '@/lib/notes';
import Cookies from 'js-cookie';
import axios from 'axios';

type StudentProfileProps = {
  student: Student & { presenceToken?: string };
  onClose: () => void;
};

export default function StudentProfile({ student, onClose }: StudentProfileProps) {
  const [show, setShow] = useState(false);
  const [diplomes, setDiplomes] = useState<Diplome[]>([]);
  const [loadingDiplomes, setLoadingDiplomes] = useState(false);
  const [showDiplomes, setShowDiplomes] = useState(false);
  const [showAddDiplome, setShowAddDiplome] = useState(false);
  const [availableDiplomes, setAvailableDiplomes] = useState<Diplome[]>([]);
  const [loadingAvailableDiplomes, setLoadingAvailableDiplomes] = useState(false);
  const [deletingDiplome, setDeletingDiplome] = useState<string | null>(null);
  const [addingDiplome, setAddingDiplome] = useState<string | null>(null);
  
  // États pour le bulletin PDF
  const [showBulletinForm, setShowBulletinForm] = useState(false);
  const [selectedAnneeScolaire, setSelectedAnneeScolaire] = useState("");
  const [selectedTypeNote, setSelectedTypeNote] = useState<TypeNote | "">("");
  const [loadingBulletin, setLoadingBulletin] = useState(false);
  const [anneesScolaires, setAnneesScolaires] = useState<string[]>([]);
  
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShow(true);
  }, []);

  // Charger les diplômes de l'étudiant
  const loadDiplomes = async () => {
    try {
      setLoadingDiplomes(true);
      const diplomesData = await consulterDiplomes(student.idStudent);
      setDiplomes(diplomesData);
    } catch (error: any) {
      console.error("Erreur chargement diplômes:", error);
      toast.error("Erreur lors du chargement des diplômes");
    } finally {
      setLoadingDiplomes(false);
    }
  };

  // Charger les diplômes disponibles
  const loadAvailableDiplomes = async () => {
    try {
      setLoadingAvailableDiplomes(true);
      const allDiplomes = await fetchDiplomes();
      // Filtrer les diplômes que l'étudiant n'a pas déjà
      const studentDiplomeIds = diplomes.map(d => d.idDiplome || d.id);
      const available = allDiplomes.filter(diplome => 
        !studentDiplomeIds.includes(diplome.idDiplome || diplome.id)
      );
      setAvailableDiplomes(available);
    } catch (error: any) {
      console.error("Erreur chargement diplômes disponibles:", error);
      toast.error("Erreur lors du chargement des diplômes disponibles");
    } finally {
      setLoadingAvailableDiplomes(false);
    }
  };

  // Charger les années scolaires disponibles
  const fetchAnneesScolaires = async () => {
    try {
      // Vous pouvez remplacer par un appel API pour récupérer les années spécifiques à l'étudiant
      // Pour l'instant, on utilise des années par défaut
      setAnneesScolaires(["2023-2024", "2024-2025", "2025-2026"]);
    } catch (error) {
      console.error("Erreur chargement années scolaires:", error);
      // Fallback aux années par défaut
      setAnneesScolaires(["2023-2024", "2024-2025", "2025-2026"]);
    }
  };

  // Charger les diplômes quand on ouvre la section
  useEffect(() => {
    if (showDiplomes && diplomes.length === 0) {
      loadDiplomes();
    }
  }, [showDiplomes]);

  // Charger les diplômes disponibles quand on ouvre la modale d'ajout
  useEffect(() => {
    if (showAddDiplome) {
      loadAvailableDiplomes();
    }
  }, [showAddDiplome]);

  // Charger les années scolaires quand on ouvre la modale bulletin
  useEffect(() => {
    if (showBulletinForm) {
      fetchAnneesScolaires();
    }
  }, [showBulletinForm]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300);
  };

  const generatePDF = async () => {
    try {
      // Appel au backend pour générer la carte scolaire
      const blob = await genererCartesScolaires([student.idStudent]);

      // Création d'un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CarteScolaire_${student.nom}_${student.prenom}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Nettoyage du lien temporaire
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Carte scolaire générée avec succès !");

    } catch (error: any) {
      console.error("Erreur lors du téléchargement de la carte scolaire:", error);
      toast.error("Échec du téléchargement de la carte scolaire");
    }
  };

  // Fonction pour générer le bulletin PDF
  const handleGenerateBulletin = async () => {
    if (!selectedAnneeScolaire || !selectedTypeNote) {
      toast.error("Veuillez sélectionner l'année scolaire et le type de note");
      return;
    }

    setLoadingBulletin(true);
    try {
      await downloadBulletinPDF(student.idStudent, selectedAnneeScolaire, selectedTypeNote);
      toast.success("Bulletin généré avec succès !");
      setShowBulletinForm(false);
      // Réinitialiser les sélections
      setSelectedAnneeScolaire("");
      setSelectedTypeNote("");
    } catch (error: any) {
      console.error("Erreur génération bulletin:", error);
      toast.error(error.message || "Erreur lors de la génération du bulletin");
    } finally {
      setLoadingBulletin(false);
    }
  };

  // Ajouter un diplôme à l'étudiant
  const handleAddDiplome = async (diplome: Diplome) => {
    const diplomeId = diplome.idDiplome || diplome.id;
    if (!diplomeId) {
      toast.error("ID du diplôme manquant");
      return;
    }

    try {
      setAddingDiplome(diplomeId);
      await ajouterDiplome(student.idStudent, diplomeId);
      toast.success("Diplôme ajouté avec succès !");
      setShowAddDiplome(false);
      
      // Recharger la liste des diplômes
      await loadDiplomes();
      
    } catch (error: any) {
      console.error("Erreur ajout diplôme:", error);
      toast.error(error.message || "Erreur lors de l'ajout du diplôme");
    } finally {
      setAddingDiplome(null);
    }
  };

  // Supprimer un diplôme
  const handleDeleteDiplome = async (diplomeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce diplôme ?")) return;

    try {
      setDeletingDiplome(diplomeId);
      await supprimerDiplome(student.idStudent, diplomeId);
      toast.success("Diplôme supprimé avec succès !");
      
      // Mettre à jour la liste localement
      setDiplomes(prev => prev.filter(d => 
        (d.idDiplome || d.id) !== diplomeId
      ));
      
    } catch (error: any) {
      console.error("Erreur suppression diplôme:", error);
      toast.error(error.message || "Erreur lors de la suppression du diplôme");
    } finally {
      setDeletingDiplome(null);
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
            Profil de l'Étudiant
          </h2>
          <div className="flex gap-2">
            {/* Bouton Bulletin PDF */}
            <button
              onClick={() => setShowBulletinForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm hover:opacity-90"
              style={{
                backgroundColor: "#0d68ae",
                color: "#ffffff",
              }}
            >
              <FiFileText />
              Bulletin PDF
            </button>
            
            <button
              onClick={() => setShowAddDiplome(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm hover:opacity-90"
              style={{
                backgroundColor: "#4CAF50",
                color: "#ffffff",
              }}
            >
              <FiPlus />
              Diplôme
            </button>
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm hover:opacity-90"
              style={{
                backgroundColor: "#eb7c78ff",
                color: "#ffffff",
              }}
            >
              <FiDownload />
              Carte PDF
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Section Photo et QR Code */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <img
                src={student.image || "/images/logo.png"}
                alt={`${student.nom} ${student.prenom}`}
                className="w-36 h-36 rounded-full object-cover shadow-lg border-4"
                style={{ borderColor: "#ef130cff" }}
              />
              
              {/* QR Code */}
              <div className="p-3 bg-white rounded-lg shadow-md">
                <QRCode
                  value={JSON.stringify({
                    matricule: student.matricule,
                    token: student.presenceToken || "no-token",
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

            {/* Informations principales */}
            <div className="flex-1 text-center md:text-left">
              <h1
                className="text-4xl font-extrabold mb-2 tracking-tight"
                style={{ color: "#424444ff" }}
              >
                {student.prenom} {student.nom}
              </h1>
              <p className="text-lg mb-4" style={{ color: "#ef130cff" }}>
                {student.matricule}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  {student.niveau}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  {student.groupe}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                  {student.statut}
                </span>
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
                <InfoRow label="Email" value={student.email} isEmail />
                <InfoRow label="Téléphone" value={student.telephone} isPhone />
                <InfoRow label="Date de Naissance" value={student.dateNaissance} />
                <InfoRow label="Lieu de Naissance" value={student.lieuNaissance} />
                <InfoRow label="Sexe" value={student.sexe} />
                <InfoRow label="Nationalité" value={student.nationalite} />
                <InfoRow label="Situation Familiale" value={student.situationFamiliale} />
              </div>
            </div>

            {/* Colonne droite - Informations académiques */}
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Informations Académiques
              </h3>
              <div className="space-y-3">
                <InfoRow label="Année Académique" value={student.anneeAcademique} />
                <InfoRow label="Niveau" value={student.niveau} />
                <InfoRow label="Groupe" value={student.groupe} />
                <InfoRow label="Statut" value={student.statut} />
                <InfoRow label="Boursier" value={student.bourse ? "Oui" : "Non"} />
                <InfoRow label="Handicap" value={student.handicap ? "Oui" : "Non"} />
                <InfoRow label="Adresse" value={student.adresse} />
                <InfoRow label="Ville" value={student.ville} />
              </div>
            </div>
          </div>

          {/* Section Diplômes */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: "#424444ff" }}>
                Diplômes Obtenus
              </h3>
              <button
                onClick={() => setShowDiplomes(!showDiplomes)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm hover:bg-gray-100"
                style={{ color: "#ef130cff" }}
              >
                <FiAward />
                {showDiplomes ? 'Masquer' : 'Afficher'} les diplômes
              </button>
            </div>

            {showDiplomes && (
              <div className="mt-4">
                {loadingDiplomes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ef130cff] mx-auto"></div>
                    <p className="text-gray-500 mt-2">Chargement des diplômes...</p>
                  </div>
                ) : diplomes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diplomes.map((diplome) => (
                      <DiplomeCard 
                        key={diplome.idDiplome || diplome.id} 
                        diplome={diplome}
                        onDelete={handleDeleteDiplome}
                        isDeleting={deletingDiplome === (diplome.idDiplome || diplome.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FiAward className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">Aucun diplôme obtenu</p>
                    <button
                      onClick={() => setShowAddDiplome(true)}
                      className="mt-2 px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors"
                    >
                      Ajouter un diplôme
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Champs personnalisés */}
          {student.customFields && student.customFields.length > 0 && (
            <div
              className="rounded-xl p-6 shadow-inner"
              style={{ backgroundColor: "#ccccccff" }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: "#424444ff" }}>
                Informations Complémentaires
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.customFields.map((field) => (
                  <div key={field.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <span className="font-semibold text-sm block mb-1" style={{ color: "#8a8a19" }}>
                      {field.fieldName}:
                    </span>
                    <span className="text-sm" style={{ color: "#171717" }}>
                      {field.fieldValue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Diplômes" 
              value={diplomes.length} 
              color="#ef130cff"
              icon={<FiAward />}
            />
            <StatCard 
              title="Modules" 
              value={student.modules?.length || 0} 
              color="#ccccccff"
              icon={<FiBook />}
            />
            <StatCard 
              title="Absences" 
              value={student.absences?.length || 0} 
              color="#8a8a19"
              icon={<FiCalendar />}
            />
          </div>
        </div>
      </div>

      {/* Modale d'ajout de diplôme */}
      {showAddDiplome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Ajouter un diplôme</h2>
                <button
                  onClick={() => setShowAddDiplome(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <p className="text-gray-600 mt-1">Sélectionnez un diplôme à ajouter</p>
            </div>

            <div className="p-6">
              {loadingAvailableDiplomes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ef130cff] mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement des diplômes disponibles...</p>
                </div>
              ) : availableDiplomes.length > 0 ? (
                <div className="space-y-3">
                  {availableDiplomes.map((diplome) => {
                    const diplomeId = diplome.idDiplome || diplome.id;
                    const isAdding = addingDiplome === diplomeId;
                    
                    return (
                      <div
                        key={diplomeId}
                        className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors ${
                          isAdding ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => !isAdding && handleAddDiplome(diplome)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{diplome.nomDiplome}</h4>
                            <p className="text-sm text-gray-600">{diplome.typeDiplome}</p>
                            <p className="text-sm text-gray-500">Niveau: {diplome.niveau}</p>
                            <p className="text-sm text-gray-500">Année: {diplome.anneeObtention}</p>
                          </div>
                          <button 
                            className={`${
                              isAdding ? 'text-blue-600' : 'text-green-600 hover:text-green-800'
                            }`}
                            disabled={isAdding}
                          >
                            {isAdding ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            ) : (
                              <FiPlus size={20} />
                            )}
                          </button>
                        </div>
                        {isAdding && (
                          <p className="text-blue-600 text-sm mt-2">Ajout en cours...</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiAward className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">Aucun diplôme disponible à ajouter</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Tous les diplômes ont déjà été attribués à cet étudiant
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale de sélection pour le bulletin PDF - NOUVEAU DESIGN */}
      {showBulletinForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300"
          onClick={() => {
            if (!loadingBulletin) {
              setShowBulletinForm(false);
              setSelectedAnneeScolaire("");
              setSelectedTypeNote("");
            }
          }}
        >
          <div 
            className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-transform duration-300 ${
              showBulletinForm ? "scale-100" : "scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec le même style que StudentProfile */}
            <div
              className="rounded-t-2xl p-5 flex justify-between items-center"
              style={{ backgroundColor: "#8f8f8bff" }}
            >
              <button
                onClick={() => {
                  setShowBulletinForm(false);
                  setSelectedAnneeScolaire("");
                  setSelectedTypeNote("");
                }}
                className="text-white hover:text-gray-200 transition-colors"
                disabled={loadingBulletin}
              >
                <FiX size={26} />
              </button>
              <h2 className="text-xl font-bold text-white text-center flex-1 mx-4">
                Générer le Bulletin
              </h2>
              <div className="w-8"></div> {/* Espace pour l'équilibre */}
            </div>

            {/* Contenu de la modale */}
            <div className="p-6 space-y-6">
              {/* Informations de l'étudiant */}
              <div className="text-center">
                <h3 className="text-lg font-semibold" style={{ color: "#424444ff" }}>
                  {student.prenom} {student.nom}
                </h3>
                <p className="text-sm" style={{ color: "#ef130cff" }}>
                  {student.matricule} • {student.niveau}
                </p>
              </div>

              {/* Formulaire de sélection */}
              <div className="space-y-4">
                {/* Sélection de l'année scolaire */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#8a8a19" }}>
                    Année Scolaire *
                  </label>
                  <select
                    value={selectedAnneeScolaire}
                    onChange={(e) => setSelectedAnneeScolaire(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={loadingBulletin}
                    onClick={(e) => e.stopPropagation()}
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <option value="">Sélectionnez une année</option>
                    {anneesScolaires.map((annee) => (
                      <option key={annee} value={annee}>
                        {annee}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sélection du type de note */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#8a8a19" }}>
                    Type d'Évaluation *
                  </label>
                  <select
                    value={selectedTypeNote}
                    onChange={(e) => setSelectedTypeNote(e.target.value as TypeNote)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={loadingBulletin}
                    onClick={(e) => e.stopPropagation()}
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="C1">Contrôle 1</option>
                    <option value="C2">Contrôle 2</option>
                    <option value="EXAMEN_TH">Examen Théorique</option>
                    <option value="EXAMEN_PR">Examen Pratique</option>
                    <option value="RATTRAPAGE">Rattrapage</option>
                  </select>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div 
                className="rounded-xl p-4"
                style={{ backgroundColor: "#ccccccff" }}
              >
                <div className="flex items-start gap-3">
                  <FiFileText className="mt-0.5" style={{ color: "#ef130cff" }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#424444ff" }}>
                      Information importante
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#171717" }}>
                      Le bulletin inclura toutes les notes de l'étudiant pour l'année 
                      et le type d'évaluation sélectionnés.
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowBulletinForm(false);
                    setSelectedAnneeScolaire("");
                    setSelectedTypeNote("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 font-medium"
                  disabled={loadingBulletin}
                >
                  Annuler
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateBulletin();
                  }}
                  disabled={loadingBulletin || !selectedAnneeScolaire || !selectedTypeNote}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: loadingBulletin ? "#8f8f8bff" : "#0d68ae",
                    color: "#ffffff",
                  }}
                >
                  {loadingBulletin ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <FiFileText />
                      Générer le PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  value: number;
  color: string;
  icon?: React.ReactNode;
}

const StatCard = ({ title, value, color, icon }: StatCardProps) => (
  <div className="bg-white rounded-lg p-4 shadow-md text-center">
    <div className="flex items-center justify-center gap-2 mb-2">
      {icon}
      <div className="text-3xl font-bold" style={{ color }}>
        {value}
      </div>
    </div>
    <div className="text-sm font-medium text-gray-600">{title}</div>
  </div>
);

// Composant pour afficher un diplôme
interface DiplomeCardProps {
  diplome: Diplome;
  onDelete: (diplomeId: string) => void;
  isDeleting?: boolean;
}

const DiplomeCard = ({ diplome, onDelete, isDeleting }: DiplomeCardProps) => {
  const diplomeId = diplome.idDiplome || diplome.id;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative">
      {/* Bouton de suppression */}
      <button
        onClick={() => onDelete(diplomeId)}
        disabled={isDeleting}
        className="absolute top-3 right-3 text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
        title="Supprimer le diplôme"
      >
        {isDeleting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
        ) : (
          <FiTrash2 size={16} />
        )}
      </button>

      <div className="flex items-start justify-between mb-3 pr-6">
        <div>
          <h4 className="font-bold text-lg" style={{ color: "#424444ff" }}>
            {diplome.nomDiplome}
          </h4>
          <p className="text-sm text-gray-600">{diplome.typeDiplome}</p>
        </div>
        {diplome.estValide && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Validé
          </span>
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium" style={{ color: "#8a8a19" }}>Niveau:</span>
          <span>{diplome.niveau}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium" style={{ color: "#8a8a19" }}>Mention:</span>
          <span>{diplome.mention}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium" style={{ color: "#8a8a19" }}>Année:</span>
          <span>{diplome.anneeObtention}</span>
        </div>
        
        {diplome.dateDelivrance && (
          <div className="flex justify-between">
            <span className="font-medium" style={{ color: "#8a8a19" }}>Délivré le:</span>
            <span>{new Date(diplome.dateDelivrance).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
        
        {diplome.modeRemise && (
          <div className="flex justify-between">
            <span className="font-medium" style={{ color: "#8a8a19" }}>Mode:</span>
            <span>{diplome.modeRemise}</span>
          </div>
        )}
        
        {diplome.commentaire && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <span className="font-medium" style={{ color: "#8a8a19" }}>Commentaire:</span>
            <p className="text-gray-600 mt-1">{diplome.commentaire}</p>
          </div>
        )}
      </div>
    </div>
  );
};