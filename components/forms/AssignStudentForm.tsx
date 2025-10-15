"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaUserGraduate } from "react-icons/fa";
import { fetchStudents } from "@/lib/students";
import { assignStudentToModule } from "@/lib/modules";
import { StudentResponse } from "@/lib/types";

interface AssignStudentFormProps {
  moduleId: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function AssignStudentForm({
  moduleId,
  onSave,
  onCancel,
}: AssignStudentFormProps) {
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Charger la liste des étudiants
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchStudents();
        console.log("Étudiants récupérés:", data);
        setStudents(data);
      } catch (err) {
        console.error("Erreur chargement étudiants:", err);
        toast.error("Erreur lors du chargement des étudiants");
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, []);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      toast.error("Veuillez sélectionner un étudiant");
      return;
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(selectedStudent)) {
      toast.error("ID étudiant invalide");
      return;
    }

    setLoading(true);
    try {
      await assignStudentToModule(moduleId, selectedStudent);
      toast.success("Étudiant assigné avec succès");
      onSave();
    } catch (err) {
      console.error("Erreur assignation étudiant:", err);
      toast.error("Erreur lors de l’assignation de l’étudiant");
    } finally {
      setLoading(false);
    }
  };

  // Interface visuelle
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaUserGraduate className="text-[#A52A2A]" />
        Assigner un étudiant
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un étudiant
          </label>
          {loadingStudents ? (
            <div className="p-3 text-center text-gray-500">
              Chargement des étudiants...
            </div>
          ) : (
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A52A2A] focus:border-transparent"
              required
            >
              <option value="">Choisir un étudiant</option>
              {students.map((student) => (
                <option key={student.idStudent} value={student.idStudent}>
                  {student.prenom} {student.nom} - {student.email}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || loadingStudents}
            className="px-4 py-2 bg-[#A52A2A] text-white rounded-lg hover:bg-[#8B1A1A] disabled:opacity-50 transition-colors"
          >
            {loading ? "Assignation..." : "Assigner"}
          </button>
        </div>
      </form>
    </div>
  );
}
