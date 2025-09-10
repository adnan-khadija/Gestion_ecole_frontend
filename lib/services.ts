import axios from "axios";
const API_URL = "http://localhost:5000/etudiants";
const API_URL2 = "http://localhost:5000/formations";
const API_URL3 = "http://localhost:5000/professeurs";
const API_URL4 = "http://localhost:5000/diplomes";
const API_URL5 = "http://localhost:5000/matieres";
const API_URL6 = "http://localhost:5000/programmes";
const API_URL7 = "http://localhost:5000/horaires";

// Matières
export const getMatieres = () => axios.get(API_URL5);
export const addMatiere = (data: any) => axios.post(API_URL5, data);
export const updateMatiere = (id: number, data: any) => axios.put(`${API_URL5}/${id}`, data);
export const deleteMatiere = (id: number) => axios.delete(`${API_URL5}/${id}`);
// Programmes
export const getProgrammes = () => axios.get(API_URL6);
export const addProgramme = (data: any) => axios.post(API_URL6, data);
export const updateProgramme = (id: number, data: any) => axios.put(`${API_URL6}/${id}`, data);
export const deleteProgramme = (id: number) => axios.delete(`${API_URL6}/${id}`);
// Horaires
export const getHoraires = () => axios.get(API_URL7);
export const addHoraire = (data: any) => axios.post(API_URL7, data);
export const updateHoraire = (id: number, data: any) => axios.put(`${API_URL7}/${id}`, data);
export const deleteHoraire = (id: number) => axios.delete(`${API_URL7}/${id}`);

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
