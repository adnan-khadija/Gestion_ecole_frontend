"use client";
import React from "react";
import TableauDynamique from "@/components/TableauDynamique";
import { useState, useEffect } from "react";
import { Column, ExportConfig, FilterConfig, ImportConfig } from "@/components/TableauDynamique";
import { ModuleResponse } from "@/lib/types";
import { addModule, updateModule, deleteModule } from "@/lib/modules"; // Corrigé les imports
import { fetchModules } from "@/lib/modules";
import toast from "react-hot-toast";
import { FaEye, FaUsers, FaBook, FaClock } from "react-icons/fa";
import { LoadingSpinner } from "@/components/Loading";
import ModuleForm from "@/components/forms/ModuleForm";
import ModuleCard from "@/components/cards/ModuleCard";

export default function ModulesPage() {
    const [modules, setModules] = useState<ModuleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedModule, setSelectedModule] = useState<ModuleResponse | null>(null);

    useEffect(() => {
        const loadModules = async () => {
            try {
                const data = await fetchModules();
                console.log("Modules récupérés :", data);
                setModules(data);
            } catch (err) {
                console.error("Erreur chargement modules:", err);
                toast.error("Erreur lors du chargement des modules");
            } finally {
                setLoading(false);
            }
        };
        loadModules();
    }, []);

    const refreshModules = async () => {
        const refreshedModules = await fetchModules();
        setModules(refreshedModules);
    };

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
                <span className="text-gray-600">
                    {item.enseignantPrenom} {item.enseignantNom}
                </span>
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

    // Configuration des filtres adaptée aux modules
    const filters: FilterConfig[] = [
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
            key: "nombreEtudiants",
            label: "Nombre d'étudiants",
            type: "number",
            options: [
                { value: "0-10", label: "0-10" },
                { value: "11-20", label: "11-20" },
                { value: "21-50", label: "21-50" },
                { value: "51+", label: "51+" }
            ]
        }
    ];

    // Gestion des actions - CORRIGÉ pour utiliser les fonctions modules
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
                
                // Configuration des filtres
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
            
            {selectedModule && (
                <ModuleCard
                    module={selectedModule} 
                    onClose={() => setSelectedModule(null)}
                />
            )}
        </div>
    );
}