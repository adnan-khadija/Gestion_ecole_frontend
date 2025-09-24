import React, { useState, useEffect } from 'react';
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
import { register, updateUser, fetchUserIdByEmail } from '@/lib/auth';
import { addStudent, updateStudent } from '@/lib/students';
import toast from 'react-hot-toast';

interface StudentMultiStepFormProps {
  onSave: (student: Student) => void;
  onCancel?: () => void;
  studentToEdit?: Student;
  isEditing?: boolean;
  userToEdit?: Utilisateur;
}

const StudentMultiStepForm: React.FC<StudentMultiStepFormProps> = ({ 
  onSave, 
  onCancel, 
  isEditing = false, 
  studentToEdit, 
  userToEdit 
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>(userToEdit?.id || '');
  const [studentId, setStudentId] = useState<string>(studentToEdit?.idStudent || '');
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

  // Pré-remplissage en mode édition
  useEffect(() => {
    if (isEditing && userToEdit) {
      setUserData({
        email: userToEdit.email || '',
        nom: userToEdit.nom || '',
        prenom: userToEdit.prenom || '',
        telephone: userToEdit.telephone || '',
        password: 'Student@1234',
        role: userToEdit.role || RoleUtilisateur.ETUDIANT,
        image: userToEdit.image || '',
      });
      
      if (studentToEdit) {
        setStudentData({
          matricule: studentToEdit.matricule || '',
          dateNaissance: studentToEdit.dateNaissance || '',
          lieuNaissance: studentToEdit.lieuNaissance || '',
          sexe: studentToEdit.sexe || Sexe.M,
          nationalite: studentToEdit.nationalite || '',
          adresse: studentToEdit.adresse || '',
          ville: studentToEdit.ville || '',
          situationFamiliale: studentToEdit.situationFamiliale || SituationFamiliale.CELIBATAIRE,
          niveau: studentToEdit.niveau || Niveau.PREMIEREANNEE,
          groupe: studentToEdit.groupe || '',
          anneeAcademique: studentToEdit.anneeAcademique || '',
          statut: studentToEdit.statut || StatutEtudiant.ACTIF,
          bourse: studentToEdit.bourse || YesOrNo.NO,
          handicap: studentToEdit.handicap || YesOrNo.NO,
        });
        
        if (studentToEdit.customFields) {
          setCustomFields(
            studentToEdit.customFields.map(field => ({
              name: field.fieldName,
              value: field.fieldValue
            }))
          );
        }
        
        setStudentId(studentToEdit.idStudent);
        setUserId(userToEdit?.id || '');
      }
    }
  }, [isEditing, studentToEdit, userToEdit]);

  // Étape 1: Création/mise à jour utilisateur
 const handleUserSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    let uid = userId;

    if (isEditing) {
      // Si l'ID utilisateur n'est pas défini, on le récupère via l'email
      if (!uid && userData.email) {
        const fetchedId = await fetchUserIdByEmail(userData.email);
        if (!fetchedId) throw new Error('ID utilisateur introuvable via email');
        uid = fetchedId;
      }

      if (!uid) throw new Error('ID utilisateur manquant pour la mise à jour');

      await updateUser(uid, userData);
      toast.success('Utilisateur mis à jour avec succès !');
    } else {
      const newUser = await register(userData);
      uid = (newUser as any).userId ?? (newUser as any).id;
      if (!uid) throw new Error('userId non renvoyé par le serveur');
      toast.success('Utilisateur créé avec succès !');
    }

    setUserId(uid);
    setStep(2);

  } catch (error: any) {
    console.error('Erreur user:', error);
    toast.error(error?.message || "Erreur lors de la création/mise à jour de l'utilisateur");
  } finally {
    setLoading(false);
  }
};


  // Étape 2: Ajout/mise à jour étudiant
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

      let savedStudent: StudentResponse;

      if (isEditing && studentId) {
        savedStudent = await updateStudent(studentId, payload);
        toast.success("Étudiant mis à jour avec succès !");
      } else {
        if (!userId) throw new Error('ID utilisateur manquant');
        savedStudent = await addStudent(userId, payload);
        toast.success("Étudiant ajouté avec succès !");
      }

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
      setStudentId('');

      // Fermer le formulaire
      onSave(savedStudent as Student);
      
    } catch (error: any) {
      console.error('Erreur student:', error);
      const serverMsg = error?.response?.data?.message ?? error?.message;
      toast.error(serverMsg || "Erreur lors de l'ajout des détails étudiant");
    } finally {
      setLoading(false);
    }
  };

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

  const addCustomField = () => {
    setCustomFields([...customFields, { name: '', value: '' }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: 'name' | 'value', value: string) => {
    const updatedFields = [...customFields];
    updatedFields[index][field] = value;
    setCustomFields(updatedFields);
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
          {customFields.map((field, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nom du champ"
                value={field.name}
                onChange={e => updateCustomField(index, 'name', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Valeur"
                value={field.value}
                onChange={e => updateCustomField(index, 'value', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeCustomField(index)}
                className="text-red-600 hover:text-red-800 px-2"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addCustomField}
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
          {loading ? 'Création...' : isEditing ? 'Mettre à jour' : 'Créer l\'étudiant'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Modifier l\'étudiant' : 'Ajouter un nouvel étudiant'}
        </h1>
        <div className="flex items-center mt-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-[#D4A017] text-white' : 'bg-gray-300 text-gray-600'}`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#D4A017]' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-[#D4A017] text-white' : 'bg-gray-300 text-gray-600'}`}>
            2
          </div>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className={step >= 1 ? 'text-[#D4A017] font-medium' : 'text-gray-500'}>Informations de base</span>
          <span className={step >= 2 ? 'text-[#D4A017] font-medium' : 'text-gray-500'}>Détails étudiant</span>
        </div>
      </div>

      {step === 1 ? renderUserForm() : renderStudentForm()}
    </div>
  );
};

export default StudentMultiStepForm;