"use client";
import React, { useState, useEffect } from "react";
import { ModuleRequest, ModuleResponse } from "@/lib/types";
import { addModule, updateModule} from "@/lib/modules";
import {fetchEnseignants} from "@/lib/enseignant";
import {fetchDiplomes} from "@/lib/diplome";
import toast from "react-hot-toast";
import { FaSave, FaTimes, FaBook, FaCalculator, FaClock, FaChalkboardTeacher, FaGraduationCap } from "react-icons/fa";

interface ModuleFormProps {
    moduleInitial?: ModuleResponse | null;
    onSave: (module: ModuleRequest | ModuleResponse) => Promise<void>;
    onCancel: () => void;
}

export default function ModuleForm({ moduleInitial, onSave, onCancel }: ModuleFormProps) {
    const [formData, setFormData] = useState<ModuleRequest>({
        nom: "",
        coefficient: 1,
        description: "",
        heuresTotal: 0,
        heuresCours: 0,
        heuresTD: 0,
        heuresTP: 0,
        enseignantId: "",
        diplomeId: ""
    });
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [enseignants, setEnseignants] = useState<any[]>([]);
    const [diplomes, setDiplomes] = useState<any[]>([]);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (moduleInitial) {
            setFormData({
                nom: moduleInitial.nom,
                coefficient: moduleInitial.coefficient,
                description: moduleInitial.description || "",
                heuresTotal: moduleInitial.heuresTotal,
                heuresCours: moduleInitial.heuresCours,
                heuresTD: moduleInitial.heuresTD,
                heuresTP: moduleInitial.heuresTP,
                enseignantId: moduleInitial.enseignantId,
                diplomeId: moduleInitial.diplomeId
            });
        }
        
        // Charger la liste des enseignants et diplômes
        loadEnseignants();
        loadDiplomes();
    }, [moduleInitial]);

    const loadEnseignants = async () => {
        try {
            setLoading(true);
            const data = await fetchEnseignants();
            setEnseignants(data);
        } catch (error) {
            console.error("Erreur chargement enseignants:", error);
            toast.error("Erreur lors du chargement des enseignants");
        } finally {
            setLoading(false);
        }
    };

    const loadDiplomes = async () => {
        try {
            setLoading(true);
            const data = await fetchDiplomes();
            setDiplomes(data);
        } catch (error) {
            console.error("Erreur chargement diplômes:", error);
            toast.error("Erreur lors du chargement des diplômes");
        } finally {
            setLoading(false);
        }
    };

    // CORRECTION : Fonction unifiée pour gérer tous les changements
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => {
            let newValue: any = value;
            
            // Conversion en number pour les champs numériques
            if (name.includes("heures") || name === "coefficient") {
                newValue = value === "" ? 0 : Number(value);
            }
            
            const newData = {
                ...prev,
                [name]: newValue
            };
            
            // CORRECTION : Recalcul automatique du total si une heure change
            if (name.includes("heures")) {
                newData.heuresTotal = newData.heuresCours + newData.heuresTD + newData.heuresTP;
            }
            
            return newData;
        });
    };

    // CORRECTION : Fonction simplifiée pour les heures
    const handleHeuresInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: "cours" | "td" | "tp") => {
        const value = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value));
        
        setFormData(prev => {
            const newData = {
                ...prev,
                [`heures${type.toUpperCase()}`]: value
            };
            
            // Calcul automatique du total
            newData.heuresTotal = newData.heuresCours + newData.heuresTD + newData.heuresTP;
            
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        
        // Validation
        if (!formData.nom.trim()) {
            setError("Le nom du module est requis");
            setSubmitting(false);
            return;
        }
        
        if (formData.coefficient <= 0) {
            setError("Le coefficient doit être supérieur à 0");
            setSubmitting(false);
            return;
        }
        
        if (formData.heuresTotal <= 0) {
            setError("Le nombre d'heures total doit être supérieur à 0");
            setSubmitting(false);
            return;
        }
        
        if (!formData.enseignantId) {
            setError("Veuillez sélectionner un enseignant");
            setSubmitting(false);
            return;
        }
        
        if (!formData.diplomeId) {
            setError("Veuillez sélectionner un diplôme");
            setSubmitting(false);
            return;
        }

        // Validation de la répartition des heures
        if (formData.heuresCours + formData.heuresTD + formData.heuresTP !== formData.heuresTotal) {
            setError("La somme des heures (Cours + TD + TP) doit être égale au total");
            setSubmitting(false);
            return;
        }

        try {
            await onSave(moduleInitial ? { ...formData, idModule: moduleInitial.idModule } : formData);
            toast.success(moduleInitial ? "Module modifié avec succès" : "Module créé avec succès");
        } catch (error) {
            console.error("Erreur sauvegarde module:", error);
            setError("Erreur lors de l'enregistrement du module");
        } finally {
            setSubmitting(false);
        }
    };

    const selectedEnseignant = enseignants.find(e => 
        e.enseignantId?.toString() === formData.enseignantId || e.id?.toString() === formData.enseignantId
    );

    const selectedDiplome = diplomes.find(d => 
        d.idDiplome?.toString() === formData.diplomeId || d.id?.toString() === formData.diplomeId
    );

    return (
        <div>
            <div>
                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Section Informations de base */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                            Informations du module
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nom du module */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-black">
                                    Nom du Module *
                                </label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                                    placeholder="Entrez le nom du module"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            {/* Coefficient */}
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-black">
                                    Coefficient *
                                </label>
                                <input
                                    type="number"
                                    name="coefficient"
                                    value={formData.coefficient}
                                    onChange={handleChange}
                                    min="1"
                                    max="10"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                                    required
                                    disabled={submitting}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-4 space-y-1">
                            <label className="block text-xs font-bold text-black">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                                placeholder="Description du module (optionnel)"
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {/* Section Répartition des heures - CORRIGÉE */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                            Répartition des heures
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-black">
                                    Heures Cours
                                </label>
                                <input
                                    type="number"
                                    name="heuresCours" // AJOUT: attribut name
                                    value={formData.heuresCours}
                                    onChange={handleChange} // CHANGEMENT: utiliser handleChange au lieu de handleHeuresInputChange
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                                    disabled={submitting}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-black">
                                    Heures TD
                                </label>
                                <input
                                    type="number"
                                    name="heuresTD" // AJOUT: attribut name
                                    value={formData.heuresTD}
                                    onChange={handleChange} // CHANGEMENT: utiliser handleChange
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                                    disabled={submitting}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-black">
                                    Heures TP
                                </label>
                                <input
                                    type="number"
                                    name="heuresTP" // AJOUT: attribut name
                                    value={formData.heuresTP}
                                    onChange={handleChange} // CHANGEMENT: utiliser handleChange
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                                    disabled={submitting}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-black">
                                    Total (auto)
                                </label>
                                <input
                                    type="number"
                                    value={formData.heuresTotal}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 font-semibold"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Le total est calculé automatiquement à partir de la somme des heures
                        </p>
                    </div>

                    {/* Les autres sections restent inchangées */}
                    {/* Section Enseignant */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                            Enseignant assigné
                        </h3>
                        <div className="space-y-2">
                            {loading ? (
                                <div className="text-center py-4 text-gray-500">
                                    Chargement des enseignants...
                                </div>
                            ) : enseignants.length === 0 ? (
                                <div className="text-center py-4 text-red-500">
                                    Aucun enseignant disponible
                                </div>
                            ) : (
                                <>
                                    <label className="block text-xs font-bold text-black">
                                        Sélectionnez l'enseignant *
                                    </label>
                                    <select
                                        name="enseignantId"
                                        value={formData.enseignantId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                                        required
                                        disabled={submitting}
                                    >
                                        <option value="">Sélectionnez un enseignant</option>
                                        {enseignants.map(enseignant => (
                                            <option 
                                                key={enseignant.enseignantId || enseignant.id} 
                                                value={enseignant.enseignantId || enseignant.id}
                                            >
                                                {enseignant.user?.prenom} {enseignant.user?.nom} - {enseignant.specialite}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {selectedEnseignant && (
                                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                            <p className="text-xs text-green-700">
                                                <span className="font-semibold">Enseignant sélectionné:</span> {selectedEnseignant.user?.prenom} {selectedEnseignant.user?.nom} - {selectedEnseignant.specialite}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Section Diplôme */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
                            Diplôme associé
                        </h3>
                        <div className="space-y-2">
                            {loading ? (
                                <div className="text-center py-4 text-gray-500">
                                    Chargement des diplômes...
                                </div>
                            ) : diplomes.length === 0 ? (
                                <div className="text-center py-4 text-red-500">
                                    Aucun diplôme disponible
                                </div>
                            ) : (
                                <>
                                    <label className="block text-xs font-bold text-black">
                                        Sélectionnez le diplôme *
                                    </label>
                                    <select
                                        name="diplomeId"
                                        value={formData.diplomeId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                                        required
                                        disabled={submitting}
                                    >
                                        <option value="">Sélectionnez un diplôme</option>
                                        {diplomes.map(diplome => (
                                            <option 
                                                key={diplome.idDiplome || diplome.id} 
                                                value={diplome.idDiplome || diplome.id}
                                            >
                                                {diplome.nomDiplome} - {diplome.typeDiplome}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {selectedDiplome && (
                                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                            <p className="text-xs text-blue-700">
                                                <span className="font-semibold">Diplôme sélectionné:</span> {selectedDiplome.nomDiplome} - {selectedDiplome.typeDiplome}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Boutons de soumission */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={submitting}
                            className="px-6 py-3 text-sm bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg hover:bg-[#B38C0F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <FaSave className="h-4 w-4" />
                            {submitting ? 'En cours...' : (moduleInitial ? 'Modifier' : 'Créer')} le module
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}