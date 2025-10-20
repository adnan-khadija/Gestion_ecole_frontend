import axios from 'axios';
import { getAuthHeaders } from './auth';
import { PaiementRequest, PaiementResponse, PaiementUpdateRequest } from './types';

const API_URL = 'http://localhost:8080/api/v1/paiements';

export const createPaiement = async (data: PaiementRequest): Promise<PaiementResponse> => {
    const response = await axios.post(`${API_URL}`, data, { headers: getAuthHeaders() });
    return response.data.data;
};

export const getPaiementById = async (id: string): Promise<PaiementResponse> => {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    return response.data.data;
};

export const getPaiementByNumero = async (numero: string): Promise<PaiementResponse> => {
    const response = await axios.get(`${API_URL}/numero/${numero}`, { headers: getAuthHeaders() });
    return response.data.data;
};

export const getPaiementsByStudent = async (studentId: string): Promise<PaiementResponse[]> => {
    const response = await axios.get(`${API_URL}/student/${studentId}`, { headers: getAuthHeaders() });
    return response.data.data;
};

export const getPaiementsByStudentAndAnnee = async (
    studentId: string,
    annee: string
): Promise<PaiementResponse[]> => {
    const response = await axios.get(`${API_URL}/student/${studentId}/annee/${annee}`, { headers: getAuthHeaders() });
    return response.data.data;
};

export const getPaiementsByStatut = async (statut: string): Promise<PaiementResponse[]> => {
    const response = await axios.get(`${API_URL}/statut/${statut}`, { headers: getAuthHeaders() });
    return response.data.data;
};

export const getPaiementsByType = async (type: string): Promise<PaiementResponse[]> => {
    const response = await axios.get(`${API_URL}/type/${type}`, { headers: getAuthHeaders() });
    return response.data.data;
};

export const getPaiementsByDateRange = async (startDate: string, endDate: string): Promise<PaiementResponse[]> => {
    const response = await axios.get(`${API_URL}/date-range`, {
        headers: getAuthHeaders(),
        params: { startDate, endDate },
    });
    return response.data.data;
};

export const getPaiementsAnnules = async (): Promise<PaiementResponse[]> => {
    const response = await axios.get(`${API_URL}/annules`, { headers: getAuthHeaders() });
    return response.data.data;
};

export const getAllPaiements = async (): Promise<PaiementResponse[]> => {
    const response = await axios.get(`${API_URL}/admin/all`, { headers: getAuthHeaders() });
    return response.data.data;
};

export const updatePaiement = async (id: string, data: PaiementUpdateRequest): Promise<PaiementResponse> => {
    const response = await axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeaders() });
    return response.data.data;
};

export const annulerPaiement = async (id: string, motif: string): Promise<PaiementResponse> => {
    const response = await axios.patch(`${API_URL}/${id}/annuler`, null, {
        headers: getAuthHeaders(),
        params: { motif },
    });
    return response.data.data;
};

export const genererRecuPdf = async (id: string): Promise<Blob> => {
    const response = await axios.get(`${API_URL}/${id}/recu-pdf`, {
        headers: getAuthHeaders(),
        responseType: 'blob',
    });
    return response.data;
};

export const getTotalByStatutAndAnnee = async (statut: string, annee: string): Promise<number> => {
    const response = await axios.get(`${API_URL}/statistiques/total-par-statut`, {
        headers: getAuthHeaders(),
        params: { statut, anneeAcademique: annee },
    });
    return response.data.data;
};

export const getTotalByDateRangeAndStatut = async (
    startDate: string,
    endDate: string,
    statut: string
): Promise<number> => {
    const response = await axios.get(`${API_URL}/statistiques/total-par-periode`, {
        headers: getAuthHeaders(),
        params: { startDate, endDate, statut },
    });
    return response.data.data;
};
