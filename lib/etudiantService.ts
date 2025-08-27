import axios from "axios";
const API_URL = "http://localhost:5000/etudiants";
const API_URL2 = "http://localhost:5000/formations";


export const getEtudiants = () => axios.get(API_URL);
export const getFormations = () => axios.get(API_URL2);
export const addEtudiant = (data: any) => axios.post(API_URL, data);
export const updateEtudiant = (id: number|string, data: any) => axios.put(`${API_URL}/${id}`, data);
export const deleteEtudiant = (id: number) => axios.delete(`${API_URL}/${id}`);
