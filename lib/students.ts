import axios from 'axios';
import { Diplome, DiplomeResponse, StudentRequest, StudentResponse } from './types';
import Cookies from 'js-cookie';
import {getAuthHeaders} from "@/lib/auth";
import { get } from 'http';

const API_URL = 'http://localhost:8080/api/v1/admin/students';

// Dans lib/students.ts
export const fetchStudents = async (): Promise<StudentResponse[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}`, {
      headers: getAuthHeaders(),
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
export const getProfilStudentById = async (id: string): Promise<StudentResponse> => {
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
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération du profil de l'étudiant");
  }
  
};

export const genererCartesScolaires = async (idsEtudiants: string[]): Promise<Blob> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    console.log("Envoi requête génération cartes pour:", idsEtudiants);
    
    const response = await axios.post(`${API_URL}/cards`, idsEtudiants, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      responseType: 'blob',
      timeout: 30000, // 30 secondes timeout
    });

    console.log("Réponse reçue - Status:", response.status);
    console.log("Headers:", response.headers);
    console.log("Data type:", typeof response.data);
    
    // Vérifier le content-type
    const contentType = response.headers['content-type'];
    console.log("Content-Type:", contentType);
    
    if (!response.data || response.data.size === 0) {
      throw new Error("Réponse vide du serveur");
    }

    return response.data;
  } catch (error: any) {
    console.error('Erreur détaillée génération cartes scolaires:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    
    if (error.response?.data instanceof Blob) {
      // Si c'est un blob d'erreur, essayer de le lire
      const errorText = await error.response.data.text();
      console.error('Contenu erreur blob:', errorText);
      throw new Error(errorText || 'Erreur serveur lors de la génération');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Erreur génération cartes scolaires');
  }
};
export const ajouterDiplome = async (studentId: string, diplomeId: string): Promise<void> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    await axios.post(`${API_URL}/${studentId}/diplomes/${diplomeId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Erreur ajout diplôme existant:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur ajout diplôme existant');
  }
};

export const supprimerDiplome = async (studentId: string, diplomeId: string): Promise<void> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    await axios.delete(`${API_URL}/${studentId}/diplomes/${diplomeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error('Erreur suppression diplôme:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur suppression diplôme');
  }
};

export const consulterDiplomes = async (studentId: string): Promise<any[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}/${studentId}/diplomes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data?.data || [];
  } catch (error: any) {
    console.error('Erreur récupération diplômes:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur récupération diplômes');
  }
};

