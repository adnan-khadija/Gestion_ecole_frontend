"use client";
import React from "react";
import TableauDynamique from "@/components/TableauDynamique";
import { useState, useEffect } from "react";
import { Column, ExportConfig, FilterConfig, ImportConfig } from "@/components/TableauDynamique";
import { ModuleResponse } from "@/lib/types";
import { 
  addModule, 
  updateModule, 
  deleteModule, 
  removeEnseignantFromModule,
  removeStudentFromModule,
  fetchModules,
} from "@/lib/modules";
import { fetchEnseignants } from "@/lib/enseignant";
import { fetchDiplomes } from "@/lib/diplome";
import { getUserById } from '@/lib/auth';
import toast from "react-hot-toast";
import { FaEye, FaUsers, FaBook, FaClock, FaChalkboardTeacher, FaUserPlus, FaUserMinus } from "react-icons/fa";
import { LoadingSpinner } from "@/components/Loading";
import ModuleForm from "@/components/forms/ModuleForm";
import ModuleCard from "@/components/cards/ModuleCard";
import AssignTeacherForm from "@/components/forms/AssignTeacherForm";
import AssignStudentForm from "@/components/forms/AssignStudentForm";

interface EnseignantWithDetails {
  enseignantId: string;
  userId: string;
  nomComplet: string;
  specialite: string;
}

export default function ModulesPage() {
    const [modules, setModules] = useState<ModuleResponse[]>([]);
    const [enseignants, setEnseignants] = useState<EnseignantWithDetails[]>([]);
    const [diplomes, setDiplomes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingFiltres, setLoadingFiltres] = useState(true);
    const [selectedModule, setSelectedModule] = useState<ModuleResponse | null>(null);
    const [showAssignTeacher, setShowAssignTeacher] = useState(false);
    const [showAssignStudent,setShowAssignStudent]=useState(false);
    const [moduleToAssign, setModuleToAssign] = useState<ModuleResponse | null>(null);
    const [filters, setFilters] = useState<FilterConfig[]>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Charger les modules
                const modulesData = await fetchModules();
                setModules(modulesData);

                // Charger les enseignants avec leurs détails complets
                const enseignantsData = await fetchEnseignants();
                const enseignantsAvecDetails = await Promise.all(
                    enseignantsData.map(async (enseignant) => {
                        try {
                            const userDetails = await getUserById(enseignant.userId);
                            return {
                                enseignantId: enseignant.enseignantId,
                                userId: enseignant.userId,
                                nomComplet: `${userDetails.prenom} ${userDetails.nom}`,
                                specialite: enseignant.specialite || 'Non spécifiée'
                            };
                        } catch (error) {
                            console.error(`Erreur chargement détails enseignant ${enseignant.userId}:`, error);
                            return {
                                enseignantId: enseignant.enseignantId,
                                userId: enseignant.userId,
                                nomComplet: 'Inconnu',
                                specialite: enseignant.specialite || 'Non spécifiée'
                            };
                        }
                    })
                );

                // Charger les diplômes
                const diplomesData = await fetchDiplomes();

                setEnseignants(enseignantsAvecDetails);
                setDiplomes(diplomesData);

                // Mettre à jour les filtres avec les données chargées
                setFilters([
                    {
                        key: "coefficient",
                        label: "Coefficient",
                        type: "number",
                        options: [
                            { value: "1", label: "1" },
                            { value: "2", label: "2" },
                            { value: "3", label: "3" },
                            { value: "4", label: "4" },
                            { value: "5", label: "5" }
                        ]
                    },
                  
                    {
                        key: "enseignantId",
                        label: "Enseignant",
                        type: "select",
                        options: [
                           
                            ...enseignantsAvecDetails.map(enseignant => ({
                                value: enseignant.enseignantId,
                                label: `${enseignant.nomComplet} - ${enseignant.specialite}`
                            }))
                        ]
                    },
                    {
                        key: "diplomeId",
                        label: "Diplôme",
                        type: "select",
                        options: [
                           
                            ...diplomesData.map(diplome => ({
                                value: diplome.idDiplome,
                                label: diplome.nomDiplome
                            }))
                        ]
                    }
                ]);

            } catch (err) {
                console.error("Erreur chargement données:", err);
                toast.error("Erreur lors du chargement des données");
            } finally {
                setLoading(false);
                setLoadingFiltres(false);
            }
        };
        loadInitialData();
    }, []);

    const refreshModules = async () => {
        try {
            const refreshedModules = await fetchModules();
            setModules(refreshedModules);
        } catch (err) {
            console.error("Erreur rafraîchissement modules:", err);
            toast.error("Erreur lors du rafraîchissement des modules");
        }
    };

    // Fonction pour assigner un enseignant
    const handleAssignTeacher = async (module: ModuleResponse) => {
        setModuleToAssign(module);
        setShowAssignTeacher(true);
    };
  const handleAssignStudent = async (module: ModuleResponse) => {
        setModuleToAssign(module);
        setShowAssignStudent(true);
    };
    // Fonction pour retirer un enseignant
    const handleRemoveTeacher = async (moduleId: string) => {
        try {
            await removeEnseignantFromModule(moduleId);
            toast.success("Enseignant retiré avec succès");
            await refreshModules();
        } catch (err) {
            console.error("Erreur retrait enseignant:", err);
            toast.error("Erreur lors du retrait de l'enseignant");
            throw err;
        }
    };

    // Colonnes modifiées avec actions pour les enseignants
    const colonnesModules: Column<ModuleResponse>[] = [
        {
            key: "nom",
            title: "Nom du Module",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedModule(item); }}
                        className="text-[#D4A017] hover:text-gray-700 transition-colors"
                        title="Voir les détails"
                    >
                        <FaEye className="h-4 w-4" />
                    </button>   
                    <span className="whitespace-nowrap text-gray-500">{item.nom}</span>
                </div>        
            )
        },
        {
            key: "coefficient",
            title: "Coefficient",
            render: (item) => (
                <span className="font-semibold text-gray-700">{item.coefficient}</span>
            )
        },
        {
            key: "enseignant",
            title: "Enseignant",
            render: (item) => (
                <div className="flex items-center gap-2">
                    {item.enseignantNom ? (
                        <>
                         <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveTeacher(item.idModule);
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors ml-2 "
                                title="Retirer l'enseignant"
                            >
                                <FaUserMinus className="h-3 w-3" />
                            </button>
                            <span className="text-gray-600">
                                {item.enseignantPrenom} {item.enseignantNom}
                            </span>
                           
                        </>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAssignTeacher(item);
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-[#A52A2A] text-white text-xs rounded hover:bg-[#8B1A1A] transition-colors"
                            title="Assigner un enseignant"
                        >
                            <FaUserPlus className="h-3 w-3" />
                            Assigner
                        </button>
                    )}
                </div>
            )
        },
        {
            key: "heuresTotal",
            title: "Heures Total",
            render: (item) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <FaClock className="h-3 w-3" />
                    <span>{item.heuresTotal}h</span>
                </div>
            )
        },
        {
            key:"heuresCours",
            title:"Heures Cours",
            render:(item) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <span>{item.heuresCours}h</span>
                </div>
            )
        },
        {
            key:"heuresTD",
            title:"Heures TD",
            render:(item) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <span>{item.heuresTD}h</span>
                </div>
            )
        },
        {
            key:"heuresTP",
            title:"Heures TP",
            render:(item) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <span>{item.heuresTP}h</span>
                </div>
            )
        },
        {
            key: "nombreEtudiants",
            title: "Étudiants",
            render: (item) => (
                <div className="flex items-center gap-1 text-gray-600">
                   <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAssignStudent(item);
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-[#D4A017] text-white text-xs  mx-4 rounded hover:bg-[#fce2c4ff] transition-colors"
                            title="Assigner un enseignant"
                        >
                            <FaUserPlus className="h-3 w-3" />
                            Assigner
                        </button>
                    <span>{item.nombreEtudiants}</span>
                </div>
            )
        },
        {
            key: "diplomeNom",
            title: "Diplôme",
            render: (item) => (
                <span className="text-gray-600">{item.diplomeNom}</span>
            )
        },
    ];

    // Configuration d'import
    const importConfig: ImportConfig<ModuleResponse> = {
        headers: ["nom", "coefficient", "description", "heuresTotal", "heuresCours", "heuresTD", "heuresTP", "enseignantId", "diplomeId"],
        apiUrl: "http://localhost:8080/api/v1/admin/modules/import"
    };

    // Configuration d'export
    const exportConfig: ExportConfig<ModuleResponse> = {
        filename: 'modules',
        apiUrl: 'http://localhost:8080/api/v1/admin/modules/export'
    };

    // Gestion des actions
    const handleAdd = async (module: any) => {
        try {
            const res = await addModule(module);
            toast.success("Module ajouté avec succès");
            await refreshModules(); 
        } catch (err) {
            console.error("Erreur ajout module:", err);
            toast.error("Erreur lors de l'ajout du module");
            throw err;
        }
    };

    const handleEdit = async (module: ModuleResponse) => {
        try {
            const moduleId = module.idModule;
            const res = await updateModule(moduleId, module);
            toast.success("Module mis à jour avec succès");
            await refreshModules();
        } catch (err) {
            console.error("Erreur modification module:", err);
            toast.error("Erreur lors de la mise à jour du module");
            throw err;
        }
    };

    const handleDelete = async (id: number | string) => {
        try {
            const idString = id.toString();
            await deleteModule(idString);
            toast.success("Module supprimé avec succès");
            await refreshModules();
        } catch (err) {
            console.error("Erreur suppression module:", err);
            toast.error("Erreur lors de la suppression du module");
            throw err;
        }
    };

    // Fonction pour obtenir l'ID d'une ligne
    const getRowId = (module: ModuleResponse) => {
        return module.idModule;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-8">
            {/* Indicateur de chargement des filtres */}
            {loadingFiltres && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <LoadingSpinner size="sm" />
                    <p className="text-blue-700 mt-2">Chargement des filtres...</p>
                </div>
            )}

            <TableauDynamique<ModuleResponse>
                data={modules}
                columns={colonnesModules}
                getRowId={getRowId}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="Aucun module trouvé"
                
                // Configuration import/export
                importConfig={importConfig}
                exportConfig={exportConfig}
                
                // Configuration des filtres dynamiques
                filters={filters}
                
                // Composant de formulaire personnalisé
                formComponent={({ itemInitial, onSave, onCancel }) => (
                    <ModuleForm
                        moduleInitial={itemInitial} 
                        onSave={onSave}
                        onCancel={onCancel}
                    />
                )}
                
                // Options d'affichage
                showActions={true}
                showSearch={true}
                showImportExport={true}
                showFilters={true}
                showAddButton={true}
            />
            
            {/* Carte de détail du module */}
            {selectedModule && (
                <ModuleCard
                    module={selectedModule} 
                    onClose={() => setSelectedModule(null)}
                />
            )}

            {/* Modale pour assigner un enseignant */}
            {showAssignTeacher && moduleToAssign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[1px]">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl">
                        <AssignTeacherForm
                            moduleId={moduleToAssign.idModule}
                            onSave={() => {
                                setShowAssignTeacher(false);
                                setModuleToAssign(null);
                                refreshModules();
                            }}
                            onCancel={() => {
                                setShowAssignTeacher(false);
                                setModuleToAssign(null);
                            }}
                        />
                    </div>
                </div>
            )}
             {/* Modale pour assigner un Student */}
            {showAssignStudent && moduleToAssign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[1px]">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl">
                        <AssignStudentForm
                            moduleId={moduleToAssign.idModule}
                            onSave={() => {
                                setShowAssignTeacher(false);
                                setModuleToAssign(null);
                                refreshModules();
                            }}
                            onCancel={() => {
                                setShowAssignTeacher(false);
                                setModuleToAssign(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}