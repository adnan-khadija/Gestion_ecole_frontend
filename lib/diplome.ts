import axios from 'axios';
import Cookies from 'js-cookie';
import { DiplomeResponse } from './types';
import { getStudentById } from '@/lib/students';
import { Student, Enseignant } from './types';
import { getEnseignantById } from "@/lib/enseignant";

const API_URL = 'http://localhost:8080/api/v1/admin/diplomes';

export interface DiplomeWithDetails extends DiplomeResponse {
  student: Student | null;
  enseignants: Enseignant[];
}

export const fetchDiplomes = async (): Promise<DiplomeWithDetails[]> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("Token manquant");

  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const diplomesWithDetails: DiplomeWithDetails[] = await Promise.all(
      response.data.map(async (diplome: DiplomeResponse) => {
        // Récupérer l'étudiant si studentId existe
        const student = diplome.studentId ? await getStudentById(diplome.studentId) : null;

        // Récupération des enseignants
        const enseignants: Enseignant[] = [];
        if (diplome.professeursIds && diplome.professeursIds.length > 0) {
          for (const id of diplome.professeursIds) {
            if (id && id !== "null" && id !== "undefined") {
              try {
                const enseignant = await getEnseignantById(id);
                if (enseignant) enseignants.push(enseignant);
              } catch (err) {
                console.warn(`Enseignant ${id} non trouvé:`, err);
              }
            }
          }
        }
        return { ...diplome, student, enseignants };
      })
    );

    return diplomesWithDetails;
  } catch (error: any) {
    console.error("Erreur récupération diplômes:", error);
    throw error;
  }
};

export const addDiplome = async (
  diplome: any
): Promise<DiplomeResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  // CORRECTION : Validation et nettoyage final
  if (!diplome.studentId || diplome.studentId === "") {
    throw new Error("L'ID de l'étudiant est obligatoire");
  }

  // Nettoyage final des IDs
  const cleanDiplome = {
    ...diplome,
    studentId: diplome.studentId.toString(),
    professeursIds: diplome.professeursIds
      ? diplome.professeursIds
          .filter((id: any) => id && id !== "" && id !== "null" && id !== "undefined")
          .map((id: any) => id.toString())
      : []
  };

  console.log("Données finales envoyées à l'API:", cleanDiplome);

  try {
    const response = await axios.post(`${API_URL}`, cleanDiplome, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Erreur détaillée ajout diplôme:", error.response?.data);
    throw new Error(error.response?.data?.message || 'Erreur ajout diplôme');
  }
};

export const updateDiplome = async (
  id: string,
  diplome: any
): Promise<DiplomeResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  // CORRECTION : Nettoyage pour la mise à jour
  const cleanDiplome = {
    ...diplome,
    studentId: diplome.studentId ? diplome.studentId.toString() : "",
    professeursIds: diplome.professeursIds
      ? diplome.professeursIds
          .filter((id: any) => id && id !== "" && id !== "null" && id !== "undefined")
          .map((id: any) => id.toString())
      : []
  };

  console.log("Données de mise à jour finales:", cleanDiplome);

  try {
    const response = await axios.put(`${API_URL}/${id}`, cleanDiplome, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Erreur mise à jour diplôme:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur mise à jour diplôme');
  } 
};

export const deleteDiplome = async (id: string): Promise<void> => {
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
    console.error('Erreur suppression diplôme:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur suppression diplôme');
  }
};
export const generateQrCode = async (diplomeId: string): Promise<string> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');
    if (!diplomeId || diplomeId === "undefined" || diplomeId === "null") {
    throw new Error('ID du diplôme invalide');
  }

  try {
    const response = await axios.get(`${API_URL}/${diplomeId}/qrcode`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'image/png', // <-- Ajouté pour préciser le type attendu
      },
      responseType: 'arraybuffer', // <-- Correct pour recevoir l'image
    });

    // Vérifie que la réponse contient bien des données
    if (!response.data || response.data.byteLength === 0) {
      throw new Error('QR code vide ou non généré');
    }

    const blob = new Blob([response.data], { type: 'image/png' });
    const qrCodeUrl = URL.createObjectURL(blob);
    return qrCodeUrl;
  } catch (error: any) {
    console.error('Erreur génération QR code:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur génération QR code');
  }
};
