import axios from "axios";
const API_URL = "http://localhost:5000/etudiants";
const API_URL2 = "http://localhost:5000/formations";
const API_URL3 = "http://localhost:5000/professeurs";
const API_URL4 = "http://localhost:5000/diplomes";

// Diplômes
export const getDiplomes = () => axios.get(API_URL4);
export const addDiplome = (data: any) => axios.post(API_URL4, data);
export const updateDiplome = (id: number, data: any) => axios.put(`${API_URL4}/${id}`, data);
export const deleteDiplome = (id: number) => axios.delete(`${API_URL4}/${id}`);
// Formations
export const getFormations = () => axios.get(API_URL2);
export const addFormation = (data: any) => axios.post(API_URL2, data);
export const updateFormation = (id: number, data: any) => axios.put(`${API_URL2}/${id}`, data);
export const deleteFormation = (id: number) => axios.delete(`${API_URL2}/${id}`);
// Étudiants
export const getEtudiants = () => axios.get(API_URL);
export const addEtudiant = (data: any) => axios.post(API_URL, data);
export const updateEtudiant = (id: number, data: any) => axios.put(`${API_URL}/${id}`, data);
export const deleteEtudiant = (id: number) => axios.delete(`${API_URL}/${id}`);
// Professeurs
export const getProfesseurs = () => axios.get(API_URL3);
export const addProfesseur = (data: any) => axios.post(API_URL3, data);
export const updateProfesseur = (id: number, data: any) => axios.put(`${API_URL3}/${id}`, data);
export const deleteProfesseur = (id: number) => axios.delete(`${API_URL3}/${id}`);
