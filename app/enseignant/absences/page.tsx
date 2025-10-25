'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  FaUserCircle, 
  FaSearch, 
  FaAngleDown, 
  FaClock,
  FaTimes,
  FaCheck,
  FaUsers,
  FaUser
} from 'react-icons/fa';
import { StudentResponse, AbsenceResponse, AbsenceReason, EnseignantResponse, ModuleResponse, EmploiDuTempsResponse } from '@/lib/types';
import { absenceService } from '@/lib/absence';
import { fetchModulesByEnseignant, fetchStudentByModule } from '@/lib/modules';
import { fetchCurrentUser, fetchCurrentEnseignant } from '@/lib/auth';
import { fetchEmploiDuTempsByModule, fetchEmploiDuTempsByEnseignant } from '@/lib/emploiDuTemps';
import toast from 'react-hot-toast';
import AbsenceForm from '@/components/forms/AbsenceForm';

// Interface pour l'état des absences
interface AbsenceState {
  studentId: string;
  nom: string;
  status: 'Present' | 'Absent';
  reason: AbsenceReason | '';
  justified: boolean;
  enseignantComment: string;
  absenceId?: string;
}

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

// Composant principal optimisé
const AbsencePage = () => {
  const [absences, setAbsences] = useState<AbsenceState[]>([]);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [creneaux, setCreneaux] = useState<CreneauFormate[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(false);
  const [enseignant, setEnseignant] = useState<EnseignantResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // États pour la sélection multiple
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  
  // États pour les formulaires
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCreneau, setSelectedCreneau] = useState<CreneauFormate | null>(null);

  // Charger l'enseignant connecté et ses modules
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
        
        const teacherModules = await fetchModulesByEnseignant(currentEnseignant.enseignantId);
        setModules(teacherModules);
        
        console.log('Modules chargés:', teacherModules);

        // Charger l'emploi du temps global de l'enseignant par défaut
        await loadEmploiDuTempsGlobal(currentEnseignant.enseignantId);
        
      } catch (error) {
        console.error('Erreur chargement données enseignant:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, []);

  // Charger l'emploi du temps global de l'enseignant
  const loadEmploiDuTempsGlobal = async (enseignantId: string) => {
    try {
      setLoading(true);
      const emploiDuTemps = await fetchEmploiDuTempsByEnseignant(enseignantId);
      console.log('Emploi du temps global chargé:', emploiDuTemps);

      const creneauxFormates = formatEmploiDuTemps(emploiDuTemps);
      setCreneaux(creneauxFormates);
      console.log('Créneaux formatés:', creneauxFormates);

    } catch (error) {
      console.error('Erreur chargement emploi du temps global:', error);
      toast.error('Erreur lors du chargement de l\'emploi du temps');
      setCreneaux([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger l'emploi du temps d'un module spécifique
  const loadEmploiDuTempsByModule = async (moduleId: string) => {
    if (!enseignant) return;
    
    try {
      setLoading(true);
      const emploiDuTemps = await fetchEmploiDuTempsByModule(moduleId);
      console.log('Emploi du temps du module chargé:', emploiDuTemps);

      const creneauxFormates = formatEmploiDuTemps(emploiDuTemps);
      setCreneaux(creneauxFormates);
      console.log('Créneaux du module formatés:', creneauxFormates);

    } catch (error) {
      console.error('Erreur chargement emploi du temps du module:', error);
      toast.error('Erreur lors du chargement de l\'emploi du temps du module');
      setCreneaux([]);
    } finally {
      setLoading(false);
    }
  };

  // Formater les emplois du temps en créneaux
  const formatEmploiDuTemps = (emploiDuTemps: EmploiDuTempsResponse[]): CreneauFormate[] => {
    if (!emploiDuTemps || !Array.isArray(emploiDuTemps)) return [];

    return emploiDuTemps.map(seance => ({
      id: seance.idEmploi,
      heureDebut: seance.heureDebut,
      heureFin: seance.heureFin,
      groupe: seance.groupe,
      jour: seance.jour,
      salle: seance.salle,
      typeSeance: seance.typeSeance,
      moduleId: seance.moduleId,
      moduleName: seance.moduleName,
      display: `${seance.heureDebut}-${seance.heureFin} (Groupe ${seance.groupe}) - ${seance.moduleName}`
    }));
  };

  // Gérer le changement de module
  const handleModuleChange = async (moduleId: string) => {
    setSelectedModule(moduleId);
    setSelectedCreneau(null);
    setStudents([]);
    setAbsences([]);
    setSelectedStudents([]);

    if (moduleId === '') {
      // Charger l'emploi du temps global si aucun module sélectionné
      if (enseignant) {
        await loadEmploiDuTempsGlobal(enseignant.enseignantId);
      }
    } else {
      // Charger l'emploi du temps du module sélectionné
      await loadEmploiDuTempsByModule(moduleId);
    }
  };

  // Charger les étudiants quand un créneau est sélectionné
  const handleCreneauClick = async (creneau: CreneauFormate) => {
    setSelectedCreneau(creneau);
    setStudentsLoading(true);
    
    try {
      console.log('Chargement des étudiants pour:', {
        module: creneau.moduleId,
        groupe: creneau.groupe,
        moduleName: creneau.moduleName
      });
      
      // Charger tous les étudiants du module
      const moduleStudents = await fetchStudentByModule(creneau.moduleId);
      console.log('Tous les étudiants du module:', moduleStudents);
      
      if (!moduleStudents || moduleStudents.length === 0) {
        console.warn('Aucun étudiant trouvé pour ce module');
        setStudents([]);
        setAbsences([]);
        toast.error('Aucun étudiant trouvé pour ce module');
        return;
      }

      // Filtrer les étudiants par groupe (correspondance flexible)
      const studentsDuGroupe = moduleStudents.filter(student => {
        if (!student.groupe) return false;
        
        // Normaliser les formats de groupe pour la comparaison
        const studentGroupe = student.groupe.toString().trim().toUpperCase();
        const creneauGroupe = creneau.groupe.toString().trim().toUpperCase();
        
        // Plusieurs façons de comparer les groupes
        const matchesDirect = studentGroupe === creneauGroupe;
        const matchesWithG = studentGroupe === `G${creneauGroupe}` || 
                           creneauGroupe === `G${studentGroupe}`;
        const matchesNumber = studentGroupe === creneauGroupe.replace('G', '') || 
                            creneauGroupe === studentGroupe.replace('G', '');
        
        const matches = matchesDirect || matchesWithG || matchesNumber;
        
        if (matches) {
          console.log(`Correspondance trouvée: ${studentGroupe} === ${creneauGroupe}`);
        }
        
        return matches;
      });

      console.log('Étudiants filtrés pour le groupe:', {
        groupeRecherche: creneau.groupe,
        étudiantsTrouvés: studentsDuGroupe.length,
        étudiants: studentsDuGroupe
      });

      setStudents(studentsDuGroupe);
      
      // Initialiser tous les étudiants comme présents par défaut
      const absenceStates: AbsenceState[] = studentsDuGroupe.map(student => ({
        studentId: student.idStudent,
        nom: `${student.nom || ''} ${student.prenom || ''}`.trim(),
        status: 'Present', // Par défaut tous présents
        reason: '',
        justified: false,
        enseignantComment: '',
        absenceId: undefined
      }));

      setAbsences(absenceStates);
      
      // Réinitialiser la sélection
      setSelectedStudents([]);
      setSelectAll(false);
      
      if (studentsDuGroupe.length > 0) {
        toast.success(`${studentsDuGroupe.length} étudiant(s) chargé(s) pour le groupe ${creneau.groupe}`);
      } else {
        toast.warning(`Aucun étudiant trouvé pour le groupe ${creneau.groupe}`);
        console.warn('Détails du filtrage:', {
          module: creneau.moduleId,
          groupeRecherché: creneau.groupe,
          tousLesÉtudiants: moduleStudents.map(s => ({ 
            id: s.idStudent, 
            nom: `${s.nom} ${s.prenom}`, 
            groupe: s.groupe 
          }))
        });
      }
      
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
      toast.error('Erreur lors du chargement des étudiants');
      setStudents([]);
      setAbsences([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Vérifier si un étudiant est absent
  const isStudentAbsent = (studentId: string): boolean => {
    const absence = absences.find(a => a.studentId === studentId);
    return absence?.status === 'Absent';
  };

  // Obtenir les détails de l'absence d'un étudiant
  const getStudentAbsence = (studentId: string): AbsenceState | undefined => {
    return absences.find(a => a.studentId === studentId);
  };

  // Gestion de la sélection multiple
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      // Ne sélectionner que les étudiants présents
      const presentStudents = students
        .filter(student => !isStudentAbsent(student.idStudent))
        .map(student => student.idStudent);
      setSelectedStudents(presentStudents);
    }
    setSelectAll(!selectAll);
  };

  // Création d'absence collective
  const handleCreateAbsence = () => {
    if (selectedStudents.length === 0) {
      toast.error('Veuillez sélectionner au moins un étudiant');
      return;
    }
    setFormMode('create');
    setShowAbsenceForm(true);
  };

  // Création d'absence individuelle
  const handleCreateIndividualAbsence = (student: StudentResponse) => {
    setSelectedStudents([student.idStudent]);
    setFormMode('create');
    setShowAbsenceForm(true);
  };

  // Gestion du succès du formulaire
  const handleFormSuccess = (result: AbsenceResponse | AbsenceResponse[]) => {
    setShowAbsenceForm(false);
    
    // Mettre à jour les statuts locaux des étudiants marqués absents
    if (Array.isArray(result)) {
      // Multiple absences créées
      setAbsences(prev => prev.map(absence => {
        const newAbsence = result.find(a => a.studentId === absence.studentId);
        if (newAbsence) {
          return {
            ...absence,
            status: 'Absent',
            reason: newAbsence.reason,
            justified: newAbsence.justified,
            enseignantComment: newAbsence.enseignantComment,
            absenceId: newAbsence.idAbsence
          };
        }
        return absence;
      }));
    } else {
      // Une seule absence créée/modifiée
      setAbsences(prev => prev.map(absence => {
        if (absence.studentId === result.studentId) {
          return {
            ...absence,
            status: 'Absent',
            reason: result.reason,
            justified: result.justified,
            enseignantComment: result.enseignantComment,
            absenceId: result.idAbsence
          };
        }
        return absence;
      }));
    }
    
    setSelectedStudents([]);
    setSelectAll(false);
    toast.success('Absence(s) enregistrée(s) avec succès');
  };

  // Marquer comme présent (supprimer l'absence)
  const markPresent = async (studentId: string) => {
    try {
      const absence = getStudentAbsence(studentId);
      if (absence?.absenceId) {
        await absenceService.deleteAbsence(absence.absenceId);
        toast.success('Élève marqué comme présent');
        
        // Mettre à jour l'état local
        setAbsences(prev => prev.map(a => 
          a.studentId === studentId 
            ? { ...a, status: 'Present', reason: '', justified: false, enseignantComment: '', absenceId: undefined }
            : a
        ));
      }
    } catch (error) {
      console.error('Erreur suppression absence:', error);
      toast.error('Erreur lors de la suppression de l\'absence');
    }
  };

  // Filtrer les étudiants par recherche
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const studentName = `${student.nom} ${student.prenom}`.toLowerCase();
      return studentName.includes(searchTerm.toLowerCase());
    });
  }, [students, searchTerm]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestion des Absences</h1>
             
              <div className="flex gap-4 mt-2 text-xs">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {creneaux.length} créneau(x) disponible(s)
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {modules.length} module(s)
                </span>
                {selectedCreneau && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {students.length} étudiant(s) chargé(s)
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Sélection du module */}
              <div className="relative">
                <select
                  value={selectedModule}
                  onChange={(e) => handleModuleChange(e.target.value)}
                  className="appearance-none pr-8 pl-4 py-2 rounded-lg border border-gray-300 w-full lg:w-64 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Tous les modules</option>
                  {modules.map(module => (
                    <option key={module.idModule} value={module.idModule}>
                      {module.nom}
                    </option>
                  ))}
                </select>
                <FaAngleDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Recherche */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 w-full sm:w-64 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={!selectedCreneau || studentsLoading}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Colonne de Gauche: Emploi du temps */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaClock className="text-sm" />
                <span>
                  {selectedModule 
                    ? `Emploi du temps - ${modules.find(m => m.idModule === selectedModule)?.nom || 'Module'}`
                    : 'Mon Emploi du Temps'
                  }
                </span>
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Chargement de l'emploi du temps...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {creneaux.map(creneau => {
                    const isSelected = selectedCreneau?.id === creneau.id;
                    const studentsCount = students.filter(s => 
                      s.groupe === creneau.groupe
                    ).length;
                    
                    return (
                      <div
                        key={creneau.id}
                        onClick={() => handleCreneauClick(creneau)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-300 border-l-4 border-l-blue-500' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {creneau.heureDebut} - {creneau.heureFin}
                            </p>
                            <p className="text-sm text-gray-600">{creneau.jour}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isSelected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            Groupe {creneau.groupe}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          {creneau.moduleName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {creneau.salle} • {creneau.typeSeance}
                        </p>
                        {isSelected && (
                          <p className="text-xs text-green-600 mt-1">
                            {studentsCount} étudiant(s) chargé(s)
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {creneaux.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <FaClock className="text-3xl mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun créneau disponible</p>
                  <p className="text-xs mt-1">
                    {selectedModule 
                      ? `Aucun emploi du temps trouvé pour ce module`
                      : `Aucun emploi du temps trouvé`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Colonne de Droite: Liste des Étudiants */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* En-tête du tableau avec actions */}
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {selectedCreneau 
                      ? `Étudiants - ${selectedCreneau.display}`
                      : 'Sélectionnez un créneau'
                    }
                    <span className="text-sm font-normal ml-2 text-gray-600">
                      ({filteredStudents.length} étudiants)
                    </span>
                  </h2>
                  
                  {/* Case à cocher "Tout sélectionner" */}
                  {selectedCreneau && filteredStudents.length > 0 && (
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Tout sélectionner (présents seulement)
                    </label>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* Bouton d'action collective */}
                  {selectedCreneau && selectedStudents.length > 0 && (
                    <button
                      onClick={handleCreateAbsence}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FaUsers />
                      Marquer {selectedStudents.length} absent(s)
                    </button>
                  )}
                </div>
              </div>

              {/* Liste des étudiants */}
              <div className="overflow-x-auto">
                {!selectedCreneau ? (
                  <div className="p-8 text-center text-gray-500">
                    <FaUserCircle className="text-4xl mx-auto mb-2 opacity-50" />
                    <p>Veuillez sélectionner un créneau horaire</p>
                    <p className="text-sm mt-1">Cliquez sur un créneau dans votre emploi du temps</p>
                  </div>
                ) : studentsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-gray-600">Chargement des étudiants...</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FaUserCircle className="text-4xl mx-auto mb-2 opacity-50" />
                    <p>Aucun étudiant trouvé pour ce créneau</p>
                    <p className="text-sm mt-1">
                      Vérifiez que le groupe {selectedCreneau.groupe} existe dans le module {selectedCreneau.moduleName}
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-12 px-4 py-3"></th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Étudiant
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Classe/Groupe
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStudents.map((student) => {
                        const isSelected = selectedStudents.includes(student.idStudent);
                        const isAbsent = isStudentAbsent(student.idStudent);
                        const absenceDetails = getStudentAbsence(student.idStudent);

                        return (
                          <tr key={student.idStudent} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              {!isAbsent && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleStudentSelection(student.idStudent)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {student.nom?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {student.nom} {student.prenom}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {student.niveau} - {student.groupe}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                isAbsent 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {isAbsent ? 'Absent' : 'Présent'}
                                {isAbsent && absenceDetails?.justified && ' ✓'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {!isAbsent ? (
                                  <button
                                    onClick={() => handleCreateIndividualAbsence(student)}
                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                  >
                                    <FaUser />
                                    Marquer absent
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => markPresent(student.idStudent)}
                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                  >
                                    <FaCheck />
                                    Marquer présent
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire d'absence */}
        {showAbsenceForm && selectedCreneau && (
          <AbsenceForm
            students={students}
            selectedStudents={selectedStudents}
            moduleId={selectedCreneau.moduleId}
            moduleName={selectedCreneau.moduleName}
            creneau={selectedCreneau}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowAbsenceForm(false);
              setSelectedStudents([]);
            }}
            mode={formMode}
          />
        )}
      </div>
    </div>
  );
};

export default AbsencePage;