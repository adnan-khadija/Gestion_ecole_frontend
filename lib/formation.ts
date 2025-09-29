import axios from 'axios';
import { FormationRequest, FormationResponse,Formation } from './types';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:8080/api/v1/admin/formations';

// Dans lib/students.ts
export const fetchFormations = async (): Promise<Formation[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Retourner directement le tableau d'formations
    return response.data.content || [];
  } catch (error: any) {
    console.error('Erreur récupération formation:', error);
    throw error;
  }
};
export const addFormation = async (
  formation: FormationRequest 
): Promise<FormationResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.post(`${API_URL}`, formation, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data; // ne pas faire response.data.data
  } catch (error: any) {
    console.error('Erreur ajout formation:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur ajout formation');
  }
};



export const updateFormation = async (
  id: string,
  formation: Partial<FormationRequest>
): Promise<FormationResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.put(`${API_URL}/${id}`, formation, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Retourner l'objet directement, pas response.data.data
    return response.data; 
  } catch (error: any) {
    console.error('Erreur mise à jour formation:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur mise à jour formation');
  }
};

export const getFormationById = async (id: string): Promise<FormationResponse> => {
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
    console.error('Erreur récupération formation:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur récupération formation');
  }
}
export const deleteFormation = async (id: string): Promise<void> => {
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
    console.error('Erreur suppression formation:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur suppression formation');
  }
};
export const getProfilFormationById = async (id: string): Promise<FormationResponse> => {
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
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération du profil de l'formation");
  }
  
};


