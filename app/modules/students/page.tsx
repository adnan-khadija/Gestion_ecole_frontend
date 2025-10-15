"use client";
import React, { useState, useEffect } from "react";
import TableauDynamique, { Column } from "@/components/TableauDynamique";
import { fetchModules, fetchStudentByModule, assignStudentToModule, removeStudentFromModule, countStudentsInModule } from "@/lib/modules";
import { fetchStudents } from "@/lib/students";
import { ModuleResponse, StudentResponse } from "@/lib/types";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/Loading";
import { FaUsers, FaBook, FaPlus, FaGraduationCap, FaChartBar, FaClock } from "react-icons/fa";
import Button from "@/components/Button";

const PRIMARY_COLOR = "#1e40af";
const SECONDARY_COLOR = "#374151";
const ACCENT_COLOR = "#6366f1";

export default function StudentsByModulePage() {
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleResponse | null>(null);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [allStudents, setAllStudents] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Charger les modules au montage
  useEffect(() => {
    const loadModules = async () => {
      try {
        const data = await fetchModules();
        setModules(data);
      } catch (err) {
        console.error("Erreur chargement modules:", err);
        toast.error("Erreur lors du chargement des modules");
      } finally {
        setLoading(false);
      }
    };
    loadModules();

    // Charger tous les étudiants pour l'affectation
    const loadAllStudents = async () => {
      try {
        const data = await fetchStudents();
        setAllStudents(data);
      } catch (err) {
        console.error("Erreur chargement étudiants:", err);
      }
    };
    loadAllStudents();
  }, []);

  // Charger les étudiants du module sélectionné
  const handleModuleSelect = async (moduleId: string) => {
    const module = modules.find((m) => m.idModule === moduleId) || null;
    setSelectedModule(module);
    if (!module) return;
    setLoadingStudents(true);
    try {
      const [studentsData, countData] = await Promise.all([
        fetchStudentByModule(module.idModule),
        countStudentsInModule(module.idModule)
      ]);
      setStudents(studentsData);
      setStudentCount(countData);
    } catch (err) {
      console.error("Erreur chargement étudiants:", err);
      toast.error("Erreur lors du chargement des étudiants");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Ajouter un étudiant au module
  const handleAssignStudent = async () => {
    if (!selectedModule || !selectedStudentId) {
      toast.error("Veuillez sélectionner un étudiant et un module");
      return;
    }
    try {
      await assignStudentToModule(selectedModule.idModule, selectedStudentId);
      toast.success("Étudiant assigné avec succès !");
      setSelectedStudentId("");
      handleModuleSelect(selectedModule.idModule);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'assignation");
    }
  };

  // Supprimer un étudiant du module
  const handleRemoveStudent = async (id: string) => {
    if (!selectedModule) return;
    try {
      await removeStudentFromModule(selectedModule.idModule, id);
      toast.success("Étudiant supprimé du module");
      handleModuleSelect(selectedModule.idModule);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Colonnes pour le tableau
  const studentColumns: Column<StudentResponse>[] = [
    {
      key: "nom",
      title: "Nom complet",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm font-medium">
              {s.prenom[0]}{s.nom[0]}
            </span>
          </div>
          <span className="font-medium">{s.prenom} {s.nom}</span>
        </div>
      ),
    },
    { 
      key: "email", 
      title: "Email",
      render: (s) => <span className="text-gray-600">{s.email}</span>
    },
    { 
      key: "cne", 
      title: "CNE",
      render: (s) => <span className="font-mono text-gray-700">{s.cne}</span>
    },
    {
      key: "dateInscription",
      title: "Date d'inscription",
      render: (s) => (
        <span className="text-gray-600">
          {new Date(s.dateInscription).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Chargement des modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* En-tête */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaGraduationCap className="text-2xl" style={{ color: PRIMARY_COLOR }} />
            </div>
            <h1 className="text-4xl font-bold" style={{ color: PRIMARY_COLOR }}>
              Gestion des Étudiants par Module
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Gérez efficacement l'affectation des étudiants aux différents modules de formation
          </p>
        </div>

        {/* Sélecteur de module */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FaBook style={{ color: PRIMARY_COLOR }} />
            </div>
            <h2 className="text-2xl font-semibold" style={{ color: SECONDARY_COLOR }}>
              Sélection du Module
            </h2>
          </div>
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Choisir un module
            </label>
            <select
              className="w-full md:w-96 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
              onChange={(e) => handleModuleSelect(e.target.value)}
              value={selectedModule?.idModule || ""}
            >
              <option value="">-- Sélectionnez un module --</option>
              {modules.map((mod) => (
                <option key={mod.idModule} value={mod.idModule}>
                  {mod.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Informations du module */}
        {selectedModule && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaBook className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Module</h3>
              </div>
              <p className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
                {selectedModule.nom}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FaUsers className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Étudiants</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">{studentCount}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FaChartBar className="text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Coefficient</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">{selectedModule.coefficient}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <FaClock className="text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Volume Horaire</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">{selectedModule.heuresTotal}h</p>
            </div>
          </div>
        )}

        {/* Ajout d'un étudiant */}
        {selectedModule && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
              <div className="flex-1 space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Assigner un nouvel étudiant
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  value={selectedStudentId}
                >
                  <option value="">-- Sélectionner un étudiant --</option>
                  {allStudents.map((s) => (
                    <option key={s.idStudent} value={s.idStudent}>
                      {s.prenom} {s.nom} ({s.cne}) - {s.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button
                className="flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
                style={{ 
                  backgroundColor: PRIMARY_COLOR,
                  color: 'white'
                }}
                onClick={handleAssignStudent}
                disabled={!selectedStudentId}
              >
                <FaPlus />
                Assigner l'étudiant
              </Button>
            </div>
          </div>
        )}

        {/* Tableau des étudiants */}
        {selectedModule && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FaUsers style={{ color: PRIMARY_COLOR }} />
                  </div>
                  <h2 className="text-2xl font-semibold" style={{ color: SECONDARY_COLOR }}>
                    Liste des Étudiants
                  </h2>
                </div>
                <div className="text-sm text-gray-500">
                  {students.length} étudiant{students.length !== 1 ? 's' : ''} trouvé{students.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="p-1">
              {loadingStudents ? (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-3 text-gray-600">Chargement des étudiants...</p>
                  </div>
                </div>
              ) : (
                <TableauDynamique<StudentResponse>
                  data={students}
                  columns={studentColumns}
                  getRowId={(s) => s.idStudent}
                  emptyMessage={
                    <div className="text-center py-16">
                      <FaUsers className="mx-auto text-4xl text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun étudiant assigné
                      </h3>
                      <p className="text-gray-500">
                        Commencez par assigner des étudiants à ce module
                      </p>
                    </div>
                  }
                  showSearch={true}
                  showActions={true}
                  showAddButton={false}
                  onDelete={(id) => handleRemoveStudent(id)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}