// components/forms/PaiementForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { PaiementRequest, PaiementResponse, PaiementUpdateRequest, StatutPaiement, TypePaiement, ModePaiement } from '@/lib/types';
import { createPaiement, updatePaiement } from '@/lib/paiement';
import { fetchStudents } from '@/lib/students';
import { Student } from '@/lib/types';
import toast from 'react-hot-toast';

interface PaiementFormProps {
  onSave: (paiement: any) => void;
  paiementInitial?: any;
  onCancel?: () => void;
}

const PaiementForm: React.FC<PaiementFormProps> = ({
  onSave,
  paiementInitial,
  onCancel
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState<PaiementRequest>({
    studentId: '',
    typePaiement: TypePaiement.FRAIS_SCOLARITE,
    montant: 0,
    datePaiement: new Date().toISOString().split('T')[0],
    modePaiement: ModePaiement.ESPECES,
    statutPaiement: StatutPaiement.EN_ATTENTE,
    anneeAcademique: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1),
    referenceTransaction: '',
    description: '',
    remarques: ''
  });

  // Charger la liste des étudiants
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const studentsData = await fetchStudents();
        setStudents(studentsData || []);
      } catch (err: any) {
        console.error('Erreur chargement étudiants:', err);
        toast.error('Erreur lors du chargement de la liste des étudiants');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Initialiser le formulaire avec les données existantes en mode édition
  useEffect(() => {
    if (paiementInitial && students.length > 0) {
      console.log("=== INITIALISATION DU FORMULAIRE PAIEMENT ===");
      console.log("Paiement initial:", paiementInitial);

      let studentIdToSet = "";
      if (paiementInitial.studentId) {
        studentIdToSet = paiementInitial.studentId.toString();
      }

      // Validation que l'étudiant existe
      if (studentIdToSet) {
        const studentExists = students.some(s => 
          s.idStudent?.toString() === studentIdToSet || s.id?.toString() === studentIdToSet
        );
        if (!studentExists) {
          console.warn("Étudiant initial non trouvé dans la liste:", studentIdToSet);
          studentIdToSet = "";
        }
      }

      setFormData({
        studentId: studentIdToSet,
        typePaiement: paiementInitial.typePaiement || TypePaiement.FRAIS_SCOLARITE,
        montant: paiementInitial.montant || 0,
        datePaiement: paiementInitial.datePaiement?.split('T')[0] || new Date().toISOString().split('T')[0],
        modePaiement: paiementInitial.modePaiement || ModePaiement.ESPECES,
        statutPaiement: paiementInitial.statutPaiement || StatutPaiement.EN_ATTENTE,
        anneeAcademique: paiementInitial.anneeAcademique || new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1),
        referenceTransaction: paiementInitial.referenceTransaction || '',
        description: paiementInitial.description || '',
        remarques: paiementInitial.remarques || ''
      });
    }
  }, [paiementInitial, students]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setError('');

    if (type === 'number') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: parseFloat(value) || 0 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value 
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.studentId.trim()) {
      setError('L\'étudiant est requis');
      return false;
    }
    if (formData.montant <= 0) {
      setError('Le montant doit être supérieur à 0');
      return false;
    }
    if (!formData.datePaiement) {
      setError('La date est requise');
      return false;
    }
    if (!formData.anneeAcademique.trim()) {
      setError("L'année académique est requise");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    console.log("=== VALIDATION DES DONNÉES PAIEMENT ===");
    console.log("Données avant envoi:", formData);

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    try {
      let response;
      if (paiementInitial && (paiementInitial.idPaiement || paiementInitial.id)) {
        const paiementId = (paiementInitial.idPaiement || paiementInitial.id).toString();
        console.log("Mise à jour du paiement ID:", paiementId);
        
        const updateData: PaiementUpdateRequest = {
          typePaiement: formData.typePaiement,
          montant: formData.montant,
          datePaiement: formData.datePaiement,
          modePaiement: formData.modePaiement,
          statutPaiement: formData.statutPaiement,
          referenceTransaction: formData.referenceTransaction,
          description: formData.description,
          remarques: formData.remarques
        };

        response = await updatePaiement(paiementId, updateData);
        toast.success("Paiement modifié avec succès !");
      } else {
        console.log("Création d'un nouveau paiement");
        response = await createPaiement(formData);
        toast.success("Paiement ajouté avec succès !");
      }
      onSave(response);
    } catch (err: any) {
      console.error("Erreur détaillée:", err);
      const errorMessage = err.response?.data?.message || err.message || "Erreur lors de l'enregistrement";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudent = students.find(s => 
    s.idStudent?.toString() === formData.studentId || s.id?.toString() === formData.studentId
  );

  const getTypeText = (type: TypePaiement) => {
    switch (type) {
      case TypePaiement.FRAIS_SCOLARITE:
        return 'Frais de scolarité';
      case TypePaiement.FRAIS_INSCRIPTION:
        return 'Frais d\'inscription';
      case TypePaiement.FRAIS_EXAMEN:
        return 'Frais d\'examen';
      case TypePaiement.FRAIS_BIBLIOTHEQUE:
        return 'Frais de bibliothèque';
      case TypePaiement.FRAIS_TRANSPORT:
        return 'Frais de transport';
      case TypePaiement.FRAIS_HEBERGEMENT:
        return 'Frais d\'hébergement';
      case TypePaiement.FRAIS_MATERIEL:
        return 'Frais de matériel';
      case TypePaiement.AUTRE:
        return 'Autre';
      default:
        return type;
    }
  };

  const getModeText = (mode: ModePaiement) => {
    switch (mode) {
      case ModePaiement.ESPECES:
        return 'Espèces';
      case ModePaiement.CHEQUE:
        return 'Chèque';
      case ModePaiement.VIREMENT_BANCAIRE:
        return 'Virement bancaire';
      case ModePaiement.CARTE_BANCAIRE:
        return 'Carte bancaire';
      case ModePaiement.MENSUEL:
        return 'Mensuel';
      case ModePaiement.TRIMESTRIEL:
        return 'Trimestriel';
      case ModePaiement.ANNUEL:
        return 'Annuel';
      default:
        return mode;
    }
  };

  const getStatusText = (status: StatutPaiement) => {
    switch (status) {
      case StatutPaiement.EN_ATTENTE:
        return 'En attente';
      case StatutPaiement.VALIDE:
        return 'Validé';
      case StatutPaiement.ANNULE:
        return 'Annulé';
      case StatutPaiement.REMBOURSE:
        return 'Remboursé';
      default:
        return status;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Section Informations principales */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Informations principales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Étudiant*</label>
            {loading ? (
              <div className="text-center py-4 text-gray-500">
                Chargement des étudiants...
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-4 text-red-500">
                Aucun étudiant disponible
              </div>
            ) : (
              <select
                name="studentId"
                value={formData.studentId || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
              >
                <option value="">Sélectionner un étudiant</option>
                {students.map((student) => (
                  <option 
                    key={student.idStudent || student.id} 
                    value={student.idStudent || student.id}
                  >
                    {student.nom} {student.prenom} - {student.matricule}
                  </option>
                ))}
              </select>
            )}
            
            {selectedStudent && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-xs text-green-700">
                  <span className="font-semibold">Étudiant sélectionné:</span> {selectedStudent.nom} {selectedStudent.prenom} - {selectedStudent.matricule}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Montant (FCFA)*</label>
            <input
              type="number"
              name="montant"
              value={formData.montant}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Type de paiement*</label>
            <select
              name="typePaiement"
              value={formData.typePaiement}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
              {Object.values(TypePaiement).map((type) => (
                <option key={type} value={type}>
                  {getTypeText(type)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Date de paiement*</label>
            <input
              type="date"
              name="datePaiement"
              value={formData.datePaiement}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Mode et statut */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Mode et statut
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Mode de paiement*</label>
            <select
              name="modePaiement"
              value={formData.modePaiement}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
              {Object.values(ModePaiement).map((mode) => (
                <option key={mode} value={mode}>
                  {getModeText(mode)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Statut*</label>
            <select
              name="statutPaiement"
              value={formData.statutPaiement}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
              {Object.values(StatutPaiement).map((status) => (
                <option key={status} value={status}>
                  {getStatusText(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section Informations académiques */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Informations académiques
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Année académique*</label>
            <input
              type="text"
              name="anneeAcademique"
              value={formData.anneeAcademique}
              onChange={handleChange}
              required
              placeholder="Ex: 2024-2025"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Référence transaction</label>
            <input
              type="text"
              name="referenceTransaction"
              value={formData.referenceTransaction}
              onChange={handleChange}
              placeholder="Numéro de transaction bancaire"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Description et remarques */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Description et remarques
        </h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Description du paiement..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Remarques</label>
            <textarea
              name="remarques"
              value={formData.remarques}
              onChange={handleChange}
              rows={2}
              placeholder="Remarques supplémentaires..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Aide pour les champs obligatoires */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-700">
          <strong>Note :</strong> Les champs marqués d'un astérisque (*) sont obligatoires.
        </p>
      </div>

      {/* Boutons de soumission */}
      <div className="flex justify-end space-x-4 mt-8">
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
          className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg hover:bg-[#B38C0F] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'En cours...' : paiementInitial ? 'Modifier' : 'Créer'} le paiement
        </button>
      </div>
    </form>
  );
};

export default PaiementForm;