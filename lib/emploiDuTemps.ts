import axios from 'axios';
import { EmploiDuTempsRequest, EmploiDuTempsResponse } from './types';
import { getAuthHeaders } from './auth';


const API_URL = 'http://localhost:8080/api/v1/emploi-du-temps';



/**
 *  1. Récupérer tous les emplois du temps (admin)
 */
export const fetchAllEmploiDuTemps = async (): Promise<EmploiDuTempsResponse[]> => {
  try {
    const response = await axios.get(`${API_URL}/admin/all`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Erreur fetchAllEmploiDuTemps:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des emplois du temps');
  }
};

/**
 * 🔹 2. Récupérer un emploi du temps par ID
 */
export const fetchEmploiDuTempsById = async (id: string): Promise<EmploiDuTempsResponse> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Erreur fetchEmploiDuTempsById:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Emploi du temps introuvable');
  }
};

/**
 * 🔹 3. Récupérer un emploi du temps par groupe
 */
export const fetchEmploiDuTempsByGroupe = async (
  groupe: string,
  anneeAcademique: string
): Promise<EmploiDuTempsResponse> => {
  try {
    const response = await axios.get(`${API_URL}/groupe/${groupe}`, {
      headers: getAuthHeaders(),
      params: { anneeAcademique },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Erreur fetchEmploiDuTempsByGroupe:', error.response?.data || error);
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération de l'emploi du temps du groupe");
  }
};

/**
 * 🔹 4. Récupérer un emploi du temps par enseignant
 */
export const fetchEmploiDuTempsByEnseignant = async (
  enseignantId: string,
  anneeAcademique?: string
): Promise<EmploiDuTempsResponse> => {
  try {
    const response = await axios.get(`${API_URL}/enseignant/${enseignantId}`, {
      headers: getAuthHeaders(),
      params: anneeAcademique ? { anneeAcademique } : {},
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Erreur fetchEmploiDuTempsByEnseignant:', error.response?.data || error);
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération de l'emploi du temps enseignant");
  }
};

/**
 * 🔹 5. Récupérer un emploi du temps par module
 */
export const fetchEmploiDuTempsByModule = async (moduleId: string): Promise<EmploiDuTempsResponse> => {
  try {
    const response = await axios.get(`${API_URL}/module/${moduleId}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Erreur fetchEmploiDuTempsByModule:', error.response?.data || error);
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération de l'emploi du temps du module");
  }
};

export const createEmploiDuTemps = async (
  emploiDuTempsRequest: EmploiDuTempsRequest
): Promise<EmploiDuTempsResponse> => {
 

  try {
    const response = await axios.post(
      `${API_URL}`,
      emploiDuTempsRequest,
      {
          headers: getAuthHeaders(),
      }
    );

    return response.data.data; 
  } catch (error: any) {
    console.error('Erreur createEmploiDuTemps:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la création de l’emploi du temps');
  }
};
export const updateEmploiDuTemps = async (
  id: string,
  emploiDuTempsRequest: EmploiDuTempsRequest
): Promise<EmploiDuTempsResponse> => {
  
  try {
    const response = await axios.put(
      `${API_URL}/${id}`,
      emploiDuTempsRequest,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data; 
  } catch (error: any) {
    console.error('Erreur updateEmploiDuTemps:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l’emploi du temps');
  }
};

export const deleteEmploiDuTemps = async (id: string): Promise<string> => {

  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
     headers: getAuthHeaders(),
    });

    return response.data.message || 'Emploi du temps supprimé avec succès';
  } catch (error: any) {
    console.error('Erreur deleteEmploiDuTemps:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l’emploi du temps');
  }
};