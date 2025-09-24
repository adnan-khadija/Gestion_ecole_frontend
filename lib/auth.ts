import axios from 'axios';
import Cookies from 'js-cookie';
import { RoleUtilisateur,UserRequest, UserResponse, UserUpdateRequest } from './types';


const API_URL = 'http://localhost:8080/api/v1';

export interface LoginResponseData {
  token: string;
  email: string;
  role: RoleUtilisateur;
  userId: string;
}

export interface LoginResponse {
  timestamp: string;
  status: number;
  message: string;
  data: LoginResponseData;
}

export const login = async (email: string, motDePasse: string): Promise<LoginResponseData> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, { email, motDePasse });
    const { token, email: userEmail, role, userId } = response.data.data;

    // Stocker le token et infos utilisateur dans un cookie
    Cookies.set('token', token, { expires: 1 }); // expire dans 1 jour
    Cookies.set('role', role, { expires: 1 });
    Cookies.set('userId', userId, { expires: 1 });
    Cookies.set('email', userEmail, { expires: 1 });
    

    return { token, role, userId, email: userEmail };
  } catch (error: any) {
  throw new Error(error.response?.data?.message || 'Erreur lors de la connexion');
}

};
export const register = async (user: Omit<UserRequest, 'id'>): Promise<UserResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.post(`${API_URL}/admin/register`, user, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const newUser: UserResponse = response.data.data;
    Cookies.set('role', newUser.role, { expires: 1 });
    Cookies.set('userId', newUser.userId, { expires: 1 });

    return newUser;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de l'inscription");
  }
};

export const updateUser= async (userId: string, user: Partial<UserUpdateRequest>): Promise<UserResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.put(`${API_URL}/admin/user/${userId}`, user, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour de l'utilisateur");
  }
};

export const getUserById= async (userId:string):Promise<UserResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}/admin/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },

    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération de l'utilisateur");
  }
};
export const deleteUser = async (userId:string):Promise<void> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    await axios.delete(`${API_URL}/admin/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de la suppression de l'utilisateur");
  }
};

export const getUsersStudents = async (): Promise<UserResponse[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}/admin/users/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération des utilisateurs étudiants");
  }
};
export const fetchUserIdByEmail = async (email: string): Promise<string> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  const response = await axios.get(`${API_URL}/admin/user/by-email`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { email }
  });

  return response.data.data.idUser; 
};

