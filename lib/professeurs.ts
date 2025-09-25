import axios from 'axios';
import Cookies from 'js-cookie';
import { Enseignant, Formation, Diplome, StatutEnseignant } from './types';

const API_URL = 'http://localhost:8080/api/v1/admin/professeurs';

// Fetch all professeurs
export const getProfesseurs = async (): Promise<Enseignant[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data?.data?.content || [];
  } catch (error: any) {
    console.error('Erreur récupération professeurs:', error);
    throw new Error(error.response?.data?.message || 'Erreur récupération professeurs');
  }
};

// Add a professeur
export const addProfesseur = async (prof: Omit<Enseignant, 'enseignantId'>): Promise<{ data: Enseignant }> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.post(`${API_URL}`, prof, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { data: response.data.data };
  } catch (error: any) {
    console.error('Erreur ajout professeur:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur ajout professeur');
  }
};

// Update a professeur
export const updateProfesseur = async (id: string, prof: Partial<Enseignant>): Promise<{ data: Enseignant }> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.put(`${API_URL}/${id}`, prof, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { data: response.data.data };
  } catch (error: any) {
    console.error('Erreur mise à jour professeur:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur mise à jour professeur');
  }
};

// Delete a professeur
export const deleteProfesseur = async (id: string): Promise<void> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error: any) {
    console.error('Erreur suppression professeur:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur suppression professeur');
  }
};

// Fetch formations
export const getFormations = async (): Promise<Formation[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`http://localhost:8080/api/v1/admin/formations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data?.data?.content || [];
  } catch (error: any) {
    console.error('Erreur récupération formations:', error);
    throw new Error(error.response?.data?.message || 'Erreur récupération formations');
  }
};

// Fetch diplomes
export const getDiplomes = async (): Promise<Diplome[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`http://localhost:8080/api/v1/admin/diplomes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data?.data?.content || [];
  } catch (error: any) {
    console.error('Erreur récupération diplomes:', error);
    throw new Error(error.response?.data?.message || 'Erreur récupération diplomes');
  }
};
