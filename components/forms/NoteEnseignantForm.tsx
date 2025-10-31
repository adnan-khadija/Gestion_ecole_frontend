'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaUsers, FaBook } from 'react-icons/fa';
import { StudentResponse, NoteRequest, NoteResponse, TypeNote } from '@/lib/types';
import { addNote, updateNote, addNotes } from '@/lib/notes';
import { fetchCurrentUser, fetchCurrentEnseignant } from '@/lib/auth';
import toast from 'react-hot-toast';

interface NoteFormProps {
  moduleId: string;
  moduleName: string;
  students: StudentResponse[];
  onSuccess?: (result: NoteResponse | NoteResponse[]) => void;
  onCancel?: () => void;
  existingNote?: NoteResponse;
}

// Interface pour gérer les notes multiples
interface StudentNote {
  studentId: string;
  nom: string;
  prenom: string;
  valeur: number;
  coefficient: number;
}

const NoteForm = ({ 
  moduleId, 
  moduleName, 
  students, 
  onSuccess, 
  onCancel,
  existingNote 
}: NoteFormProps) => {
  const [formData, setFormData] = useState({
    studentId: '',
    moduleId: moduleId,
    typeNote: TypeNote.C1,
    valeur: 0,
    enseignantId: '',
    anneeScolaire: new Date().getFullYear().toString(),
    coefficient: 1,
    commentaire: '',
    dateEvaluation: new Date().toISOString().split('T')[0]
  });
  
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Nouvel état pour gérer les notes multiples
  const [bulkNotes, setBulkNotes] = useState<StudentNote[]>([]);

  // Charger l'ID de l'enseignant connecté
  useEffect(() => {
    const loadEnseignantId = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        const userData = currentUser.data || currentUser;
        const enseignantData = await fetchCurrentEnseignant(userData.email);
        
        setFormData(prev => ({
          ...prev,
          enseignantId: enseignantData.enseignantId
        }));
      } catch (error) {
        console.error('Erreur chargement enseignant:', error);
        toast.error('Erreur lors du chargement des données enseignant');
      }
    };

    loadEnseignantId();
  }, []);

  // Initialiser avec les données existantes en mode édition
  useEffect(() => {
    if (existingNote) {
      setFormData(prev => ({
        ...prev,
        studentId: existingNote.studentId,
        typeNote: existingNote.typeNote,
        valeur: existingNote.valeur,
        coefficient: existingNote.coefficient,
        commentaire: existingNote.commentaire || '',
        dateEvaluation: existingNote.dateEvaluation.split('T')[0]
      }));
      setSelectedStudents([existingNote.studentId]);
      setBulkMode(false);
    }
  }, [existingNote]);

  // Initialiser les notes multiples quand les étudiants changent ou qu'on passe en mode bulk
  useEffect(() => {
    if (bulkMode && students.length > 0) {
      const initialBulkNotes = students.map(student => ({
        studentId: student.idStudent,
        nom: student.nom,
        prenom: student.prenom,
        valeur: 0,
        coefficient: formData.coefficient
      }));
      setBulkNotes(initialBulkNotes);
    }
  }, [bulkMode, students, formData.coefficient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (bulkMode) {
        // Mode bulk - créer plusieurs notes
        const notesAEnregistrer = bulkNotes.filter(note => note.valeur > 0);
        
        if (notesAEnregistrer.length === 0) {
          throw new Error('Veuillez saisir au moins une note');
        }

        const bulkRequests = notesAEnregistrer.map(note => ({
          studentId: note.studentId,
          moduleId,
          typeNote: formData.typeNote,
          valeur: note.valeur,
          enseignantId: formData.enseignantId,
          anneeScolaire: formData.anneeScolaire,
          coefficient: note.coefficient,
          commentaire: formData.commentaire,
          dateEvaluation: formData.dateEvaluation
        }));

        const results = await Promise.all(
          bulkRequests.map(request => addNote(request))
        );
        onSuccess?.(results);
        toast.success(`${notesAEnregistrer.length} note(s) ajoutée(s) avec succès !`);
      } else {
        // Mode single note
        const noteRequest: NoteRequest = {
          studentId: formData.studentId,
          moduleId,
          typeNote: formData.typeNote,
          valeur: formData.valeur,
          enseignantId: formData.enseignantId,
          anneeScolaire: formData.anneeScolaire,
          coefficient: formData.coefficient,
          commentaire: formData.commentaire,
          dateEvaluation: formData.dateEvaluation
        };

        let result;
        if (existingNote) {
          result = await updateNote(existingNote.idNote, noteRequest);
          toast.success("Note modifiée avec succès !");
        } else {
          result = await addNote(noteRequest);
          toast.success("Note ajoutée avec succès !");
        }
        onSuccess?.(result);
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde note:', error);
      const errorMessage = error.message || 'Erreur lors de la sauvegarde de la note';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const isStudentSelected = (studentId: string) => {
    return selectedStudents.includes(studentId);
  };

  // Gérer le changement de note pour un étudiant en mode bulk
  const handleBulkNoteChange = (studentId: string, field: 'valeur' | 'coefficient', value: number) => {
    setBulkNotes(prev => 
      prev.map(note => 
        note.studentId === studentId ? { ...note, [field]: value } : note
      )
    );
  };

  // Mettre à jour tous les coefficients en mode bulk
  const handleGlobalCoefficientChange = (value: number) => {
    setFormData(prev => ({ ...prev, coefficient: value }));
    setBulkNotes(prev => 
      prev.map(note => ({ ...note, coefficient: value }))
    );
  };

  // Réinitialiser la sélection des étudiants quand on change de mode
  useEffect(() => {
    if (!existingNote) {
      setSelectedStudents([]);
      setFormData(prev => ({ ...prev, studentId: '' }));
    }
  }, [bulkMode, existingNote]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Calculer le nombre d'étudiants avec des notes saisies
  const getNotesSaisiesCount = () => {
    return bulkNotes.filter(note => note.valeur > 0).length;
  };

  return (

      <div className="w-full h-full bg-white flex flex-col max">
    {/* En-tête avec bouton de fermeture */}
    <div className="flex justify-between items-center p-6 border-b border-gray-200">
      <h3 className="text-xl font-bold text-gray-800">
        {existingNote ? 'Modifier la note' : 'Ajouter une note'}
      </h3>
      <button 
        onClick={onCancel} 
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <FaTimes size={20} />
      </button>
    </div>

       <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Informations du module */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
            Informations du module
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-black">Module</label>
              <p className="text-sm text-gray-700 font-medium">{moduleName}</p>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-black">Étudiants disponibles</label>
              <p className="text-sm text-gray-700 font-medium">{students.length} étudiant(s)</p>
            </div>
          </div>
        </div>

        {/* Mode de saisie - seulement pour l'ajout, pas pour l'édition */}
        {!existingNote && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
              Mode de saisie
            </h3>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setBulkMode(false)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  !bulkMode 
                    ? 'border-[#D4A017] bg-[#F5E9DA] text-[#B38C0F] font-medium' 
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Note individuelle
              </button>
              <button
                type="button"
                onClick={() => setBulkMode(true)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  bulkMode 
                    ? 'border-[#D4A017] bg-[#F5E9DA] text-[#B38C0F] font-medium' 
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Notes collectives
              </button>
            </div>
          </div>
        )}

        {/* Indicateur de mode édition */}
        {existingNote && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium">
              📝 Mode édition - Modification de la note existante
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Informations de l'évaluation */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
              Informations de l'évaluation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type d'évaluation */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">
                  Type d'évaluation *
                </label>
                <select
                  name="typeNote"
                  value={formData.typeNote}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  required
                >
                  <option value="">Sélectionner le type de note</option>
                  {Object.keys(TypeNote).map((key) => (
                    <option key={key} value={key}>
                      {TypeNote[key as keyof typeof TypeNote]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date d'évaluation */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">
                  Date d'évaluation *
                </label>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-[#D4A017]" />
                  <input
                    type="date"
                    name="dateEvaluation"
                    value={formData.dateEvaluation}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Note (seulement en mode individuel) */}
              {!bulkMode && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black">
                    Note /20 *
                  </label>
                  <input
                    type="number"
                    name="valeur"
                    min="0"
                    max="20"
                    step="0.25"
                    value={formData.valeur}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                    required
                  />
                </div>
              )}

              {/* Coefficient */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">
                  Coefficient {bulkMode ? '(appliqué à tous)' : ''} *
                </label>
                <input
                  type="number"
                  name="coefficient"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={formData.coefficient}
                  onChange={bulkMode ? (e) => handleGlobalCoefficientChange(parseFloat(e.target.value) || 1) : handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section Sélection des étudiants */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
              {bulkMode ? 'Saisie des notes par étudiant' : 'Sélection de l\'étudiant'}
            </h3>

            {bulkMode ? (
              // Mode bulk - saisie individuelle pour chaque étudiant
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-black">
                    Saisissez les notes pour chaque étudiant ({getNotesSaisiesCount()}/{students.length} notes saisies)
                  </label>
                </div>
                
                <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                  {students.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Aucun étudiant disponible pour ce module
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {bulkNotes.map((studentNote) => (
                        <div key={studentNote.studentId} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between gap-4">
                            {/* Informations de l'étudiant */}
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-[#D4A017] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {studentNote.nom.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {studentNote.nom} {studentNote.prenom}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Coefficient: {studentNote.coefficient}
                                </p>
                              </div>
                            </div>

                            {/* Champ de saisie de note */}
                            <div className="w-24">
                              <label className="block text-xs font-medium text-gray-700 mb-1 text-center">
                                Note /20
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                value={studentNote.valeur || ''}
                                onChange={(e) => handleBulkNoteChange(studentNote.studentId, 'valeur', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] text-center transition-all"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          
                          {/* Indicateur visuel de note saisie */}
                          {studentNote.valeur > 0 && (
                            <div className="mt-2 flex justify-end">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                studentNote.valeur >= 10 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {studentNote.valeur >= 10 ? '✓ Validé' : '⚠ En échec'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Résumé des notes saisies */}
                {getNotesSaisiesCount() > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700 text-center">
                      <strong>{getNotesSaisiesCount()}</strong> note(s) prête(s) à être enregistrée(s)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Mode single - sélection unique
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">
                  Sélectionnez un étudiant *
                </label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  required
                >
                  <option value="">Sélectionnez un étudiant</option>
                  {students.map(student => (
                    <option key={student.idStudent} value={student.idStudent}>
                      {student.nom} {student.prenom} - {student.niveau} ({student.groupe})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section Commentaire */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
              Commentaire
            </h3>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-black">
                Observations (optionnel)
              </label>
              <textarea
                name="commentaire"
                value={formData.commentaire}
                onChange={handleChange}
                rows={3}
                placeholder="Observations sur la note..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.commentaire.length}/500 caractères
              </p>
            </div>
          </div>

          {/* Section Résumé de l'opération */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-semibold text-yellow-800 mb-2 text-sm">Résumé de l'opération</h5>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• <strong>{bulkMode ? getNotesSaisiesCount() : 1} étudiant(s)</strong> concerné(s)</p>
              <p>• Date : <strong>{new Date(formData.dateEvaluation).toLocaleDateString('fr-FR')}</strong></p>
              <p>• Module : <strong>{moduleName}</strong></p>
              <p>• Type : <strong>{formData.typeNote}</strong></p>
              {bulkMode ? (
                <p>• Coefficient : <strong>{formData.coefficient} (appliqué à tous)</strong></p>
              ) : (
                <p>• Note : <strong>{formData.valeur}/20</strong> (coeff. {formData.coefficient})</p>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 text-sm bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || 
                (!bulkMode && (!formData.studentId || formData.valeur === 0)) || 
                (bulkMode && getNotesSaisiesCount() === 0)
              }
              className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg hover:bg-[#B38C0F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Traitement...
                </>
              ) : (
                <>
                  {existingNote ? 'Modifier' : 'Enregistrer'} 
                  {bulkMode && getNotesSaisiesCount() > 0 && ` (${getNotesSaisiesCount()})`}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;