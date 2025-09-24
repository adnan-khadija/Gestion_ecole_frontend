"use client";

import React, { useState, useEffect } from 'react';
import { Diplome, Mention, ModeRemise, TypeDiplome, Etudiant,Enseignant } from '@/lib/types';
import { addDiplome, updateDiplome, getEtudiants, getProfesseurs } from '@/lib/services';
import toast from 'react-hot-toast';

interface DiplomeFormProps {
  onSave: (diplome: Diplome) => void;
  diplomeInitial?: Diplome;
  onCancel?: () => void;
}

const DiplomeForm = ({ onSave, diplomeInitial, onCancel }: DiplomeFormProps) => {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [Enseignants, setProfesseurs] = useState<// components/StudentMultiStepForm.tsx
  import React, { useState } from 'react';
  import {
    Sexe,
    SituationFamiliale,
    StatutEtudiant,
    YesOrNo,
    Student,
    Niveau,
    RoleUtilisateur,
    StudentRequest,
    StudentResponse,
    Utilisateur,
  } from '@/lib/types';
  import { register,updateUser } from '@/lib/auth';
  import { addStudent, fetchStudents,updateStudent,} from '@/lib/students';
  
  import toast from 'react-hot-toast';
  
  interface StudentMultiStepFormProps {
    onSave: (student: Student) => void;
    onCancel?: () => void;
    studentToEdit?: Student; // Nouveau prop pour l'édition
    isEditing?: boolean; // Mode édition
    userToEdit?: Utilisateur,
  
  }
  
  const StudentMultiStepForm = ({ onSave, onCancel ,isEditing,studentToEdit}: StudentMultiStepFormProps) => {
    const [step, setStep] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [userId, setUserId] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
  
    // Données utilisateur (étape 1)
    const [userData, setUserData] = useState({
      email: '',
      nom: '',
      prenom: '',
      telephone: '',
      password: 'Student@1234',
      role: RoleUtilisateur.ETUDIANT as RoleUtilisateur,
      image: '',
    });
  
    // Données étudiant (étape 2)
    const [studentData, setStudentData] = useState<Omit<StudentRequest, 'customFields'>>({
      matricule: '',
      dateNaissance: '',
      lieuNaissance: '',
      sexe: Sexe.M,
      nationalite: '',
      adresse: '',
      ville: '',
      situationFamiliale: SituationFamiliale.CELIBATAIRE,
      niveau: Niveau.PREMIEREANNEE,
      groupe: '',
      anneeAcademique: '',
      statut: StatutEtudiant.ACTIF,
      bourse: YesOrNo.NO,
      handicap: YesOrNo.NO,
    });
  
    const [customFields, setCustomFields] = useState<{ name: string; value: string }[]>([]);
  
    // Étape 1: Création utilisateur
    const handleUserSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        // Préparer les données utilisateur sans l'image base64
        const userPayload = { 
          ...userData,
          image: imageFile ? imageFile.name : null
        };
  
        const newUser = await register(userPayload);
        const uid = (newUser as any).userId ?? (newUser as any).id;
        if (!uid) throw new Error('userId non renvoyé par le serveur');
        
        setUserId(uid);
        setStep(2);
        toast.success('Utilisateur créé avec succès !');
      } catch (error: any) {
        toast.error(error?.message || 'Erreur lors de la création de l\'utilisateur');
      } finally {
        setLoading(false);
      }
    };
  
    // Étape 2: Ajout étudiant
    const handleStudentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        const payload: StudentRequest = {
          matricule: studentData.matricule || '',
          dateNaissance: studentData.dateNaissance || '',
          lieuNaissance: studentData.lieuNaissance || '',
          sexe: studentData.sexe,
          nationalite: studentData.nationalite || '',
          adresse: studentData.adresse || '',
          ville: studentData.ville || '',
          situationFamiliale: studentData.situationFamiliale,
          niveau: studentData.niveau || '',
          groupe: studentData.groupe || '',
          anneeAcademique: studentData.anneeAcademique || '',
          statut: studentData.statut,
          bourse: studentData.bourse,
          handicap: studentData.handicap,
          customFields: customFields
            .filter((f) => f.name && f.name.trim() !== '')
            .map((f) => ({ 
              fieldName: f.name.trim(), 
              fieldValue: f.value || '' 
            })),
        };
        let savedStudent:StudentResponse ;
        if(isEditing && studentToEdit) {
          // Mise à jour de l'étudiant existant
          savedStudent = await updateStudent(studentToEdit.idStudent, payload);
          toast.success("Étudiant mis à jour avec succès !");
        }
       
        const newStudent = await addStudent(userId, payload);
        onSave(newStudent as Student);
        toast.success("Étudiant ajouté avec succès !");
        
        // Réinitialiser le formulaire
        setStep(1);
        setUserData({ 
          email: '', 
          nom: '', 
          prenom: '', 
          telephone: '', 
          password: 'Student@1234', 
          role: RoleUtilisateur.ETUDIANT,
          image: '' 
        });
        setImageFile(null);
        setStudentData({
          matricule: '',
          dateNaissance: '',
          lieuNaissance: '',
          sexe: Sexe.M,
          nationalite: '',
          adresse: '',
          ville: '',
          situationFamiliale: SituationFamiliale.CELIBATAIRE,
          niveau: Niveau.PREMIEREANNEE,
          groupe: '',
          anneeAcademique: '',
          statut: StatutEtudiant.ACTIF,
          bourse: YesOrNo.NO,
          handicap: YesOrNo.NO,
        });
        setCustomFields([]);
        setUserId('');
        
      } catch (error: any) {
        const serverMsg = error?.response?.data?.message ?? error?.message;
        toast.error(serverMsg || "Erreur lors de l'ajout des détails étudiant");
      } finally {
        setLoading(false);
      }
    };
  
    // Handlers
    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setUserData((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        setUserData(prev => ({ ...prev, image: file.name }));
      }
    };
  
    const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
  
      if (name === 'bourse' || name === 'handicap') {
        setStudentData((prev) => ({ ...prev, [name]: value as YesOrNo }));
        return;
      }
  
      if (name === 'sexe') {
        setStudentData((prev) => ({ ...prev, sexe: value as Sexe }));
        return;
      }
  
      if (name === 'situationFamiliale') {
        setStudentData((prev) => ({ ...prev, situationFamiliale: value as SituationFamiliale }));
        return;
      }
  
      if (name === 'niveau') {
        setStudentData((prev) => ({ ...prev, niveau: value as Niveau }));
        return;
      }
  
      if (name === 'statut') {
        setStudentData((prev) => ({ ...prev, statut: value as StatutEtudiant }));
        return;
      }
  
      setStudentData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    // Étape 1: Formulaire utilisateur
    const renderUserForm = () => (
      <form onSubmit={handleUserSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-black mb-4">Étape 1: Informations de base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">Nom*</label>
              <input
                type="text"
                name="nom"
                value={userData.nom}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">Prénom*</label>
              <input
                type="text"
                name="prenom"
                value={userData.prenom}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">Email*</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">Téléphone*</label>
              <input
                type="tel"
                name="telephone"
                value={userData.telephone}
                onChange={handleUserChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-black">Photo de profil</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              />
              {imageFile && (
                <p className="text-sm text-gray-500 mt-1">Fichier sélectionné: {imageFile.name}</p>
              )}
            </div>
          </div>
        </div>
  
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#D4A017] text-white rounded-lg hover:bg-[#b38714] disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Suivant'}
          </button>
        </div>
      </form>
    );
  
    // Étape 2: Formulaire étudiant
    const renderStudentForm = () => (
      <form onSubmit={handleStudentSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-black mb-4">Étape 2: Informations étudiant</h2>
          
          {/* Section Informations personnelles */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-black mb-4">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Matricule*</label>
                <input
                  type="text"
                  name="matricule"
                  value={studentData.matricule}
                  onChange={handleStudentChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Sexe*</label>
                <select
                  name="sexe"
                  value={studentData.sexe}
                  onChange={handleStudentChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  {Object.values(Sexe).map(sexe => (
                    <option key={sexe} value={sexe}>{sexe}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Date de naissance*</label>
                <input
                  type="date"
                  name="dateNaissance"
                  value={studentData.dateNaissance}
                  onChange={handleStudentChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Lieu de naissance</label>
                <input
                  type="text"
                  name="lieuNaissance"
                  value={studentData.lieuNaissance}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
  
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Nationalité</label>
                <input
                  type="text"
                  name="nationalite"
                  value={studentData.nationalite}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
  
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Situation familiale</label>
                <select
                  name="situationFamiliale"
                  value={studentData.situationFamiliale}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  {Object.values(SituationFamiliale).map(situation => (
                    <option key={situation} value={situation}>{situation}</option>
                  ))}
                </select>
              </div>
  
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Adresse</label>
                <input
                  type="text"
                  name="adresse"
                  value={studentData.adresse}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
  
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Ville</label>
                <input
                  type="text"
                  name="ville"
                  value={studentData.ville}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          </div>
  
          {/* Section Scolarité */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-black mb-4">Scolarité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Niveau</label>
                <select
                  name="niveau"
                  value={studentData.niveau}
                  onChange={handleStudentChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  {Object.values(Niveau).map(niveau => (
                    <option key={niveau} value={niveau}>{niveau}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Groupe</label>
                <input
                  type="text"
                  name="groupe"
                  value={studentData.groupe}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Année académique</label>
                <input
                  type="text"
                  name="anneeAcademique"
                  value={studentData.anneeAcademique}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
  
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">Statut</label>
                <select
                  name="statut"
                  value={studentData.statut}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  {Object.values(StatutEtudiant).map(statut => (
                    <option key={statut} value={statut}>{statut}</option>
                  ))}
                </select>
              </div>
            </div>
  
            {/* Section Bourse et Handicap */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-black mb-4">Options supplémentaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-black">Handicap</label>
                  <select
                    name="handicap"
                    value={studentData.handicap}
                    onChange={handleStudentChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    {Object.values(YesOrNo).map(handicap => (
                      <option key={handicap} value={handicap}>{handicap}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-black">Boursier</label>
                  <select
                    name="bourse"
                    value={studentData.bourse}
                    onChange={handleStudentChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    {Object.values(YesOrNo).map(bourse => (
                      <option key={bourse} value={bourse}>{bourse}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
  
          {/* Champs personnalisés */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-black mb-4">Champs personnalisés</h3>
            {customFields.map((field, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nom du champ"
                  value={field.name}
                  onChange={e => {
                    const updated = [...customFields];
                    updated[idx].name = e.target.value;
                    setCustomFields(updated);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Valeur"
                  value={field.value}
                  onChange={e => {
                    const updated = [...customFields];
                    updated[idx].value = e.target.value;
                    setCustomFields(updated);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setCustomFields(fields => fields.filter((_, i) => i !== idx))}
                  className="text-red-600 hover:text-red-800 px-2"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setCustomFields(fields => [...fields, { name: '', value: '' }])}
              className="px-4 py-2 bg-[#D4A017] text-white rounded hover:bg-[#b38714] text-sm"
            >
              + Ajouter un champ
            </button>
          </div>
        </div>
  
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#D4A017] text-white rounded-lg hover:bg-[#b38714] disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer l\'étudiant'}
          </button>
        </div>
      </form>
    );
  
    return (
      <div>
        {/* Indicateur d'étape */}
        <div className="flex mb-6">
          <div className={`flex-1 text-center py-2 ${step >= 1 ? 'bg-[#D4A017] text-white' : 'bg-gray-200'}`}>
            Étape 1: Utilisateur
          </div>
          <div className={`flex-1 text-center py-2 ${step >= 2 ? 'bg-[#D4A017] text-white' : 'bg-gray-200'}`}>
            Étape 2: Étudiant
          </div>
        </div>
  
        {step === 1 ? renderUserForm() : renderStudentForm()}
      </div>
    );
  };
  
  export default StudentMultiStepForm;[]>([]);
  const [diplome, setDiplome] = useState<Omit<Diplome, 'id'>>({
    typeDiplome: TypeDiplome.LICENCE,
    nomDiplome: '',
    niveau: '',
    nombreProf: 0,
    anneeObtention: new Date().getFullYear(),
    estValide: false,
    etudiant: null,
    mention: MentionDiplome.PASSABLE,
    dateDelivrance: '',
    signatureAdmin: null,
    qrCode: '',
    fichierDiplome: '',
    commentaire: '',
    modeRemise: ModeRemiseDiplome.PRESENTIEL,
    Enseignants: [],
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Chargement des étudiants et Enseignants
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [etudiantsResponse, EnseignantsResponse] = await Promise.all([
          getEtudiants(),
          getProfesseurs()
        ]);
        setEtudiants(etudiantsResponse.data);
        setProfesseurs(EnseignantsResponse.data);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Initialisation si diplomeInitial existe
  useEffect(() => {
    if (diplomeInitial) {
      setDiplome({
        typeDiplome: diplomeInitial.typeDiplome || TypeDiplome.LICENCE,
        nomDiplome: diplomeInitial.nomDiplome || '',
        niveau: diplomeInitial.niveau || '',
        nombreProf: diplomeInitial.nombreProf || 0,
        anneeObtention: diplomeInitial.anneeObtention || new Date().getFullYear(),
        estValide: diplomeInitial.estValide || false,
        etudiant: diplomeInitial.etudiant || null,
        mention: diplomeInitial.mention || MentionDiplome.PASSABLE,
        dateDelivrance: diplomeInitial.dateDelivrance || '',
        signatureAdmin: diplomeInitial.signatureAdmin || null,
        qrCode: diplomeInitial.qrCode || '',
        fichierDiplome: diplomeInitial.fichierDiplome || '',
        commentaire: diplomeInitial.commentaire || '',
        modeRemise: diplomeInitial.modeRemise || ModeRemiseDiplome.PRESENTIEL,
        Enseignants: diplomeInitial.Enseignants ? diplomeInitial.Enseignants.map(p => p.id) : [],
      });
    }
  }, [diplomeInitial]);

  // Gestion spécifique pour les Enseignants
  const handleProfesseurChange = (EnseignantId: number) => {
    setDiplome(prev => {
      const isSelected = prev.Enseignants.includes(EnseignantId);
      let newProfesseurs;
      
      if (isSelected) {
        newProfesseurs = prev.Enseignants.filter(id => id !== EnseignantId);
        setError(''); // Réinitialiser l'erreur lors de la désélection
      } else {
        if (prev.Enseignants.length >= 2) {
          setError("Maximum 2 Enseignants autorisés");
          return prev;
        }
        newProfesseurs = [...prev.Enseignants, EnseignantId];
        setError('');
      }
      
      return {
        ...prev,
        Enseignants: newProfesseurs
      };
    });
  };

  // Gestion des changements pour les autres champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "etudiant") {
  if (value === "") {
    // Si aucune sélection (valeur vide)
    setDiplome(prev => ({ ...prev, etudiant: null }));
  } else {
    const selectedId = parseInt(value);
    const selectedEtudiant = etudiants.find(e => e.id === selectedId) || null;
    setDiplome(prev => ({ ...prev, etudiant: selectedEtudiant }));
  }
}
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (diplome.Enseignants.length > 2) {
      setError("Maximum 2 Enseignants autorisés");
      setSubmitting(false);
      return;
    }
  if (!diplome.etudiant) {
    setError("Veuillez sélectionner un étudiant");
    setSubmitting(false);
    return;
  }

 

    try {
      const selectedProfesseurs = Enseignants.filter(p => diplome.Enseignants.includes(p.id));
      
      if (diplomeInitial && diplomeInitial.id) {
        const diplomeToUpdate = {
          ...diplome,
          Enseignants: selectedProfesseurs,
          id: diplomeInitial.id,
        };
        const response = await updateDiplome(diplomeInitial.id, diplomeToUpdate);
        onSave(response.data);
        toast.success("Diplôme modifié avec succès !");
      } else {
        const newDiplome = {
          ...diplome,
          Enseignants: selectedProfesseurs,
        };
        const response = await addDiplome(newDiplome);
        onSave(response.data);
        toast.success("Diplôme ajouté avec succès !");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Section Informations de base */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Informations du diplôme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Type de diplôme*</label>
            <select
              name="typeDiplome"
              value={diplome.typeDiplome}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
             {Object.values(TypeDiplome).map(type => (
  <option key={`type-${type}`} value={type}>{type}</option>
))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Nom du diplôme*</label>
            <input
              type="text"
              name="nomDiplome"
              value={diplome.nomDiplome}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Niveau</label>
            <input
              type="text"
              name="niveau"
              value={diplome.niveau}
              onChange={handleChange}
              placeholder="Ex: Bac+3, Bac+5"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Année d'obtention</label>
            <input
              type="number"
              name="anneeObtention"
              value={diplome.anneeObtention}
              onChange={handleChange}
              min="2000"
              max="2100"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section Détails du diplôme */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Détails du diplôme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Mention</label>
            <select
              name="mention"
              value={diplome.mention}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
             {Object.values(MentionDiplome).map(mention => (
  <option key={`mention-${mention}`} value={mention}>{mention}</option>
))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Date de délivrance</label>
            <input
              type="date"
              name="dateDelivrance"
              value={diplome.dateDelivrance}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Mode de remise</label>
            <select
              name="modeRemise"
              value={diplome.modeRemise}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            >
            {Object.values(ModeRemiseDiplome).map(mode => (
  <option key={`mode-${mode}`} value={mode}>{mode}</option>
))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Nombre de Enseignants</label>
            <input
              type="number"
              name="nombreProf"
              value={diplome.nombreProf}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

     {/* Section Étudiant */}
<div className="bg-white rounded-xl p-4 border border-gray-200">
  <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
    Étudiant diplômé
  </h3>
  <div className="space-y-2">
    {loading ? (
      <div className="text-center py-4 text-gray-500">
        Chargement des étudiants...
      </div>
    ) : etudiants.length === 0 ? (
      <div className="text-center py-4 text-red-500">
        Aucun étudiant disponible
      </div>
    ) : (
      <>
        <label className="block text-xs font-bold text-black">
          Sélectionnez l'étudiant
        </label>
        <select
          name="etudiant"
          value={diplome.etudiant?.id || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
        >
          <option value="">Sélectionner un étudiant</option>
          {etudiants.map((etudiant) => (
            <option key={etudiant.id} value={etudiant.id}>
              {etudiant.nom} {etudiant.prenom}
            </option>
          ))}
        </select>
        
        {/* Affichage de l'étudiant sélectionné */}
        {diplome.etudiant && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs text-green-700">
              <span className="font-semibold">Étudiant sélectionné:</span> {diplome.etudiant.nom} {diplome.etudiant.prenom}
            </p>
          </div>
        )}
      </>
    )}
  </div>
</div>

      {/* Section Professeurs */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Professeurs assignés
        </h3>
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-4 text-gray-500">
              Chargement des Enseignants...
            </div>
          ) : Enseignants.length === 0 ? (
            <div className="text-center py-4 text-red-500">
              Aucun Enseignant disponible
            </div>
          ) : (
            <>
              <label className="block text-xs font-bold text-black">
                Sélectionnez les Enseignants (max 2)
              </label>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {Enseignants.map((prof) => {
                  const checked = diplome.Enseignants.includes(prof.id);
                  return (
                    <label
                      key={prof.id}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                        checked ? 'bg-[#D4A017] text-white' : 'bg-white text-gray-700'
                      } hover:bg-[#F5E9DA] transition-colors`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleProfesseurChange(prof.id)}
                        className="form-checkbox h-4 w-4 text-[#D4A017] border-gray-300 rounded"
                      />
                      {prof.nom} {prof.prenom} - {prof.specialite}
                    </label>
                  );
                })}
              </div>
              
              {/* Message d'erreur en rouge pour la sélection des Enseignants */}
              {error && (
                <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                {diplome.Enseignants.length} / 2 Enseignants sélectionnés
              </p>
            </>
          )}
        </div>
      </div>

      {/* Section Statut et Commentaires */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4 pb-2 border-b border-gray-100">
          Statut et informations supplémentaires
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="estValide"
                  checked={diplome.estValide}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A017]"></div>
              </div>
              <span className="text-sm font-medium text-black">Diplôme validé</span>
            </label>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-black">Commentaire</label>
            <textarea
              name="commentaire"
              value={diplome.commentaire}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
              placeholder="Notes supplémentaires sur le diplôme..."
            />
          </div>
        </div>
      </div>

      {/* Boutons de soumission */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-3 text-sm bg-[#C0C0C0] text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 text-sm bg-[#D4A017] text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:ring-opacity-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'En cours...' : diplomeInitial ? 'Modifier' : 'Créer'} le diplôme
        </button>
      </div>
    </form>
  );
};

export default DiplomeForm;