import axios from "axios";
import Cookies from "js-cookie";
import { BulkNoteRequest, NoteRequest, NoteResponse } from "./types";
import { getAuthHeaders } from "./auth";
const API_URL = 'http://localhost:8080/api/v1/admin/notes';


export const fetchNotes = async (): Promise<NoteResponse[]> => {
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
    console.error('Erreur récupération notes ', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur récupération notes ');
  }
};

export const fetchNotesEtudiant = async (studentId: string, anneeScolaire: string): Promise<NoteResponse[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}/etudiant/${studentId}`, {
      params: { anneeScolaire },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Erreur récupération notes étudiant:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur récupération notes étudiant');
  }
};

/** 
 * Récupérer toutes les notes d’un module 
 */
export const fetchNotesModule = async (moduleId: string, anneeScolaire: string): Promise<NoteResponse[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}/module/${moduleId}`, {
      params: { anneeScolaire },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Erreur récupération notes module:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur récupération notes module');
  }
};

/** 
 * Récupérer toutes les notes saisies par un enseignant 
 */
export const fetchNotesEnseignant = async (enseignantId: string, anneeScolaire: string): Promise<NoteResponse[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}/enseignant/${enseignantId}`, {
      params: { anneeScolaire },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Erreur récupération notes enseignant:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur récupération notes enseignant');
  }
};

/**
 * Récupérer le bulletin officiel (version JSON)
 */
export const fetchBulletinOfficiel = async (
  studentId: string,
  anneeScolaire: string,
  typeEvaluation: string // ex: "CC", "EXAM", etc.
): Promise<BulletinResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}/bulletin/${studentId}`, {
      params: { anneeScolaire, typeEvaluation },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Erreur récupération bulletin:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur récupération bulletin');
  }
};

/**
 * Télécharger le bulletin officiel au format PDF
 */
export const downloadBulletinPDF = async (
  studentId: string,
  anneeScolaire: string,
  typeEvaluation: string
): Promise<void> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.get(`${API_URL}/bulletin/${studentId}/pdf`, {
      params: { anneeScolaire, typeEvaluation },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob', // très important pour les fichiers binaires
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bulletin_${studentId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error: any) {
    console.error('Erreur téléchargement bulletin PDF:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Erreur téléchargement bulletin PDF');
  }
};


export const addNote= async(note:NoteRequest):Promise<NoteResponse> =>{
 const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');
  
  try {
    const response = await axios.post(API_URL, note, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Erreur détaillée ajout note:", error.response?.data);
    throw new Error(error.response?.data?.message || 'Erreur ajout note');
  }
};
export const updateNote = async (
  idNote: string,
  noteRequest: NoteRequest
): Promise<NoteResponse> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  // Validation des paramètres
  if (!idNote) {
    throw new Error('ID de note manquant');
  }

  if (!noteRequest) {
    throw new Error('Données de note manquantes');
  }

  try {
    console.log("Appel API updateNote avec:", { 
      idNote, 
      noteRequest,
      hasToken: !!token 
    });
    
    const response = await axios.put<NoteResponse>(
      `${API_URL}/${idNote}`,
      noteRequest,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("Réponse API updateNote:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Erreur détaillée API updateNote:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Gestion spécifique des erreurs HTTP
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || "Données invalides pour la mise à jour");
    } else if (error.response?.status === 401) {
      throw new Error("Token d'authentification invalide ou expiré");
    } else if (error.response?.status === 403) {
      throw new Error("Vous n'êtes pas autorisé à modifier cette note");
    } else if (error.response?.status === 404) {
      throw new Error("Note non trouvée");
    } else {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        "Erreur lors de la mise à jour de la note"
      );
    }
  }
};
export const deleteNote = async (noteId: string, enseignantId: string): Promise<void> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("Token manquant");

  // Vérifier que les IDs sont valides
  if (!noteId || noteId === "undefined") {
    throw new Error("ID de note invalide");
  }

  if (!enseignantId) {
    throw new Error("ID enseignant manquant");
  }

  try {
    await axios.delete(`${API_URL}/${noteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        enseignantId,
      },
    });
  } catch (error: any) {
    console.error("Erreur suppression note:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Erreur suppression note");
  }
};
export const addNotes = async (bulkRequest: BulkNoteRequest): Promise<NoteResponse[]> => {
  const token = Cookies.get('token');
  if (!token) throw new Error('Token manquant');

  try {
    const response = await axios.post(`${API_URL}/bulk`, bulkRequest, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      
    });

   
    return response.data.data; 
  } catch (error: any) {
    console.error('Erreur détaillée ajout note:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Erreur ajout note');
  }
};