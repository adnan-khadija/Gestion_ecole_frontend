import axios from "axios";
import { getAuthHeaders } from "./auth";
import { DepenseRequest, DepenseResponse } from "./types";

const API_URL = "http://localhost:8080/api/v1/depenses";

/**
 * Récupérer toutes les dépenses (Admin uniquement)
 */
export const fetchAllDepenses = async (): Promise<DepenseResponse[]> => {
  try {
    const response = await axios.get(`${API_URL}/admin/all`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Erreur récupération dépenses :", error);
    throw new Error(error.response?.data?.message || "Erreur récupération dépenses");
  }
};

/**
 * 🔹 Créer une dépense
 */
export const createDepense = async (data: DepenseRequest): Promise<DepenseResponse> => {
  try {
    const response = await axios.post(API_URL, data, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Erreur création dépense :", error);
    throw new Error(error.response?.data?.message || "Erreur création dépense");
  }
};

/**
 * Obtenir une dépense par ID
 */
export const fetchDepenseById = async (id: string): Promise<DepenseResponse> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Erreur récupération dépense :", error);
    throw new Error(error.response?.data?.message || "Erreur récupération dépense");
  }
};

/**
 * Mettre à jour une dépense
 */
export const updateDepense = async (id: string, data: DepenseRequest): Promise<DepenseResponse> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Erreur mise à jour dépense :", error);
    throw new Error(error.response?.data?.message || "Erreur mise à jour dépense");
  }
};

/**
 * Supprimer une dépense
 */
export const deleteDepense = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
  } catch (error: any) {
    console.error("Erreur suppression dépense :", error);
    throw new Error(error.response?.data?.message || "Erreur suppression dépense");
  }
};

/**
 * Rechercher les dépenses par catégorie
 */
export const fetchDepensesByCategorie = async (categorie: string): Promise<DepenseResponse[]> => {
  try {
    const response = await axios.get(`${API_URL}/categorie/${categorie}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Erreur récupération dépenses par catégorie :", error);
    throw new Error(error.response?.data?.message || "Erreur récupération dépenses");
  }
};

/**
 * Rechercher les dépenses par statut
 */
export const fetchDepensesByStatut = async (statut: string): Promise<DepenseResponse[]> => {
  try {
    const response = await axios.get(`${API_URL}/statut/${statut}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Erreur récupération dépenses par statut :", error);
    throw new Error(error.response?.data?.message || "Erreur récupération dépenses");
  }
};

/**
 * Rechercher les dépenses entre deux dates
 */
export const fetchDepensesByDateRange = async (startDate: string, endDate: string): Promise<DepenseResponse[]> => {
  try {
    const response = await axios.get(`${API_URL}/date-range`, {
      headers: getAuthHeaders(),
      params: { startDate, endDate },
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Erreur récupération dépenses par période :", error);
    throw new Error(error.response?.data?.message || "Erreur récupération dépenses");
  }
};

/**
 * Rechercher les dépenses d’un enseignant
 */
export const fetchDepensesByEnseignant = async (enseignantId: string): Promise<DepenseResponse[]> => {
  try {
    const response = await axios.get(`${API_URL}/enseignant/${enseignantId}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Erreur récupération dépenses enseignant :", error);
    throw new Error(error.response?.data?.message || "Erreur récupération dépenses");
  }
};

/**
 * Rechercher les dépenses d’une année académique
 */
export const fetchDepensesByAnnee = async (annee: string): Promise<DepenseResponse[]> => {
  try {
    const response = await axios.get(`${API_URL}/annee/${annee}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Erreur récupération dépenses année :", error);
    throw new Error(error.response?.data?.message || "Erreur récupération dépenses");
  }
};

/**
 * 🔹 Calculer le total des dépenses par statut et année
 */
export const fetchTotalByStatutAndAnnee = async (statut: string, annee: string): Promise<number> => {
  try {
    const response = await axios.get(`${API_URL}/statistiques/total-par-statut`, {
      headers: getAuthHeaders(),
      params: { statut, anneeAcademique: annee },
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Erreur total dépenses statut :", error);
    throw new Error(error.response?.data?.message || "Erreur total dépenses");
  }
};

/**
 * 🔹 Calculer le total des dépenses par catégorie et année
 */
export const fetchTotalByCategorieAndAnnee = async (categorie: string, annee: string): Promise<number> => {
  try {
    const response = await axios.get(`${API_URL}/statistiques/total-par-categorie`, {
      headers: getAuthHeaders(),
      params: { categorie, anneeAcademique: annee },
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Erreur total dépenses catégorie :", error);
    throw new Error(error.response?.data?.message || "Erreur total dépenses");
  }
};

/**
 * 🔹 Calculer le total des dépenses par période et statut
 */
export const fetchTotalByPeriodeAndStatut = async (
  startDate: string,
  endDate: string,
  statut: string
): Promise<number> => {
  try {
    const response = await axios.get(`${API_URL}/statistiques/total-par-periode`, {
      headers: getAuthHeaders(),
      params: { startDate, endDate, statut },
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Erreur total dépenses période :", error);
    throw new Error(error.response?.data?.message || "Erreur total dépenses");
  }
};
