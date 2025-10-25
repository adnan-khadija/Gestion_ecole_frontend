// lib/absence.ts
import axios from 'axios';
import { getAuthHeaders } from './auth';
import { AbsenceRequest, AbsenceResponse } from './types';

const API_URL = 'http://localhost:8080/api/v1/absences';

export const absenceService = {
  // Créer des absences (Enseignant)
  async createAbsences(request: AbsenceRequest): Promise<AbsenceResponse[]> {
    try {
      const response = await axios.post(`${API_URL}/teacher`, request, {
       headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Erreur création absences:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Erreur création absences');
    }
  },

  // Obtenir les absences par étudiant
  async getAbsencesByStudent(studentId: string): Promise<AbsenceResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/student/${studentId}`, {
       headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Erreur fetch absences étudiant:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Erreur récupération absences étudiant');
    }
  },

  // Obtenir les absences par module (Enseignant)
  async getAbsencesByModule(moduleId: string): Promise<AbsenceResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/teacher/module/${moduleId}`, {
       headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Erreur fetch absences module:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Erreur récupération absences module');
    }
  },

  // Obtenir les absences par étudiant et module
  async getAbsencesByStudentAndModule(studentId: string, moduleId: string): Promise<AbsenceResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/student/${studentId}/module/${moduleId}`, {
       headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Erreur fetch absences étudiant/module:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Erreur récupération absences étudiant/module');
    }
  },

  // Obtenir les absences par date (Admin)
  async getAbsencesByDate(date: string): Promise<AbsenceResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/date?date=${date}`, {
       headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Erreur fetch absences par date:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Erreur récupération absences par date');
    }
  },

  // Obtenir les absences par module et date (Enseignant)
  async getAbsencesByModuleAndDate(moduleId: string, date: string): Promise<AbsenceResponse[]> {
    try {
      const response = await axios.get(
        `${API_URL}/teacher/module/${moduleId}/date?date=${date}`,
        {
         headers: getAuthHeaders(),
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Erreur fetch absences module/date:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Erreur récupération absences module/date');
    }
  },

  // Obtenir une absence par ID
  async getAbsenceById(absenceId: string): Promise<AbsenceResponse> {
    try {
      const response = await axios.get(`${API_URL}/${absenceId}`, {
       headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Erreur fetch absence:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Erreur récupération absence');
    }
  },

  // Mettre à jour une absence (Enseignant)
  async updateAbsence(absenceId: string, request: AbsenceRequest): Promise<AbsenceResponse> {
    try {
      const response = await axios.put(`${API_URL}/teacher/${absenceId}`, request, {
       headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Erreur mise à jour absence:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Erreur mise à jour absence');
    }
  },

  // Supprimer une absence (Enseignant)
  async deleteAbsence(absenceId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/teacher/${absenceId}`, {
       headers: getAuthHeaders(),
      });
    } catch (error: any) {
      console.error('Erreur suppression absence:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Erreur suppression absence');
    }
  },

  // Obtenir toutes les absences (Admin)
  async getAllAbsences(): Promise<AbsenceResponse[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/all`, {
       headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Erreur fetch toutes les absences:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Erreur récupération absences');
    }
  },
};