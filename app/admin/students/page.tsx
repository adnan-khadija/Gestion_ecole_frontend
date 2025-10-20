'use client';
import React, { useState, useEffect } from "react";
import TableauDynamique, { Column, ImportConfig, ExportConfig, FilterConfig } from "@/components/TableauDynamique";
import { Student, UserResponse, Utilisateur } from "@/lib/types";
import { fetchStudents, updateStudent, deleteStudent } from "@/lib/students";
import toast from "react-hot-toast";
import { updateUser, deleteUser, getUsersStudents,fetchUserIdByEmail } from "@/lib/auth";
import StudentProfile from "@/components/cards/StudentProfile";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { LoadingSpinner } from "@/components/Loading";
import StudentMultiStepForm from "@/components/forms/EtudiantForm"; 

export default function EtudiantPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingUser, setEditingUser] = useState<Utilisateur | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les étudiants
        const studentsData = await fetchStudents();
        console.log("Étudiants récupérés:", studentsData);
        
        // Charger les utilisateurs étudiants
        const usersData = await getUsersStudents();
        
        if (studentsData) {
          setStudents(studentsData);
        }
        if (usersData) {
          setUsers(usersData);
        }
      } catch (err) {
        console.error("Erreur récupération données :", err);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Préparer les données utilisateur à partir d'un étudiant
 const prepareUserData = (student: Student): Utilisateur | undefined => {
  const user = users.find(u => u.email === student.email);
  if (!user) return undefined;

  return {
    id: user.idUser,
    email: user.email || '',
    nom: user.nom || '',
    prenom: user.prenom || '',
    telephone: user.telephone || '',
    role:user.role ||'',
    image: user.image || '',
   
  };
};


  // Colonnes du tableau avec actions
  const colonnesEtudiants: Column<Student>[] = [
    {
      key: "matricule",
      title: "Matricule",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStudent(item);
            }}
            className="text-[#D4A017] hover:text-gray-700 transition-colors"
            title="Voir les détails"
          >
            <FaEye className="h-4 w-4" />
          </button>
          <span className="whitespace-nowrap text-gray-500">{item.matricule || "—"}</span>
        </div>
      ),
    },
    { key: "nom", title: "Nom", render: (item) => <span className="text-gray-500">{item.nom}</span> },
    { key: "prenom", title: "Prénom", render: (item) => <span className="text-gray-500">{item.prenom}</span> },
    { key: "dateNaissance", title: "Date Naissance", render: (item) => <span className="text-gray-500">{item.dateNaissance}</span> },
    { key: "lieuNaissance", title: "Lieu Naissance", render: (item) => <span className="text-gray-500">{item.lieuNaissance}</span> },
    { key: "sexe", title: "Sexe", render: (item) => <span className="text-gray-500">{item.sexe}</span> },
    { key: "nationalite", title: "Nationalité", render: (item) => <span className="text-gray-500">{item.nationalite}</span> },
    { key: "telephone", title: "Téléphone", render: (item) => <span className="text-gray-500">{item.telephone}</span> },
    { key: "email", title: "Email", render: (item) => <span className="text-gray-500">{item.email}</span> },
    { key: "adresse", title: "Adresse", render: (item) => <span className="text-gray-500">{item.adresse}</span> },
    { key: "ville", title: "Ville", render: (item) => <span className="text-gray-500">{item.ville}</span> },
    { key: "situationFamiliale", title: "Situation Familiale", render: (item) => <span className="text-gray-500">{item.situationFamiliale}</span> },
    { key: "niveau", title: "Niveau", render: (item) => <span className="text-gray-500">{item.niveau}</span> },
    { key: "groupe", title: "Groupe", render: (item) => <span className="text-gray-500">{item.groupe}</span> },
    { key: "anneeAcademique", title: "Année Académique", render: (item) => <span className="text-gray-500">{item.anneeAcademique}</span> },
    { key: "statut", title: "Statut", render: (item) => <span className="text-gray-500">{item.statut}</span> },
    { key: "bourse", title: "Boursier", render: (item) => <span className="text-gray-500">{item.bourse ? "Oui" : "Non"}</span> },
    { key: "handicap", title: "Handicap", render: (item) => <span className="text-gray-500">{item.handicap ? "Oui" : "Non"}</span> },
  ];

   const refreshStudents = async () => {
      const resStudents = await fetchStudents();
      setStudents(resStudents);
    };
  // Gestion du clic sur Modifier
  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setEditingUser(prepareUserData(student));
    setIsFormOpen(true);
  };

  // Gestion du clic sur Supprimer
const handleDeleteClick = async (studentId: string) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cet étudiant et son compte utilisateur ?")) return;

  try {
    const studentToDelete = students.find(s => s.idStudent === studentId);
    if (!studentToDelete) throw new Error("Étudiant non trouvé");
    const userToDelete = users.find(u => u.email === studentToDelete.email);

    await deleteStudent(studentId);
    if (userToDelete) {
      await deleteUser(userToDelete.idUser);
    }

    // Rafraîchir la liste des étudiants
    await refreshStudents();

    toast.success("Étudiant et utilisateur supprimés avec succès");

    if (selectedStudent?.idStudent === studentId) setSelectedStudent(null);
    if (editingStudent?.idStudent === studentId) {
      setEditingStudent(null);
      setEditingUser(null);
      setIsFormOpen(false);
    }
  } catch (error: any) {
    console.error("Erreur suppression:", error);
    toast.error(error?.message || "Erreur lors de la suppression");
  }
};


  // Gestion de l'ajout
  const handleAdd = () => {
    setEditingStudent(null);
    setEditingUser(null);
    setIsFormOpen(true);
  };

  // Gestion de la sauvegarde
  const handleSave = async (savedStudent: Student) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          email: editingUser.email,
          nom: editingUser.nom,
          prenom: editingUser.prenom,
          telephone: editingUser.telephone,
          image: editingUser.image,
        });
      }
      await updateStudent(savedStudent.idStudent, savedStudent);

      // Rafraîchir la liste des étudiants
      await refreshStudents();

    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsFormOpen(false);
      setEditingStudent(null);
      setEditingUser(null);
    }
  };

  // Gestion de l'annulation
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingStudent(null);
    setEditingUser(null);
  };

  // Configuration import
  const importConfig: ImportConfig<Student> = {
   apiUrl: 'http://localhost:8080/api/v1/admin/students/import',
    headers: [
      "prenom",
      "nom",
      "matricule",
      "email",
      "telephone",
      "dateNaissance",
      "lieuNaissance",
      "sexe",
      "nationalite",
      "adresse",
      "ville",
      "situationFamiliale",
      "niveau",
      "groupe",
      "anneeAcademique",
      "statut",
      "bourse",
      "handicap"
    ],
  };

  // Configuration export
  const exportConfig: ExportConfig<Student> = {
  
    filename: 'etudiants',
    apiUrl: 'http://localhost:8080/api/v1/admin/students/all/export',  
  };

  // Filtres
  const filters: FilterConfig[] = [
    { 
      key: "statut", 
      label: "Statut", 
      options: [
        { value: "", label: "Tous" },
        { value: "Actif", label: "Actif" },
        { value: "Inactif", label: "Inactif" }
      ] 
    },
    { key: "niveau", label: "Niveau" ,
      options: Array.from(new Set(students.map(s => s.niveau))).map(n => ({ value: n, label: n }))
    },
    { key: "groupe", label: "Groupe" ,
      options: Array.from(new Set(students.map(s => s.groupe))).map(g => ({ value: g, label: g }))
    },
    { key: "anneeAcademique", label: "Année Académique" ,
      options: Array.from(new Set(students.map(s => s.anneeAcademique))).map(a => ({ value: a, label: a }))
    },
  ];

  return (
    <div className="container mx-auto p-4 space-y-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <TableauDynamique<Student>
            data={students || []}
            columns={colonnesEtudiants}
            getRowId={(student)=> student.idStudent}
            onAdd={handleAdd}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onRowClick={(item) => setSelectedStudent(item)}
            emptyMessage="Aucun étudiant trouvé"
            importConfig={importConfig}
            exportConfig={exportConfig}
            filters={filters}
            formComponent={({ itemInitial, onSave, onCancel }) => (
              <StudentMultiStepForm
                studentToEdit={itemInitial}
                userToEdit={itemInitial ? prepareUserData(itemInitial) : undefined}
                isEditing={!!itemInitial}
                onSave={onSave}
                onCancel={onCancel}
              />
            )}
            showActions={true}
            showSearch={true}
            showImportExport={true}
            showFilters={true}
            showAddButton={true}
          />

         

          {/* Profil étudiant */}
          {selectedStudent && (
            <StudentProfile
              student={selectedStudent}
              onClose={() => setSelectedStudent(null)}
            />
          )}
        </>
      )}
    </div>
  );
}