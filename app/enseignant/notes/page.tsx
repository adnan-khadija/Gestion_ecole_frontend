'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaFileExport,
  FaUserGraduate,
  FaBook,
  FaChartLine
} from 'react-icons/fa';
import { StudentResponse, ModuleResponse, NoteResponse, EnseignantResponse } from '@/lib/types';
import { fetchNotesEnseignant, deleteNote } from '@/lib/notes';
import { fetchCurrentUser, fetchCurrentEnseignant } from '@/lib/auth';
import { fetchModulesByEnseignant,fetchStudentByModule  } from '@/lib/modules';
import toast from 'react-hot-toast';
import NoteForm from '@/components/forms/NoteEnseignantForm';

// Palette de couleurs
const COLORS = {
  CC: "#A52A2A",      // Marron
  TD: "#D4A017",      // Or
  TP: "#C0C0C0",      // Argent
  ATELIER: "#FF0000", // Rouge
  CONFERENCE: "#8B4513", // Brun
  EXAM: "#8B4513",    // Brun pour les examens
  PROJET: "#A52A2A"   // Marron pour les projets
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
  const [selectedStudents, setSelectedStudents] = useState<StudentResponse[]>([]);

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

  // Filtrer les notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = searchTerm === '' || 
        note.student?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.student?.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.moduleNom.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesModule = selectedModule === '' || note.moduleId === selectedModule;
      const matchesType = selectedType === '' || note.typeEvaluation === selectedType;
      
      return matchesSearch && matchesModule && matchesType;
    });
  }, [notes, searchTerm, selectedModule, selectedType]);

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

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalNotes = filteredNotes.length;
    const moyenneGenerale = totalNotes > 0 
      ? filteredNotes.reduce((sum, note) => sum + note.valeur, 0) / totalNotes 
      : 0;
    
    const notesParModule = modules.map(module => ({
      module: module.nom,
      count: filteredNotes.filter(note => note.moduleId === module.idModule).length
    }));

    return { totalNotes, moyenneGenerale, notesParModule };
  }, [filteredNotes, modules]);

  // Obtenir la couleur pour un type d'évaluation
  const getTypeColor = (type: string) => {
    return COLORS[type as keyof typeof COLORS] || COLORS.TD;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestion des Notes</h1>
              <p className="text-gray-600 mt-1">
                {enseignant && `Enseignant: ${enseignant.prenom} ${enseignant.nom}`}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddNote}
                disabled={!selectedModule}
                className="flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-white rounded-lg hover:bg-[#B38C0F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPlus />
                Ajouter une note
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-[#A52A2A] text-white rounded-lg hover:bg-[#8B2323] transition-colors">
                <FaFileExport />
                Exporter
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filtres et statistiques */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaFilter />
                Filtres
              </h3>
              
              <div className="space-y-4">
                {/* Recherche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recherche
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nom, prénom, module..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017]"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Module */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module
                  </label>
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017]"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'évaluation
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017]"
                  >
                    <option value="">Tous les types</option>
                    <option value="CC">Contrôle Continu</option>
                    <option value="EXAM">Examen</option>
                    <option value="TP">Travaux Pratiques</option>
                    <option value="PROJET">Projet</option>
                    <option value="TD">Travaux Dirigés</option>
                    <option value="ATELIER">Atelier</option>
                    <option value="CONFERENCE">Conférence</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaChartLine />
                Statistiques
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">Total notes</span>
                  <span className="text-lg font-bold text-blue-600">{stats.totalNotes}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Moyenne générale</span>
                  <span className="text-lg font-bold text-green-600">
                    {stats.moyenneGenerale.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Répartition par module */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes par module</h4>
                <div className="space-y-2">
                  {stats.notesParModule.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate">{item.module}</span>
                      <span className="font-medium text-gray-800">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal - Liste des notes */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* En-tête du tableau */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Liste des Notes ({filteredNotes.length})
                  </h2>
                  <div className="text-sm text-gray-500">
                    Module: {selectedModule ? modules.find(m => m.idModule === selectedModule)?.nom : 'Tous'}
                  </div>
                </div>
              </div>

              {/* Tableau des notes */}
              <div className="overflow-x-auto">
                {filteredNotes.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FaBook className="text-4xl mx-auto mb-2 opacity-50" />
                    <p>Aucune note trouvée</p>
                    <p className="text-sm mt-1">
                      {selectedModule ? 'Aucune note pour ce module' : 'Utilisez les filtres pour voir les résultats'}
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Étudiant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Module
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Note
                        </th>
                       
                
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredNotes.map((note) => (
                        <tr key={note.idNote} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#D4A017] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {note.studentNom.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {note.studentNom} {note.studentPrenom}
                                </div>
                               
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {note.moduleNom}
                          </td>
                          <td className="px-4 py-3">
                            <span 
                              className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: `${getTypeColor(note.typeNote)}20`,
                                color: getTypeColor(note.typeNote)
                              }}
                            >
                              {note.typeNote}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-lg font-bold ${
                              note.valeur >= 10 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {note.valeur}/20
                            </span>
                          </td>
                       
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditNote(note)}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-[#D4A017] text-white rounded hover:bg-[#B38C0F] transition-colors"
                              >
                                <FaEdit />
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note)}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-[#A52A2A] text-white rounded hover:bg-[#8B2323] transition-colors"
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
        </div>

        {/* Formulaire de note */}
        {showNoteForm && (
          <NoteForm
            moduleId={selectedModule}
            moduleName={modules.find(m => m.idModule === selectedModule)?.nom || ''}
            students={students}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowNoteForm(false);
              setEditingNote(null);
            }}
            existingNote={editingNote || undefined}
          />
        )}
      </div>
    </div>
  );
};

export default NotesPage;