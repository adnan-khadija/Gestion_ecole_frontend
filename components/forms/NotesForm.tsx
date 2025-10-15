"use client";
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { fetchModulesByEnseignant, fetchStudentByModule } from "@/lib/modules";
import { fetchEnseignants } from "@/lib/enseignant";
import { getUserById } from "@/lib/auth";
import { addNote, updateNote, addNotes } from "@/lib/notes";
import { NoteRequest, EnseignantResponse, ModuleResponse, StudentResponse, NoteResponse, TypeNote, UserResponse, BulkNoteRequest } from "@/lib/types";
import toast from 'react-hot-toast';


interface EnseignantWithUser extends EnseignantResponse {
  user?: UserResponse;
}

// Nouveau type pour gérer plusieurs notes
interface StudentNote {
  studentId: string;
  nom: string;
  prenom: string;
  matricule: string;
  valeur: number;
}

export default function NotesForm() {
  // États pour les sélections
  const [enseignants, setEnseignants] = useState<EnseignantWithUser[]>([]);
  const [selectedEnseignant, setSelectedEnseignant] = useState<string>("");
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  
  // États existants
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedTypeNote, setSelectedTypeNote] = useState<TypeNote>(TypeNote.C1);
  const [valeurNote, setValeurNote] = useState<number>(0);
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState<{[key: string]: boolean}>({});

  // Nouveaux états pour la gestion multiple
  const [modeSaisie, setModeSaisie] = useState<"single" | "multiple">("single");
  const [notesMultiple, setNotesMultiple] = useState<StudentNote[]>([]);

  // Nouveaux états pour la mise à jour
  const [editingNote, setEditingNote] = useState<NoteResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Charger les étudiants et initialiser notesMultiple
  useEffect(() => {
    const loadStudents = async () => {
      if (selectedModule) {
        try {
          setLoading(true);
          const data = await fetchStudentByModule(selectedModule);
          setStudents(data);
          console.log("etudiant", data);
          
          // Initialiser le tableau des notes multiples
          setNotesMultiple(data.map(student => ({
            studentId: student.idStudent,
            nom: student.nom,
            prenom: student.prenom,
            matricule: student.matricule,
            valeur: 0
          })));
          
          setSelectedStudent(""); // Reset student selection
        } catch (error) {
          console.error("Erreur lors du chargement des étudiants:", error);
          toast.error("Erreur lors du chargement des étudiants");
        } finally {
          setLoading(false);
        }
      } else {
        setStudents([]);
        setNotesMultiple([]);
      }
    };
    loadStudents();
  }, [selectedModule]);

  // Fonction pour charger les données d'une note à modifier
  const handleEditNote = (note: NoteResponse) => {
    setEditingNote(note);
    setIsEditing(true);
    
    // Pré-remplir le formulaire avec les données de la note
    setSelectedEnseignant(note.enseignantId);
    setSelectedModule(note.moduleId);
    setSelectedStudent(note.studentId);
    setSelectedYear(note.anneeScolaire);
    setSelectedTypeNote(note.typeNote);
    setValeurNote(note.valeur);
    
    // Forcer le mode single pour l'édition
    setModeSaisie("single");
    
    toast.success("Note chargée pour modification");
  };

  // Fonction pour annuler l'édition
  const handleCancelEdit = () => {
    setEditingNote(null);
    setIsEditing(false);
    
    // Réinitialiser les champs sans tout effacer
    setSelectedStudent("");
    setSelectedTypeNote(TypeNote.C1);
    setValeurNote(0);
    
    toast.info("Modification annulée");
  };

  // Fonction pour mettre à jour la note
  const handleUpdateNote = async () => {
    if (!editingNote || !selectedStudent || !valeurNote) {
      toast.error("Données manquantes pour la modification");
      return;
    }

    try {
      setLoading(true);
      
      const updatedNote = await updateNote(editingNote.idNote, {
        ...editingNote,
        typeNote: selectedTypeNote,
        valeur: valeurNote,
        anneeScolaire: selectedYear,
      });

      // Mettre à jour la liste des notes
      setNotes(prev => prev.map(note => 
        note.idNote === editingNote.idNote ? updatedNote : note
      ));

      // Réinitialiser l'édition
      setEditingNote(null);
      setIsEditing(false);
      setValeurNote(0);
      
      toast.success("Note modifiée avec succès!");
    } catch (error) {
      console.error("Erreur lors de la modification de la note:", error);
      toast.error("Erreur lors de la modification de la note");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour une note dans le mode multiple
  const updateNoteMultiple = (studentId: string, valeur: number) => {
    setNotesMultiple(prev => 
      prev.map(note => 
        note.studentId === studentId ? { ...note, valeur } : note
      )
    );
  };

  // Fonction pour charger les informations utilisateur d'un enseignant
  const loadUserForEnseignant = async (enseignant: EnseignantResponse): Promise<EnseignantWithUser> => {
    try {
      setUserLoading(prev => ({...prev, [enseignant.enseignantId]: true}));
      const user = await getUserById(enseignant.userId);
      return {
        ...enseignant,
        user: user
      };
    } catch (error) {
      console.error(`Erreur lors du chargement de l'utilisateur pour l'enseignant ${enseignant.enseignantId}:`, error);
      return {
        ...enseignant,
        user: undefined
      };
    } finally {
      setUserLoading(prev => ({...prev, [enseignant.enseignantId]: false}));
    }
  };

  // Charger la liste des enseignants avec leurs informations utilisateur
  useEffect(() => {
    const loadEnseignants = async () => {
      try {
        setLoading(true);
        const data = await fetchEnseignants();
        
        // Charger les informations utilisateur pour chaque enseignant
        const enseignantsWithUsers = await Promise.all(
          data.map(enseignant => loadUserForEnseignant(enseignant))
        );
        
        setEnseignants(enseignantsWithUsers);
      } catch (error) {
        console.error("Erreur lors du chargement des enseignants:", error);
        toast.error("Erreur lors du chargement des enseignants");
      } finally {
        setLoading(false);
      }
    };
    loadEnseignants();
  }, []);

  // Charger les modules quand un enseignant est sélectionné
  useEffect(() => {
    const loadModules = async () => {
      if (selectedEnseignant) {
        try {
          setLoading(true);
          const data = await fetchModulesByEnseignant(selectedEnseignant);
          setModules(data);
          if (!isEditing) {
            setSelectedModule(""); // Reset module selection seulement si pas en mode édition
          }
          setStudents([]); // Reset students
          setNotesMultiple([]); // Reset notes multiples
        } catch (error) {
          console.error("Erreur lors du chargement des modules:", error);
          toast.error("Erreur lors du chargement des modules");
        } finally {
          setLoading(false);
        }
      } else {
        setModules([]);
      }
    };
    loadModules();
  }, [selectedEnseignant, isEditing]);

  // Fonction pour obtenir le nom complet d'un enseignant
  const getEnseignantDisplayName = (enseignant: EnseignantWithUser) => {
    if (enseignant.user) {
      return `${enseignant.user.nom} ${enseignant.user.prenom}`;
    }
    return `Enseignant ${enseignant.enseignantId}`;
  };

  // Gestion de l'ajout de note (mode simple)
  const handleAddNote = async () => {
    if (!selectedStudent || !selectedModule || !selectedEnseignant || !selectedYear) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const noteRequest: NoteRequest = {
      studentId: selectedStudent,
      moduleId: selectedModule,
      typeNote: selectedTypeNote,
      valeur: valeurNote,
      enseignantId: selectedEnseignant,
      anneeScolaire: selectedYear,
    };

    try {
      setLoading(true);
      const newNote = await addNote(noteRequest);
      setNotes(prev => [...prev, newNote]);
      
      // Réinitialiser les champs de note
      setValeurNote(0);
      toast.success("Note ajoutée avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la note:", error);
      toast.error("Erreur lors de l'ajout de la note");
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'ajout de notes multiples
  const handleAddMultipleNotes = async () => {
    if (!selectedModule || !selectedEnseignant || !selectedYear) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Filtrer les étudiants qui ont une note
    const notesAEnregistrer = notesMultiple.filter(note => note.valeur > 0);

    if (notesAEnregistrer.length === 0) {
      toast.error("Veuillez saisir au moins une note");
      return;
    }

    try {
      setLoading(true);
      
      // Créer les requêtes de notes
      const notesRequests: NoteRequest[] = notesAEnregistrer.map(note => ({
        studentId: note.studentId,
        moduleId: selectedModule,
        typeNote: selectedTypeNote,
        valeur: note.valeur,
        enseignantId: selectedEnseignant,
        anneeScolaire: selectedYear,
      }));

      const bulkRequest: BulkNoteRequest = {
        enseignantId: selectedEnseignant,
        notes: notesRequests.map(note => ({
          studentId: note.studentId,
          moduleId: note.moduleId,
          typeNote: note.typeNote,
          valeur: note.valeur,
          anneeScolaire: note.anneeScolaire,
        }))
      };

      const newNotes = await addNotes(bulkRequest);
      setNotes(prev => [...prev, ...newNotes]);
      
      // Réinitialiser les notes multiples
      setNotesMultiple(prev => prev.map(note => ({ ...note, valeur: 0 })));
      toast.success(`${notesAEnregistrer.length} note(s) ajoutée(s) avec succès!`);
    } catch (error) {
      console.error("Erreur lors de l'ajout des notes:", error);
      toast.error("Erreur lors de l'ajout des notes");
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la réinitialisation
  const handleReset = () => {
    setSelectedEnseignant("");
    setSelectedModule("");
    setSelectedStudent("");
    setSelectedYear("");
    setSelectedTypeNote(TypeNote.C1);
    setValeurNote(0);
    setNotes([]);
    setNotesMultiple([]);
    setModeSaisie("single");
    setEditingNote(null);
    setIsEditing(false);
    toast.success("Formulaire réinitialisé");
  };

  // Générer PDF (adapté pour plusieurs notes)
  const generatePDF = () => {
    const notesAInclure = modeSaisie === "single" 
      ? notes.filter(note => note.studentId === selectedStudent && note.moduleId === selectedModule)
      : notes.filter(note => note.moduleId === selectedModule && note.typeNote === selectedTypeNote);

    if (notesAInclure.length === 0) {
      toast.error("Aucune note à exporter");
      return;
    }
    
    const module = modules.find((m) => m.idModule === selectedModule);
    const enseignant = enseignants.find((e) => e.enseignantId === selectedEnseignant);

    if (!module || !enseignant) {
      toast.error("Données manquantes pour générer le PDF");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    // En-tête
    doc.setFontSize(16);
    doc.text("FICHE DE NOTES", 105, 20, { align: "center" });

    // Informations générales
    const infoStartY = 40;
    doc.setFontSize(11);
    doc.text(`Année Scolaire: ${selectedYear}`, 20, infoStartY);
    doc.text(`Enseignant: ${getEnseignantDisplayName(enseignant)}`, 20, infoStartY + 7);
    doc.text(`Module: ${module.nom}`, 20, infoStartY + 14);
    doc.text(`Type de note: ${selectedTypeNote}`, 20, infoStartY + 21);

    // Tableau des notes
    const startY = infoStartY + 35;
    doc.setFillColor(212, 160, 23);
    doc.setTextColor(255, 255, 255);
    doc.setFontStyle("bold");
    
    // En-tête du tableau
    doc.rect(20, startY, 170, 8, "FD");
    doc.text("Étudiant", 25, startY + 6);
    doc.text("Matricule", 80, startY + 6);
    doc.text("Valeur", 130, startY + 6);
    doc.text("Date", 160, startY + 6);

    doc.setTextColor(0, 0, 0);
    doc.setFontStyle("normal");
    
    // Données des notes
    let currentY = startY + 8;
    notesAInclure.forEach((note) => {
      const student = students.find(s => s.idStudent === note.studentId);
      if (student) {
        doc.rect(20, currentY, 170, 8);
        doc.text(`${student.nom} ${student.prenom}`, 25, currentY + 6);
        doc.text(student.matricule, 80, currentY + 6);
        doc.text(note.valeur.toString(), 130, currentY + 6);
        doc.text(new Date(note.dateCreation).toLocaleDateString(), 160, currentY + 6);
        currentY += 8;
      }
    });

    // Signature
    currentY += 20;
    doc.text("Signature de l'enseignant", 130, currentY);
    doc.rect(130, currentY + 5, 60, 25);

    const fileName = modeSaisie === "single" 
      ? `Note_${students.find(s => s.idStudent === selectedStudent)?.nom}_${module.nom}.pdf`
      : `Notes_${module.nom}_${selectedTypeNote}.pdf`;

    doc.save(fileName);
    toast.success("PDF généré avec succès!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-black mb-6 pb-4 border-b border-gray-100">
            {isEditing ? "Modifier une Note" : "Saisie des Notes"}
          </h2>

          {/* Indicateur de mode édition */}
          {isEditing && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 font-semibold">📝 Mode édition</span>
                  <span className="text-blue-600 text-sm">
                    Modification de la note pour {students.find(s => s.idStudent === selectedStudent)?.nom} {students.find(s => s.idStudent === selectedStudent)?.prenom}
                  </span>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
          
          {/* Nouvelle section : Mode de saisie */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
            <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
              Mode de saisie
            </h3>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="modeSaisie"
                  value="single"
                  checked={modeSaisie === "single"}
                  onChange={(e) => setModeSaisie(e.target.value as "single" | "multiple")}
                  className="text-[#D4A017] focus:ring-[#D4A017]"
                  disabled={isEditing}
                />
                <span className={`text-sm font-medium ${isEditing ? 'text-gray-400' : 'text-black'}`}>
                  Saisie individuelle
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="modeSaisie"
                  value="multiple"
                  checked={modeSaisie === "multiple"}
                  onChange={(e) => setModeSaisie(e.target.value as "single" | "multiple")}
                  className="text-[#D4A017] focus:ring-[#D4A017]"
                  disabled={isEditing}
                />
                <span className={`text-sm font-medium ${isEditing ? 'text-gray-400' : 'text-black'}`}>
                  Saisie multiple
                </span>
              </label>
            </div>
          </div>

          {/* Section Sélections principales */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
            <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
              Sélections principales
            </h3>
            <div className="space-y-4">
              {/* Sélection Enseignant */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">Enseignant *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  value={selectedEnseignant}
                  onChange={(e) => setSelectedEnseignant(e.target.value)}
                  disabled={loading || isEditing}
                >
                  <option value="">-- Sélectionner un enseignant --</option>
                  {enseignants.map((enseignant) => (
                    <option key={enseignant.enseignantId} value={enseignant.enseignantId}>
                      {userLoading[enseignant.enseignantId] ? (
                        "Chargement..."
                      ) : (
                        getEnseignantDisplayName(enseignant)
                      )}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection Module */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">Module *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  disabled={!selectedEnseignant || loading || isEditing}
                >
                  <option value="">-- Sélectionner un module --</option>
                  {modules.map((module) => (
                    <option key={module.idModule} value={module.idModule}>
                      {module.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection Étudiant (seulement en mode simple) */}
              {modeSaisie === "single" && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black">Étudiant *</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    disabled={!selectedModule || loading || isEditing}
                  >
                    <option value="">-- Sélectionner un étudiant --</option>
                    {students.map((student) => (
                      <option key={student.idStudent} value={student.idStudent}>
                        {student.nom} {student.prenom} ({student.matricule})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section Informations de la note */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
            <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
              Informations de la note
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Année scolaire */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">Année Scolaire *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={isEditing}
                >
                  <option value="">-- Sélectionner l'année --</option>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                </select>
              </div>

              {/* Type de note */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">Type de Note *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  value={selectedTypeNote}
                  onChange={(e) => setSelectedTypeNote(e.target.value as TypeNote)}
                >
                  <option value="">-- Sélectionner le type de note --</option>
                  {Object.keys(TypeNote).map((key) => (
                    <option key={key} value={key}>
                      {TypeNote[key as keyof typeof TypeNote]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Valeur de la note (seulement en mode simple) */}
              {modeSaisie === "single" && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black">Valeur *</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                    value={valeurNote}
                    onChange={(e) => setValeurNote(Number(e.target.value))}
                    placeholder="0.0 - 20.0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section Saisie multiple des notes */}
          {modeSaisie === "multiple" && students.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
              <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                Saisie des notes pour tous les étudiants
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notesMultiple.map((studentNote) => (
                  <div key={studentNote.studentId} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {studentNote.nom} {studentNote.prenom}
                      </p>
                      <p className="text-xs text-gray-600">{studentNote.matricule}</p>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all text-sm"
                        value={studentNote.valeur}
                        onChange={(e) => updateNoteMultiple(studentNote.studentId, Number(e.target.value))}
                        placeholder="0.0 - 20.0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 mt-8">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="px-6 py-3 text-sm bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateNote}
                  disabled={loading || !valeurNote}
                  className="px-6 py-3 text-sm bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Modification..." : "Modifier Note"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-3 text-sm bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={modeSaisie === "single" ? handleAddNote : handleAddMultipleNotes}
                  disabled={loading || 
                    (modeSaisie === "single" ? (!selectedStudent || !valeurNote) : 
                     (notesMultiple.filter(note => note.valeur > 0).length === 0))}
                  className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg hover:bg-[#B38C0F] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Ajout..." : modeSaisie === "single" ? "Ajouter Note" : `Ajouter ${notesMultiple.filter(note => note.valeur > 0).length} Note(s)`}
                </button>
                {notes.length > 0 && (
                  <button
                    onClick={generatePDF}
                    className="px-6 py-3 text-sm bg-[#0d68ae] text-white font-medium rounded-lg hover:bg-[#0a5490] transition-all"
                  >
                    Télécharger PDF
                  </button>
                )}
              </>
            )}
          </div>

          {/* Liste des notes ajoutées */}
          {notes.length > 0 && (
            <div className="mt-8 bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                Notes enregistrées ({notes.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#D4A017] text-white">
                    <tr>
                      <th className="p-3 text-left font-semibold">Étudiant</th>
                      <th className="p-3 text-left font-semibold">Type de Note</th>
                      <th className="p-3 text-left font-semibold">Valeur</th>
                      <th className="p-3 text-left font-semibold">Date</th>
                      <th className="p-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes
                      .filter(note => modeSaisie === "single" 
                        ? (note.studentId === selectedStudent && note.moduleId === selectedModule)
                        : (note.moduleId === selectedModule)
                      )
                      .map((note) => {
                        const student = students.find(s => s.idStudent === note.studentId);
                        return (
                          <tr key={note.idNote} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="p-3 text-gray-700">
                              {student ? `${student.nom} ${student.prenom}` : note.studentId}
                            </td>
                            <td className="p-3 text-gray-700">{note.typeNote}</td>
                            <td className="p-3 text-gray-700 font-medium">{note.valeur}</td>
                            <td className="p-3 text-gray-700">
                              {new Date(note.dateCreation).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleEditNote(note)}
                                disabled={isEditing}
                                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Modifier
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}