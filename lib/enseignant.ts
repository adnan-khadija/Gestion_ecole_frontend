import axios from "axios";
import Cookies from "js-cookie";
import { EnseignantRequest, EnseignantResponse, Utilisateur } from "./types";
import { getUserById } from "./auth";

const API_URL = "http://localhost:8080/api/v1/admin/enseignants";

export const fetchEnseignants = async (): Promise<(EnseignantResponse & { user: Utilisateur })[]> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("Token manquant");

  try {
    // Récupérer la liste des enseignants
    const response = await axios.get(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const enseignants: EnseignantResponse[] = response.data.data || [];

    // Pour chaque enseignant, récupérer l'utilisateur associé
    const enseignantsAvecDetails = await Promise.all(
      enseignants.map(async (enseignant) => {
        // extraction de userId depuis la réponse enseignant
        const userId = enseignant.userId;
        let user: Utilisateur | null = null;

        if (userId) {
          try {
            user = await getUserById(userId); // API pour récupérer l'utilisateur
          } catch (err) {
            console.warn(`Impossible de récupérer l'utilisateur ${userId}`, err);
          }
        }

        // Fusionner enseignant + user (dans une clé user)
        return { ...enseignant, user };
      })
    );

    return enseignantsAvecDetails;
  } catch (error: any) {
    console.error("Erreur récupération enseignants :", error);
    throw error;
  }
};



export const addEnseignant = async (
  enseignant: Omit<EnseignantResponse, "idEnseignant">
): Promise<EnseignantResponse> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("Token manquant");

  try {
    const response = await axios.post(`${API_URL}`, enseignant, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error("Erreur ajout enseignant");
  }
};

export const updateEnseignant = async (
  id: string,
  enseignant: Partial<EnseignantRequest>
): Promise<EnseignantResponse> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("Token manquant");

  try {
    const response = await axios.put(`${API_URL}/${id}`, enseignant, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error("Erreur mise à jour enseignant");
  }
};

// CORRECTION : Fonction deleteEnseignant améliorée
export const deleteEnseignant = async (id: string): Promise<void> => {
  const token = Cookies.get("token");
  if (!token) throw new Error('Token manquant');

  // CORRECTION : Validation de l'ID
  if (!id || id === "null" || id === "undefined") {
    throw new Error("ID enseignant invalide");
  }

  try {
    console.log("Tentative de suppression de l'enseignant ID:", id);
    
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("Réponse suppression:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Erreur détaillée suppression enseignant:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // CORRECTION : Message d'erreur plus précis
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Erreur lors de la suppression de l'enseignant";
    throw new Error(errorMessage);
  }
};

export const getEnseignantById = async (id: string): Promise<EnseignantResponse & {user:Utilisateur}> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("Token manquant");

  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
   const enseigant= response.data.data;
    let user: Utilisateur | null = null;
    const userId = enseigant.userId;
    if (userId) {
      try {
        user = await getUserById(userId); // API pour récupérer l'utilisateur
      } catch (err) {
        console.warn(`Impossible de récupérer l'utilisateur ${userId}`, err);
      }
    }
    return { ...enseigant, user };
  } catch (error: any) {
    console.error("Erreur récupération enseignant:", error);
    throw new Error("Erreur récupération enseignant");
  }
};
