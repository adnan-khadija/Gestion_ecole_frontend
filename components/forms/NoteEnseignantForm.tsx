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
    typeNote: TypeNote.C1, // Utilisation de l'enum directement
    valeur: 0,
    enseignantId: '', // Sera rempli avec useEffect
    anneeScolaire: new Date().getFullYear().toString(),
    coefficient: 1,
    commentaire: '',
    dateEvaluation: new Date().toISOString().split('T')[0]
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setBulkMode(false); // Forcer le mode individuel pour l'édition
    }
  }, [existingNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (bulkMode && selectedStudents.length > 0) {
        // Mode bulk - créer plusieurs notes
        const bulkRequests = selectedStudents.map(studentId => ({
          studentId,
          moduleId,
          typeNote: formData.typeNote,
          valeur: formData.valeur,
          enseignantId: formData.enseignantId,
          anneeScolaire: formData.anneeScolaire,
          coefficient: formData.coefficient,
          commentaire: formData.commentaire,
          dateEvaluation: formData.dateEvaluation
        }));

        const results = await Promise.all(
          bulkRequests.map(request => addNote(request))
        );
        onSuccess?.(results);
      } else if (!bulkMode && formData.studentId) {
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
        } else {
          result = await addNote(noteRequest);
        }
        onSuccess?.(result);
      } else {
        throw new Error('Veuillez sélectionner au moins un étudiant');
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde note:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde de la note');
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

  // Réinitialiser la sélection des étudiants quand on change de mode
  useEffect(() => {
    if (!existingNote) {
      setSelectedStudents([]);
      setFormData(prev => ({ ...prev, studentId: '' }));
    }
  }, [bulkMode, existingNote]);

  // Fonction pour obtenir les options de type de note
  const getTypeNoteOptions = () => {
    return Object.entries(TypeNote).map(([key, value]) => ({
      key,
      value,
      label: value // Le label affiché (ex: "Contrôle 1")
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            {existingNote ? 'Modifier la note' : 'Ajouter une note'}
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Informations du module */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <FaBook />
              Module: {moduleName}
            </h4>
            <p className="text-sm text-blue-600">
              ID: {moduleId} | {students.length} étudiant(s) inscrit(s)
            </p>
          </div>

          {/* Mode de saisie - seulement pour l'ajout, pas pour l'édition */}
          {!existingNote && (
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setBulkMode(false)}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  !bulkMode 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-600'
                }`}
              >
                Note individuelle
              </button>
              <button
                type="button"
                onClick={() => setBulkMode(true)}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  bulkMode 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-300 bg-white text-gray-600'
                }`}
              >
                Notes collectives
              </button>
            </div>
          )}

          {/* Indicateur de mode édition */}
          {existingNote && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                📝 Mode édition - Modification de la note existante
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type d'évaluation */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Type d'évaluation *
                </label>
                <select
                  value={formData.typeNote}
                  onChange={(e) => setFormData({...formData, typeNote: e.target.value as TypeNote})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value=""> Sélectionner le type de note </option>
                                   {Object.keys(TypeNote).map((key) => (
                                     <option key={key} value={key}>
                                       {TypeNote[key as keyof typeof TypeNote]}
                                     </option>
                                   ))}
                </select>
              </div>

              {/* Date d'évaluation */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Date d'évaluation *
                </label>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-blue-600" />
                  <input
                    type="date"
                    value={formData.dateEvaluation}
                    onChange={(e) => setFormData({...formData, dateEvaluation: e.target.value})}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Note /20 *
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.25"
                  value={formData.valeur}
                  onChange={(e) => setFormData({...formData, valeur: parseFloat(e.target.value) || 0})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Coefficient */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Coefficient *
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={formData.coefficient}
                  onChange={(e) => setFormData({...formData, coefficient: parseFloat(e.target.value) || 1})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Sélection des étudiants */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaUsers />
                {bulkMode ? 'Sélectionnez les étudiants' : 'Sélectionnez un étudiant'}
                {bulkMode && selectedStudents.length > 0 && (
                  <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {selectedStudents.length} sélectionné(s)
                  </span>
                )}
              </h4>

              {bulkMode ? (
                // Mode bulk - sélection multiple
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {students.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Aucun étudiant disponible pour ce module
                    </div>
                  ) : (
                    students.map(student => (
                      <label
                        key={student.idStudent}
                        className={`flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                          isStudentSelected(student.idStudent)
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isStudentSelected(student.idStudent)}
                          onChange={() => handleStudentSelection(student.idStudent)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {student.nom?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {student.nom} {student.prenom}
                          </p>
                          <p className="text-xs text-gray-500">
                            {student.niveau} - Groupe {student.groupe}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              ) : (
                // Mode single - sélection unique
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionnez un étudiant</option>
                  {students.map(student => (
                    <option key={student.idStudent} value={student.idStudent}>
                      {student.nom} {student.prenom} - {student.niveau} ({student.groupe})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={formData.commentaire}
                onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                rows={3}
                placeholder="Observations sur la note..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.commentaire.length}/500 caractères
              </p>
            </div>

            {/* Résumé de l'opération */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-800 mb-2">Résumé</h5>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• <strong>{bulkMode ? selectedStudents.length : 1} étudiant(s)</strong> concerné(s)</p>
                <p>• Date : <strong>{new Date(formData.dateEvaluation).toLocaleDateString('fr-FR')}</strong></p>
                <p>• Module : <strong>{moduleName}</strong></p>
                <p>• Type : <strong>{formData.typeNote}</strong></p>
                <p>• Note : <strong>{formData.valeur}/20</strong> (coeff. {formData.coefficient})</p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || 
                  (!bulkMode && !formData.studentId) || 
                  (bulkMode && selectedStudents.length === 0) ||
                  formData.valeur === 0
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    {existingNote ? 'Modifier' : 'Enregistrer'} 
                    {bulkMode && selectedStudents.length > 0 && ` (${selectedStudents.length})`}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NoteForm;