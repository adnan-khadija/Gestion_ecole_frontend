'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { StudentResponse, NoteRequest, NoteResponse, TypeNote } from '@/lib/types';
import { updateNote } from '@/lib/notes';
import toast from 'react-hot-toast';

interface NoteUpdateFormProps {
  moduleId: string;
  moduleName: string;
  students: StudentResponse[];
  enseignantId: string;
  onSuccess?: (result: NoteResponse) => void;
  onCancel?: () => void;
  existingNote: NoteResponse;
}

const NoteUpdateForm = ({ 
  moduleId, 
  moduleName, 
  students, 
  enseignantId,
  onSuccess, 
  onCancel,
  existingNote 
}: NoteUpdateFormProps) => {
  const [formData, setFormData] = useState({
    studentId: '',
    typeNote: TypeNote.C1,
    valeur: 0,
    anneeScolaire: new Date().getFullYear().toString()
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialiser avec les données existantes de manière sécurisée
  useEffect(() => {
    if (existingNote) {
      console.log('Existing note data:', existingNote); // Debug
      
      setFormData({
        studentId: existingNote.studentId || '',
        typeNote: existingNote.typeNote || TypeNote.C1,
        valeur: existingNote.valeur || 0,
        anneeScolaire: existingNote.anneeScolaire || new Date().getFullYear().toString()
      });
    }
  }, [existingNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.studentId || !formData.valeur) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      const noteRequest: NoteRequest = {
        studentId: formData.studentId,
        moduleId: moduleId,
        typeNote: formData.typeNote,
        valeur: formData.valeur,
        enseignantId: enseignantId,
        anneeScolaire: formData.anneeScolaire
      };

      console.log('Updating note with data:', {
        idNote: existingNote.idNote,
        noteRequest
      });

      const result = await updateNote(existingNote.idNote, noteRequest);
      onSuccess?.(result);
      toast.success("Note modifiée avec succès !");
    } catch (error: any) {
      console.error('Erreur modification note:', error);
      const errorMessage = error.message || 'Erreur lors de la modification de la note';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Trouver l'étudiant correspondant à la note
  const currentStudent = students.find(student => student.idStudent === formData.studentId);

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* En-tête */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">
          Modifier la note
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

        {/* Informations du module et de l'étudiant */}
      

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
                  {Object.keys(TypeNote).map((key) => (
                    <option key={key} value={key}>
                      {TypeNote[key as keyof typeof TypeNote]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Année scolaire */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">
                  Année Scolaire *
                </label>
                <select
                  name="anneeScolaire"
                  value={formData.anneeScolaire}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  required
                >
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                </select>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black">
                  Note /20 *
                </label>
                <input
                  type="number"
                  name="valeur"
                  min="0"
                  max="20"
                  step="0.1"
                  value={formData.valeur}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                  required
                />
              </div>
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
              disabled={loading || !formData.valeur || !formData.studentId}
              className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg hover:bg-[#B38C0F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Modification...
                </>
              ) : (
                'Modifier la note'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteUpdateForm;