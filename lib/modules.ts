import axios from 'axios';
import Cookies from 'js-cookie';
import { ModuleResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/modules';

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