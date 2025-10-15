import axios from 'axios';
import Cookies from 'js-cookie';
import { ModuleRequest, ModuleResponse } from './types';
import { getAuthHeaders } from './auth';

const API_URL = 'http://localhost:8080/api/v1/admin/modules';

export const fetchModules = async (): Promise<ModuleResponse[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Erreur récupération modules:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur récupération modules');
  }
};
export const addModule =async (
  module : ModuleRequest
): Promise<ModuleResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');
  
  try {
    const response = await axios.post(API_URL, module, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Erreur détaillée ajout module:", error.response?.data);
    throw new Error(error.response?.data?.message || 'Erreur ajout module');
  }
};
export const updateModule = async (
  id: string,
  module: any
): Promise<ModuleResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.put(`${API_URL}/${id}`, module, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Erreur mise à jour module:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur mise à jour module');
  }
};

// CORRECTION : Fonction deleteModule améliorée
export const deleteModule = async (id: string): Promise<void> => {
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
    console.error('Erreur suppression module:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur suppression module');
  }
};
export const fetchModulesByEnseignant = async (
  idEnseignant: string
): Promise<ModuleRequest[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}/enseignant/${idEnseignant}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.data; 
  } catch (error: any) {
    console.error('Erreur fetch modules:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des modules');
  }
};
export const fetchModulesByDiplome = async (diplomeId: string): Promise<ModuleResponse[]> => {
  try {
    const token = getAuthHeaders();
    const response = await axios.get(`${API_URL}/diplome/${diplomeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Erreur fetch modules par diplôme:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur récupération modules par diplôme');
  }
};

export const fetchStudentByModule= async(
 idModule: string
): Promise<ModuleRequest[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}/${idModule}/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.data; 
  } catch (error: any) {
    console.error('Erreur fetch étudiants:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des étudiants');
  }
};
  
export const assignStudentToModule = async (
  moduleId: string,
  studentId: string
): Promise<ModuleResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.post(
      `${API_URL}/${moduleId}/etudiant/${studentId}`,
      {}, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data; 
  } catch (error: any) {
    console.error('Erreur assignation étudiant:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur lors de l’assignation de l’étudiant');
  }
};

export const removeStudentFromModule = async (
  moduleId: string,
  studentId: string
): Promise<ModuleResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.delete(`${API_URL}/${moduleId}/etudiant/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Erreur retrait étudiant:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur lors du retrait de l’étudiant');
  }
};
export const countStudentsInModule = async (moduleId: string): Promise<number> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}/${moduleId}/etudiants/count`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    
    return response.data.data;
  } catch (error: any) {
    console.error('Erreur récupération du nombre d’étudiants:', error.response?.data || error);
    throw new Error(error.response?.data?.message || "Erreur lors du comptage des étudiants");
  }
};


export const assignEnseignantToModule = async (
  moduleId: string,
  enseignantId: string
): Promise<ModuleResponse> => {
  try {
    const response = await axios.post(
      `${API_URL}/${moduleId}/enseignant/${enseignantId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data.data;
  } catch (error: any) {
    console.error(" Erreur assignation enseignant:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Erreur lors de l’assignation de l’enseignant");
  }
};

export const removeEnseignantFromModule = async (moduleId: string): Promise<ModuleResponse> => {
  try {
    const response = await axios.delete(`${API_URL}/${moduleId}/enseignant`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error(" Erreur retrait enseignant:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Erreur lors du retrait de l’enseignant");
  }
};