// app/admin/absences/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAbsence } from '@/app/hooks/useAbsence';
import { fetchStudents } from '@/lib/students';
import { fetchModules } from '@/lib/modules';
import { AbsenceResponse, AbsenceReason, StudentResponse, ModuleResponse } from '@/lib/types';
import TableauDynamique, { Column } from '@/components/TableauDynamique';
import { 
  Box, 
  Typography, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  Button,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import { 
  Visibility,
  Person,
  School,
  CalendarToday,
  Refresh
} from '@mui/icons-material';

// Couleurs personnalisées
const GOLD_COLOR = '#D4A017';
const BROWN_COLOR = '#A52A2A';
const DARK_GOLD = '#B8860B';

const getReasonColor = (reason: AbsenceReason) => {
  switch (reason) {
    case AbsenceReason.MALADIE:
      return '#e3f2fd';
    case AbsenceReason.URGENCE_FAMILIALE:
      return '#fff3e0';
    case AbsenceReason.RETARD:
      return '#ffebee';
    case AbsenceReason.RAISON_PERSONNELLE:
      return '#f3e5f5';
    case AbsenceReason.EVENEMENT_SCOLAIRE:
      return '#e8f5e8';
    case AbsenceReason.AUTRE:
      return '#f5f5f5';
    case AbsenceReason.NON_JUSTIFIEE:
      return '#ffebee';
    default:
      return '#f5f5f5';
  }
};

const getReasonText = (reason: AbsenceReason) => {
  switch (reason) {
    case AbsenceReason.MALADIE:
      return 'Maladie';
    case AbsenceReason.URGENCE_FAMILIALE:
      return 'Urgence familiale';
    case AbsenceReason.RETARD:
      return 'Retard';
    case AbsenceReason.RAISON_PERSONNELLE:
      return 'Raison personnelle';
    case AbsenceReason.EVENEMENT_SCOLAIRE:
      return 'Événement scolaire';
    case AbsenceReason.AUTRE:
      return 'Autre';
    case AbsenceReason.NON_JUSTIFIEE:
      return 'Non justifiée';
    default:
      return reason;
  }
};

export default function AdminAbsencesPage() {
  const { 
    loading, 
    error, 
    getAllAbsences, 
    getAbsencesByStudent, 
    getAbsencesByModule,
    getAbsencesByStudentAndModule,
    getAbsencesByDate,
    clearError
  } = useAbsence();

  const [absences, setAbsences] = useState<AbsenceResponse[]>([]);
  const [selectedAbsence, setSelectedAbsence] = useState<AbsenceResponse | null>(null);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  
  // Dialogs
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

  // États pour la recherche avancée
  const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleResponse | null>(null);
  const [specificDate, setSpecificDate] = useState('');

  // Charger toutes les données au montage
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadAllAbsences(),
        loadStudents(),
        loadModules()
      ]);
    } catch (error) {
      console.error('Erreur chargement initial:', error);
    }
  };

  // Charger la liste des étudiants
  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await fetchStudents();
      setStudents(data);
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Charger la liste des modules
  const loadModules = async () => {
    try {
      setLoadingModules(true);
      const data = await fetchModules();
      setModules(data);
    } catch (error) {
      console.error('Erreur chargement modules:', error);
    } finally {
      setLoadingModules(false);
    }
  };

  const loadAllAbsences = async () => {
    try {
      const data = await getAllAbsences();
      setAbsences(data);
      resetAdvancedSearch();
    } catch (error) {
      console.error('Erreur chargement absences:', error);
    }
  };

  const loadAbsencesByStudent = async (studentId: string) => {
    try {
      const data = await getAbsencesByStudent(studentId);
      setAbsences(data);
      setAdvancedSearchOpen(false);
    } catch (error) {
      console.error('Erreur chargement absences étudiant:', error);
    }
  };

  const loadAbsencesByModule = async (moduleId: string) => {
    try {
      const data = await getAbsencesByModule(moduleId);
      setAbsences(data);
      setAdvancedSearchOpen(false);
    } catch (error) {
      console.error('Erreur chargement absences module:', error);
    }
  };

  const loadAbsencesByStudentAndModule = async (studentId: string, moduleId: string) => {
    try {
      const data = await getAbsencesByStudentAndModule(studentId, moduleId);
      setAbsences(data);
      setAdvancedSearchOpen(false);
    } catch (error) {
      console.error('Erreur chargement absences étudiant/module:', error);
    }
  };

  const loadAbsencesByDate = async (date: string) => {
    try {
      const data = await getAbsencesByDate(date);
      setAbsences(data);
      setAdvancedSearchOpen(false);
    } catch (error) {
      console.error('Erreur chargement absences par date:', error);
    }
  };

  const handleViewDetails = (absence: AbsenceResponse) => {
    setSelectedAbsence(absence);
    setDetailDialogOpen(true);
  };

  const resetAdvancedSearch = () => {
    setSelectedStudent(null);
    setSelectedModule(null);
    setSpecificDate('');
  };

  const handleAdvancedSearch = () => {
    if (selectedStudent && selectedModule) {
      loadAbsencesByStudentAndModule(selectedStudent.idStudent, selectedModule.idModule);
    } else if (selectedStudent) {
      loadAbsencesByStudent(selectedStudent.idStudent);
    } else if (selectedModule) {
      loadAbsencesByModule(selectedModule.idModule);
    } else if (specificDate) {
      loadAbsencesByDate(specificDate);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getJustifiedColor = (justified: boolean) => {
    return justified ? 'success' : 'error';
  };

  const getJustifiedText = (justified: boolean) => {
    return justified ? 'Justifiée' : 'Non justifiée';
  };

  // Colonnes pour le tableau dynamique
  const columns: Column<AbsenceResponse>[] = [
    {
      key: 'studentName',
      title: 'Étudiant',
      render: (item) => (
        <Box>
          <Typography variant="body2" fontWeight="bold" color={BROWN_COLOR}>
            {item.studentName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Matricule: {item.studentMatricule}
          </Typography>
        </Box>
      )
    },
    {
      key: 'moduleName',
      title: 'Module',
      render: (item) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {item.moduleName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.moduleId}
          </Typography>
        </Box>
      )
    },
    {
      key: 'date',
      title: 'Date',
      render: (item) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ fontSize: 16, color: DARK_GOLD }} />
          <Typography variant="body2">
            {formatDate(item.date)}
          </Typography>
        </Box>
      )
    },
    {
      key: 'reason',
      title: 'Raison',
      render: (item) => (
        <Chip 
          label={getReasonText(item.reason)} 
          size="small"
          sx={{ 
            backgroundColor: getReasonColor(item.reason),
            color: 'black',
            fontWeight: 'medium'
          }}
        />
      )
    },
    {
      key: 'justified',
      title: 'Statut',
      render: (item) => (
        <Chip 
          label={getJustifiedText(item.justified)} 
          color={getJustifiedColor(item.justified)}
          size="small"
          variant={item.justified ? "filled" : "outlined"}
        />
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (item) => (
        <Tooltip title="Voir les détails">
          <IconButton
            color="primary"
            onClick={() => handleViewDetails(item)}
            size="small"
            sx={{ 
              color: DARK_GOLD,
              '&:hover': { 
                backgroundColor: `${DARK_GOLD}20` 
              }
            }}
          >
            <Visibility />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  // Filtres pour le tableau dynamique
  const filters = [
    {
      key: 'reason',
      label: 'Raison',
      options: [
        { value: 'all', label: 'Toutes les raisons' },
        ...Object.values(AbsenceReason).map(reason => ({
          value: reason,
          label: getReasonText(reason)
        }))
      ]
    },
    {
      key: 'justified',
      label: 'Statut',
      options: [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'true', label: 'Justifiées' },
        { value: 'false', label: 'Non justifiées' }
      ]
    },
    {
      key: 'studentId',
      label: 'Étudiant',
      options: [
        { value: 'all', label: 'Tous les étudiants' },
        ...students.map(student => ({
          value: student.idStudent,
          label: `${student.nom} ${student.prenom}`
        }))
      ]
    },
    {
      key: 'moduleId',
      label: 'Module',
      options: [
        { value: 'all', label: 'Tous les modules' },
        ...modules.map(module => ({
          value: module.idModule,
          label: module.nom
        }))
      ]
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date' as const, // Nouveau type pour le calendrier
      options: [
        { value: 'all', label: 'Toutes les dates' },
        // Les autres options de dates seront générées dynamiquement
      ]
    }
  ];

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f5f5 0%, #f8f9fa 100%)', minHeight: '100vh' }}>
    
      {/* Tableau dynamique avec tous les filtres intégrés */}
      <TableauDynamique
        data={absences}
        columns={columns}
        getRowId={(item) => item.idAbsence}
        onRowClick={handleViewDetails}
        emptyMessage="Aucune absence trouvée"
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ backgroundColor: DARK_GOLD }}>
              <School />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" color={BROWN_COLOR}>
                Gestion des Absences
              </Typography>
            </Box>
          </Box>
        }
        filters={filters}
        showActions={false}
        showSearch={true}
        showImportExport={false}
        showAddButton={false}
        showFilters={true}
        // Bouton personnalisé pour la recherche avancée
        customButtons={[
          {
            label: 'Recherche Avancée',
            onClick: () => setAdvancedSearchOpen(true),
            variant: 'outline' as const,
            icon: <School />,
            className: 'border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-white'
          },
          {
            label: 'Actualiser',
            onClick: loadAllAbsences,
            variant: 'outline' as const,
            icon: <Refresh />,
            className: 'bg-[#A52A2A] text-white hover:bg-[#8B1A1A]'
          }
        ]}
      />

      {/* Dialog de recherche avancée */}
      <Dialog
        open={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: `${DARK_GOLD}10`,
            borderBottom: `2px solid ${DARK_GOLD}30`,
            color: BROWN_COLOR,
            fontWeight: 'bold'
          }}
        >
          Recherche Avancée
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1, p: 2 }}>
            {/* Recherche par étudiant */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, backgroundColor: `${DARK_GOLD}05`, borderRadius: 2 }}>
                <Typography variant="h6" color={BROWN_COLOR} gutterBottom>
                  <Person sx={{ mr: 1 }} />
                  Recherche par Étudiant
                </Typography>
                <select
                  value={selectedStudent?.idStudent || ''}
                  onChange={(e) => {
                    const studentId = e.target.value;
                    const student = students.find(s => s.idStudent === studentId) || null;
                    setSelectedStudent(student);
                    setSelectedModule(null);
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
                >
                  <option value="">Sélectionner un étudiant</option>
                  {students.map((student) => (
                    <option key={student.idStudent} value={student.idStudent}>
                      {student.nom} {student.prenom} - {student.matricule}
                    </option>
                  ))}
                </select>
              </Card>
            </Grid>

            {/* Recherche par module */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, backgroundColor: `${DARK_GOLD}05`, borderRadius: 2 }}>
                <Typography variant="h6" color={BROWN_COLOR} gutterBottom>
                  <School sx={{ mr: 1 }} />
                  Recherche par Module
                </Typography>
                <select
                  value={selectedModule?.idModule || ''}
                  onChange={(e) => {
                    const moduleId = e.target.value;
                    const module = modules.find(m => m.idModule === moduleId) || null;
                    setSelectedModule(module);
                    setSelectedStudent(null);
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
                >
                  <option value="">Sélectionner un module</option>
                  {modules.map((module) => (
                    <option key={module.idModule} value={module.idModule}>
                      {module.nom} - {module.diplomeNom}
                    </option>
                  ))}
                </select>
              </Card>
            </Grid>

            {/* Recherche par date */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, backgroundColor: `${DARK_GOLD}05`, borderRadius: 2 }}>
                <Typography variant="h6" color={BROWN_COLOR} gutterBottom>
                  <CalendarToday sx={{ mr: 1 }} />
                  Recherche par Date
                </Typography>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
                />
              </Card>
            </Grid>

            {/* Résumé de la recherche */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, backgroundColor: `${DARK_GOLD}05`, borderRadius: 2 }}>
                <Typography variant="h6" color={BROWN_COLOR} gutterBottom>
                  Critères de recherche sélectionnés
                </Typography>
                <Stack spacing={1}>
                  {selectedStudent && (
                    <Typography variant="body2">
                      <strong>Étudiant:</strong> {selectedStudent.nom} {selectedStudent.prenom}
                    </Typography>
                  )}
                  {selectedModule && (
                    <Typography variant="body2">
                      <strong>Module:</strong> {selectedModule.nom}
                    </Typography>
                  )}
                  {specificDate && (
                    <Typography variant="body2">
                      <strong>Date:</strong> {formatDate(specificDate)}
                    </Typography>
                  )}
                  {!selectedStudent && !selectedModule && !specificDate && (
                    <Typography variant="body2" color="text.secondary">
                      Aucun critère sélectionné
                    </Typography>
                  )}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => {
              setAdvancedSearchOpen(false);
              resetAdvancedSearch();
            }}
            sx={{ 
              color: 'text.secondary',
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={() => {
              resetAdvancedSearch();
              loadAllAbsences();
              setAdvancedSearchOpen(false);
            }}
            sx={{ 
              color: BROWN_COLOR,
            }}
          >
            Tout Afficher
          </Button>
          <Button 
            onClick={handleAdvancedSearch}
            disabled={!selectedStudent && !selectedModule && !specificDate}
            variant="contained"
            sx={{ 
              backgroundColor: BROWN_COLOR,
              '&:hover': {
                backgroundColor: '#8B1A1A'
              }
            }}
          >
            Rechercher
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de détails */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: `${DARK_GOLD}10`,
            borderBottom: `2px solid ${DARK_GOLD}30`,
            color: BROWN_COLOR,
            fontWeight: 'bold'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Visibility sx={{ color: DARK_GOLD }} />
            Détails de l'absence
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAbsence && (
            <Grid container spacing={3} sx={{ mt: 1, p: 1 }}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2, backgroundColor: `${DARK_GOLD}05`, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color={BROWN_COLOR} gutterBottom>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 18 }} />
                      Informations de l'étudiant
                    </Box>
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                    {selectedAbsence.studentName}
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Matricule: {selectedAbsence.studentMatricule}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {selectedAbsence.studentId}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2, backgroundColor: `${DARK_GOLD}05`, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color={BROWN_COLOR} gutterBottom>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School sx={{ fontSize: 18 }} />
                      Informations du module
                    </Box>
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                    {selectedAbsence.moduleName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {selectedAbsence.moduleId}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2, backgroundColor: `${DARK_GOLD}05`, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color={BROWN_COLOR} gutterBottom>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 18 }} />
                      Date de l'absence
                    </Box>
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(selectedAbsence.date)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2, backgroundColor: `${DARK_GOLD}05`, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color={BROWN_COLOR} gutterBottom>
                    Statut de justification
                  </Typography>
                  <Chip 
                    label={getJustifiedText(selectedAbsence.justified)} 
                    color={getJustifiedColor(selectedAbsence.justified)}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ p: 2, backgroundColor: `${DARK_GOLD}05`, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color={BROWN_COLOR} gutterBottom>
                    Raison de l'absence
                  </Typography>
                  <Chip 
                    label={getReasonText(selectedAbsence.reason)} 
                    sx={{ 
                      backgroundColor: getReasonColor(selectedAbsence.reason),
                      color: 'black',
                      fontWeight: 'bold'
                    }}
                  />
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDetailDialogOpen(false)}
            sx={{ 
              color: BROWN_COLOR,
              fontWeight: 'bold'
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Affichage des erreurs */}
      {error && (
        <Box sx={{ mt: 2 }}>
          <Alert 
            severity="error"
            sx={{
              borderRadius: 2,
              border: `1px solid #f5c6cb`
            }}
            onClose={clearError}
          >
            {error}
          </Alert>
        </Box>
      )}
    </Box>
  );
}