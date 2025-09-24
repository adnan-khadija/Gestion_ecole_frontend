import axios from 'axios';
import { StudentRequest, StudentResponse,Student } from './types';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:8080/api/v1/admin/students';

// Dans lib/students.ts
export const fetchStudents = async (): Promise<Student[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Retourner directement le tableau d'étudiants
    return response.data?.data?.content || [];
  } catch (error: any) {
    console.error('Erreur récupération étudiants:', error);
    throw error;
  }
};
export const addStudent = async (
  userId: string,
  student: Omit<StudentRequest, 'idStudent'>
): Promise<StudentResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');
  if (!userId) throw new Error('UserId manquant');

  try {
    const response = await axios.post(`${API_URL}/${userId}`, student, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Erreur ajout étudiant:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur ajout étudiant');
  }
};
export const updateStudent = async (
  id: string,
  student: Partial<StudentRequest>
): Promise<StudentResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.put(`${API_URL}/${id}`, student, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Erreur mise à jour étudiant:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur mise à jour étudiant');
  }
};
export const getStudentById = async (id: string): Promise<StudentResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Erreur récupération étudiant:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur récupération étudiant');
  }
}
export const deleteStudent = async (id: string): Promise<void> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Erreur suppression étudiant:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur suppression étudiant');
  }
};
const handleExport = async () => {
  const token = Cookies.get('token');
  const response = await axios.get(`${API_URL}/admin/students/export`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'etudiants.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};


