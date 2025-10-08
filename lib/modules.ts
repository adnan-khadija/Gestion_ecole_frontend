import axios from 'axios';
import Cookies from 'js-cookie';
import { ModuleResponse } from './types';

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
  module : any 
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