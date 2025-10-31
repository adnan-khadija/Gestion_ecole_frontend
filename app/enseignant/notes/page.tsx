'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import { StudentResponse, ModuleResponse, NoteResponse, EnseignantResponse, TypeNote } from '@/lib/types';
import { fetchNotesEnseignant, deleteNote } from '@/lib/notes';
import { fetchCurrentUser, fetchCurrentEnseignant } from '@/lib/auth';
import { fetchModulesByEnseignant, fetchStudentByModule } from '@/lib/modules';
import toast from 'react-hot-toast';
import NoteForm from '@/components/forms/NoteEnseignantForm';
import NoteUpdateForm from '@/components/forms/NoteUpdateEnseignantForm';

// Palette de couleurs
const COLORS = {
  C1: { bg: "#FEF3F2", text: "#D92D20", border: "#FDA29B" },
  C2: { bg: "#FFFAEB", text: "#DC6803", border: "#FEC84B" },
  EXAMEN_TH: { bg: "#F0F9FF", text: "#026AA2", border: "#84CAFF" },
  EXAMEN_PR: { bg: "#F8F9FF", text: "#363F72", border: "#B1B5F8" },
  RATTRAPAGE: { bg: "#F9F5FF", text: "#6938EF", border: "#D6BBFB" },
};

const NotesPage = () => {
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [enseignant, setEnseignant] = useState<EnseignantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteResponse | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Charger les données de l'enseignant
  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setLoading(true);
        
        const response = await fetchCurrentUser();
        const userDataFromApi = response.data || response;
        const userEmail = userDataFromApi.email;
        
        if (!userEmail) {
          throw new Error('Email utilisateur non trouvé');
        }

        const currentEnseignant = await fetchCurrentEnseignant(userEmail);
        setEnseignant(currentEnseignant);
        
        // Charger les modules de l'enseignant
        const teacherModules = await fetchModulesByEnseignant(currentEnseignant.enseignantId);
        setModules(teacherModules);
        
        // Charger les notes de l'enseignant (année scolaire actuelle)
        const currentYear = new Date().getFullYear().toString();
        const teacherNotes = await fetchNotesEnseignant(currentEnseignant.enseignantId, currentYear);
        setNotes(teacherNotes);
        
      } catch (error) {
        console.error('Erreur chargement données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, []);

  // Charger les étudiants quand un module est sélectionné
  useEffect(() => {
    const loadStudentsForModule = async () => {
      if (!selectedModule) {
        setStudents([]);
        return;
      }

      try {
        const moduleStudents = await fetchStudentByModule(selectedModule);
        setStudents(moduleStudents);
      } catch (error) {
        console.error('Erreur chargement étudiants:', error);
        toast.error('Erreur lors du chargement des étudiants');
      }
    };

    loadStudentsForModule();
  }, [selectedModule]);

  // Filtrer et trier les notes - CORRECTION DE LA RECHERCHE
  const filteredNotes = useMemo(() => {
    let filtered = notes.filter(note => {
      // Vérification plus robuste pour la recherche
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = searchTerm === '' || 
        (note.studentNom && note.studentNom.toLowerCase().includes(searchLower)) ||
        (note.studentPrenom && note.studentPrenom.toLowerCase().includes(searchLower)) ||
        (note.moduleNom && note.moduleNom.toLowerCase().includes(searchLower)) ||
        (note.matricule && note.matricule.toLowerCase().includes(searchLower));
      
      const matchesModule = selectedModule === '' || note.moduleId === selectedModule;
      const matchesType = selectedType === '' || note.typeNote === selectedType;
      
      return matchesSearch && matchesModule && matchesType;
    });

    // Tri
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortConfig.key) {
          case 'student':
            aValue = `${a.studentNom || ''} ${a.studentPrenom || ''}`.toLowerCase().trim();
            bValue = `${b.studentNom || ''} ${b.studentPrenom || ''}`.toLowerCase().trim();
            break;
          case 'module':
            aValue = (a.moduleNom || '').toLowerCase();
            bValue = (b.moduleNom || '').toLowerCase();
            break;
          case 'type':
            aValue = a.typeNote || '';
            bValue = b.typeNote || '';
            break;
          case 'valeur':
            aValue = a.valeur || 0;
            bValue = b.valeur || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [notes, searchTerm, selectedModule, selectedType, sortConfig]);

  // Gestion du tri
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Obtenir l'icône de tri
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="text-[#D4A017]" /> : 
      <FaSortDown className="text-[#D4A017]" />;
  };

  // Obtenir les types de notes disponibles depuis les données
  const availableTypes = useMemo(() => {
    const types = Array.from(new Set(notes.map(note => note.typeNote))).filter(Boolean);
    return types;
  }, [notes]);

  // Ouvrir le formulaire pour ajouter une note
  const handleAddNote = () => {
    if (!selectedModule) {
      toast.error('Veuillez sélectionner un module d\'abord');
      return;
    }
    setEditingNote(null);
    setShowNoteForm(true);
  };

  // Ouvrir le formulaire pour modifier une note
  const handleEditNote = (note: NoteResponse) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  // Supprimer une note
  const handleDeleteNote = async (note: NoteResponse) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }

    try {
      if (!enseignant) {
        throw new Error('Enseignant non connecté');
      }

      await deleteNote(note.idNote, enseignant.enseignantId);
      
      // Mettre à jour la liste locale
      setNotes(prev => prev.filter(n => n.idNote !== note.idNote));
      toast.success('Note supprimée avec succès');
    } catch (error: any) {
      console.error('Erreur suppression note:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la note');
    }
  };

  // Gérer le succès du formulaire
  const handleFormSuccess = (result: NoteResponse | NoteResponse[]) => {
    setShowNoteForm(false);
    setEditingNote(null);
    
    // Recharger les notes
    const reloadNotes = async () => {
      if (!enseignant) return;
      
      try {
        const currentYear = new Date().getFullYear().toString();
        const updatedNotes = await fetchNotesEnseignant(enseignant.enseignantId, currentYear);
        setNotes(updatedNotes);
      } catch (error) {
        console.error('Erreur rechargement notes:', error);
      }
    };
    
    reloadNotes();
    
    if (Array.isArray(result)) {
      toast.success(`${result.length} note(s) ajoutée(s) avec succès`);
    } else {
      toast.success(editingNote ? 'Note modifiée avec succès' : 'Note ajoutée avec succès');
    }
  };

  // Obtenir la couleur pour un type d'évaluation
  const getTypeColor = (type: string) => {
    return COLORS[type as keyof typeof COLORS] || COLORS.C2;
  };

  // Obtenir le libellé d'un type de note
  const getTypeLabel = (typeKey: string) => {
    return TypeNote[typeKey as keyof typeof TypeNote] || typeKey;
  };

  // Debug: Afficher les données chargées
  useEffect(() => {
    if (notes.length > 0) {
      console.log('Notes chargées:', notes);
      console.log('Première note:', notes[0]);
    }
  }, [notes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Overlay semi-transparent quand le formulaire est ouvert */}
        {showNoteForm && (
          <div 
            className="fixed inset-0 bg-transparent bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={() => setShowNoteForm(false)}
          />
        )}
        
        {/* En-tête simplifié */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestion des Notes</h1>
            
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="space-y-6">
          {/* Section Filtres et Recherche */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Recherche */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Recherche
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nom, prénom, module, matricule..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] transition-all"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  Rechercher par nom, prénom, module ou matricule
                </p>
              </div>

              {/* Module */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Module
                </label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] transition-all"
                >
                  <option value="">Tous les modules</option>
                  {modules.map(module => (
                    <option key={module.idModule} value={module.idModule}>
                      {module.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type d'évaluation */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Type d'évaluation
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] transition-all"
                >
                  <option value="">Tous les types</option>
                  {availableTypes.map(type => (
                    <option key={type} value={type}>
                      {getTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bouton Ajouter */}
              <div className="flex items-end">
                <button
                  onClick={handleAddNote}
                  disabled={!selectedModule}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D4A017] text-white rounded-lg hover:bg-[#B38C0F] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <FaPlus />
                  Ajouter une note
                </button>
              </div>
            </div>
          </div>
       
          {/* Liste des notes */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* En-tête du tableau */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Liste des Notes ({filteredNotes.length})
                </h2>
                <div className="text-sm text-gray-500">
                  {selectedModule && `Module: ${modules.find(m => m.idModule === selectedModule)?.nom}`}
                  {selectedType && ` | Type: ${getTypeLabel(selectedType)}`}
                  {!selectedModule && !selectedType && 'Tous les modules et types'}
                  {searchTerm && ` | Recherche: "${searchTerm}"`}
                </div>
              </div>
            </div>

            {/* Tableau des notes */}
            <div className="overflow-x-auto">
              {filteredNotes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaSearch className="text-gray-400 text-xl" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Aucune note trouvée</p>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? `Aucun résultat pour "${searchTerm}"` 
                      : selectedModule || selectedType 
                        ? 'Aucune note ne correspond aux filtres sélectionnés.' 
                        : 'Sélectionnez un module pour commencer à ajouter des notes.'
                    }
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('student')}
                      >
                        <div className="flex items-center gap-2">
                          Étudiant
                          {getSortIcon('student')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('module')}
                      >
                        <div className="flex items-center gap-2">
                          Module
                          {getSortIcon('module')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('type')}
                      >
                        <div className="flex items-center gap-2">
                          Type
                          {getSortIcon('type')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('valeur')}
                      >
                        <div className="flex items-center gap-2">
                          Note
                          {getSortIcon('valeur')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredNotes.map((note) => (
                      <tr 
                        key={note.idNote} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#D4A017] rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {(note.studentNom || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {note.studentNom || 'N/A'} {note.studentPrenom || ''}
                              </div>
                              <div className="text-sm text-gray-500">
                                {note.matricule || 'Sans matricule'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {note.moduleNom || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                            style={{
                              backgroundColor: getTypeColor(note.typeNote || 'C2').bg,
                              color: getTypeColor(note.typeNote || 'C2').text,
                              borderColor: getTypeColor(note.typeNote || 'C2').border
                            }}
                          >
                            {getTypeLabel(note.typeNote || 'C2')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${
                              (note.valeur || 0) >= 10 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(note.valeur || 0).toFixed(2)}/20
                            </span>
                            {(note.valeur || 0) >= 10 && (
                              <span className="text-xs text-green-600 font-medium">✓</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditNote(note)}
                              className="flex items-center gap-2 px-3 py-2 text-xs bg-[#D4A017] text-white rounded-lg hover:bg-[#B38C0F] transition-colors font-medium"
                            >
                              <FaEdit />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note)}
                              className="flex items-center gap-2 px-3 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                              <FaTrash />
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Formulaire de note en superposition à droite */}
      
{showNoteForm && (
  <div className="fixed right-0 top-0 h-full w-1/2 max-w-2xl bg-white shadow-2xl border-l border-gray-200 z-50">
    {editingNote ? (
      <NoteUpdateForm
        moduleId={selectedModule}
        moduleName={modules.find(m => m.idModule === selectedModule)?.nom || ''}
        students={students}
        enseignantId={enseignant?.enseignantId || ''}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowNoteForm(false);
          setEditingNote(null);
        }}
        existingNote={editingNote}
      />
    ) : (
      <NoteForm
        moduleId={selectedModule}
        moduleName={modules.find(m => m.idModule === selectedModule)?.nom || ''}
        students={students}
        onSuccess={handleFormSuccess}
        onCancel={() => setShowNoteForm(false)}
      />
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default NotesPage;