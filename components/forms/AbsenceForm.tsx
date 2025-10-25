'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaUsers, FaUser } from 'react-icons/fa';
import { StudentResponse, AbsenceRequest, AbsenceResponse, AbsenceReason } from '@/lib/types';
import { absenceService } from '@/lib/absence';
import toast from 'react-hot-toast';

// Interface pour les créneaux formatés
interface CreneauFormate {
  id: string;
  heureDebut: string;
  heureFin: string;
  groupe: string;
  jour: string;
  display: string;
  moduleId: string;
  moduleName: string;
  salle: string;
  typeSeance: string;
}

// Props du composant AbsenceForm
interface AbsenceFormProps {
  students: StudentResponse[];
  selectedStudents: string[];
  moduleId: string;
  moduleName: string;
  creneau: CreneauFormate;
  onSuccess?: (result: AbsenceResponse | AbsenceResponse[]) => void;
  onCancel?: () => void;
  mode: 'create' | 'edit';
  // Props optionnels pour l'édition d'absence existante
  existingAbsence?: AbsenceResponse;
}

const AbsenceForm = ({ 
  students, 
  selectedStudents, 
  moduleId, 
  moduleName, 
  creneau, 
  onSuccess, 
  onCancel, 
  mode,
  existingAbsence 
}: AbsenceFormProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Date du jour par défaut
    reason: AbsenceReason.MALADIE,
    justified: false,
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedStudentsLocal, setSelectedStudentsLocal] = useState<string[]>(selectedStudents);
  const [error, setError] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  // Animation d'entrée
  useEffect(() => {
    setIsVisible(true);
    
    // Désactiver le scroll du body
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Initialiser avec les données existantes en mode édition
  useEffect(() => {
    if (mode === 'edit' && existingAbsence) {
      setFormData({
        date: existingAbsence.date,
        reason: existingAbsence.reason,
        justified: existingAbsence.justified,
        comment: existingAbsence.enseignantComment || ''
      });
      setSelectedStudentsLocal([existingAbsence.studentId]);
    } else {
      // Mode création - utiliser les étudiants sélectionnés
      setSelectedStudentsLocal(selectedStudents);
    }
  }, [mode, existingAbsence, selectedStudents]);

  const selectedStudentsData = students.filter(student => 
    selectedStudentsLocal.includes(student.idStudent)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (selectedStudentsLocal.length === 0) {
      setError('Veuillez sélectionner au moins un étudiant');
      setLoading(false);
      return;
    }

    if (!formData.date) {
      setError('Veuillez sélectionner une date');
      setLoading(false);
      return;
    }

    try {
      const absenceRequest: AbsenceRequest = {
        moduleId,
        date: formData.date,
        studentIds: selectedStudentsLocal,
        reason: formData.reason,
        justified: formData.justified,
        enseignantComment: formData.comment
      };

      console.log(`${mode === 'edit' ? 'Modification' : 'Création'} absence avec:`, absenceRequest);

      let result;
      if (mode === 'edit' && existingAbsence) {
        // Mode édition - mettre à jour l'absence existante
        result = await absenceService.updateAbsence(existingAbsence.idAbsence, absenceRequest);
        toast.success('Absence modifiée avec succès');
      } else {
        // Mode création - créer de nouvelles absences
        result = await absenceService.createAbsences(absenceRequest);
        toast.success(`Absence créée pour ${selectedStudentsLocal.length} étudiant(s)`);
      }

      onSuccess?.(result);
    } catch (error: any) {
      console.error(`Erreur ${mode === 'edit' ? 'modification' : 'création'} absence:`, error);
      const errorMessage = error.message || `Une erreur est survenue lors de la ${mode === 'edit' ? 'modification' : 'création'} de l'absence`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentsLocal(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAllPresent = () => {
    // Sélectionner tous les étudiants disponibles
    const allStudentIds = students.map(student => student.idStudent);
    setSelectedStudentsLocal(allStudentIds);
  };

  const handleClearSelection = () => {
    setSelectedStudentsLocal([]);
  };

  // Fonction pour vérifier si un étudiant est déjà sélectionné
  const isStudentSelected = (studentId: string) => {
    return selectedStudentsLocal.includes(studentId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onCancel?.();
    }, 300);
  };

  return (
    <div className={`
      fixed inset-0 z-50 flex justify-end
      transition-all duration-500 ease-out
      ${isVisible 
        ? 'opacity-100 visible backdrop-blur-sm' 
        : 'opacity-0 invisible backdrop-blur-0'
      }
    `}>
      {/* Overlay avec transparence et flou */}
      <div 
        className={`
          absolute inset-0 bg-black/20
          transition-opacity duration-500 ease-in-out
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleClose}
      />
      
      {/* Contenu du formulaire à droite */}
      <div className={`
        relative bg-white/95 shadow-2xl border-l border-white/20 
        w-full max-w-2xl h-full overflow-hidden flex flex-col
        transform transition-all duration-500 ease-out
        ${isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}>
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white/80 shrink-0">
          <h3 className="text-xl font-bold text-gray-800">
            {mode === 'edit' ? 'Modifier l\'absence' : 'Créer une absence collective'}
          </h3>
          <button 
            onClick={handleClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors hover:scale-110 transform duration-200"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50/90 border border-red-200 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Section Informations de la séance */}
              <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                  Informations de la séance
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-black">Créneau horaire</label>
                    <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50/70 text-gray-700 backdrop-blur-sm">
                      {creneau.display}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-black">Module</label>
                    <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50/70 text-gray-700 backdrop-blur-sm">
                      {moduleName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">Groupe</label>
                      <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50/70 text-gray-700 backdrop-blur-sm">
                        {creneau.groupe}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">Salle</label>
                      <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50/70 text-gray-700 backdrop-blur-sm">
                        {creneau.salle}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Date et Raison */}
              <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                  Détails de l'absence
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-black">Date de l'absence*</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all bg-white/90 backdrop-blur-sm"
                        required
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(formData.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-black">Raison de l'absence*</label>
                    <select
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all bg-white/90 backdrop-blur-sm"
                      required
                    >
                      {Object.values(AbsenceReason).map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section Étudiants */}
              <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                  Étudiants absents
                </h3>
                
                <div className="space-y-4">
                  {/* En-tête de sélection */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-bold text-black mb-2">
                        Sélectionnez les étudiants absents ({selectedStudentsLocal.length} sélectionnés)
                      </label>
                      <p className="text-xs text-gray-500">
                        {students.length} étudiants disponibles pour ce créneau
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllPresent}
                        className="px-3 py-2 text-xs bg-[#D4A017] text-white rounded hover:bg-[#B38C0F] transition-all transform hover:scale-105 backdrop-blur-sm flex-1"
                      >
                        Tout sélectionner
                      </button>
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="px-3 py-2 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-all transform hover:scale-105 backdrop-blur-sm flex-1"
                      >
                        Tout effacer
                      </button>
                    </div>
                  </div>

                  {/* Liste des étudiants sélectionnés */}
                  {selectedStudentsLocal.length > 0 && (
                    <div className="bg-green-50/90 border border-green-200 rounded-lg p-3 backdrop-blur-sm">
                      <h4 className="text-xs font-semibold text-green-800 mb-2">
                        Étudiants sélectionnés ({selectedStudentsLocal.length})
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {selectedStudentsData.map(student => (
                          <div key={student.idStudent} className="flex justify-between items-center py-1 px-2 bg-white/80 rounded border border-green-100 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {student.nom?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-gray-700">
                                {student.nom} {student.prenom}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleStudentSelection(student.idStudent)}
                              className="text-red-500 hover:text-red-700 transition-colors text-xs hover:scale-110 transform duration-200"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Liste de tous les étudiants */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white/60 backdrop-blur-sm">
                    <div className="max-h-80 overflow-y-auto">
                      {students.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm bg-white/40">
                          Aucun étudiant disponible pour ce créneau
                        </div>
                      ) : (
                        students.map(student => (
                          <label
                            key={student.idStudent}
                            className={`flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-200 ${
                              isStudentSelected(student.idStudent)
                                ? 'bg-[#F5E9DA] border-l-4 border-l-[#D4A017] backdrop-blur-sm'
                                : 'hover:bg-gray-50/80 backdrop-blur-sm'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isStudentSelected(student.idStudent)}
                              onChange={() => handleStudentSelection(student.idStudent)}
                              className="rounded border-gray-300 text-[#D4A017] focus:ring-[#D4A017] transform hover:scale-110 transition-transform"
                            />
                            <div className="w-8 h-8 bg-[#D4A017] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                              {student.nom?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {student.nom} {student.prenom}
                              </p>
                              <p className="text-xs text-gray-500">
                                {student.niveau} - Groupe {student.groupe}
                              </p>
                            </div>
                            <div className={`px-2 py-1 text-xs rounded-full transition-all duration-200 whitespace-nowrap ${
                              isStudentSelected(student.idStudent)
                                ? 'bg-[#D4A017] text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isStudentSelected(student.idStudent) ? 'Sélectionné' : 'Non sélectionné'}
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Statut et Commentaires */}
              <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                  Statut et informations supplémentaires
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="justified"
                          checked={formData.justified}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A017] transition-all duration-300"></div>
                      </div>
                      <span className="text-sm font-medium text-black">Absence justifiée</span>
                    </label>
                    {formData.justified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium backdrop-blur-sm">
                        ✓ Justifiée
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-black">Commentaire (optionnel)</label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all bg-white/90 backdrop-blur-sm resize-none"
                      placeholder="Ajoutez un commentaire pour ces absences (visible par l'administration)..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.comment.length}/500 caractères
                    </p>
                  </div>
                </div>
              </div>

              {/* Résumé */}
              <div className="bg-yellow-50/90 border border-yellow-200 rounded-lg p-4 backdrop-blur-sm">
                <h5 className="font-semibold text-yellow-800 mb-2 text-sm">Résumé de l'opération</h5>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>• <strong>{selectedStudentsLocal.length} étudiant(s)</strong> seront marqués absent(s)</p>
                  <p>• Date : <strong>{new Date(formData.date).toLocaleDateString('fr-FR')}</strong></p>
                  <p>• Module : <strong>{moduleName}</strong></p>
                  <p>• Raison : <strong>{formData.reason}</strong></p>
                  <p>• Statut : <strong>{formData.justified ? 'Justifiée' : 'Non justifiée'}</strong></p>
                </div>
              </div>

              {/* Boutons de soumission */}
              <div className="flex flex-col gap-3 pt-4 sticky bottom-0 bg-white/80 p-4 -mx-4 -mb-6 border-t border-gray-200 backdrop-blur-sm">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-6 py-3 text-sm bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 backdrop-blur-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading || selectedStudentsLocal.length === 0 || !formData.date}
                    className="flex-1 px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg hover:bg-[#B38C0F] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 backdrop-blur-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Traitement...
                      </>
                    ) : (
                      <>
                        <FaUser />
                        {mode === 'edit' ? 'Modifier' : 'Marquer absent'} ({selectedStudentsLocal.length})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenceForm;