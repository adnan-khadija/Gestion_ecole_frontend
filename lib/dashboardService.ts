import { getEtudiants, getFormations, getProfesseurs, getDiplomes } from './services';

// Total des entités
export const getTotalEtudiants = async (): Promise<number> => {
  const res = await getEtudiants();
  return res.data.length;  // json-server renvoie un tableau
};

export const getTotalFormations = async (): Promise<number> => {
  const res = await getFormations();
  return res.data.length;
};

export const getTotalProfesseurs = async (): Promise<number> => {
  const res = await getProfesseurs();
  return res.data.length;
};

export const getTotalDiplomes = async (): Promise<number> => {
  const res = await getDiplomes();
  return res.data.length;
};

// Exemple : étudiants par formation
export const getEtudiantsParFormation = async (): Promise<{ formation: string, count: number }[]> => {
  const resEtudiants = await getEtudiants();
  const resFormations = await getFormations();

  const stats: { formation: string, count: number }[] = resFormations.data.map((f: any) => ({
    formation: f.nom,
    count: resEtudiants.data.filter((e: any) => e.formationId === f.id).length
  }));

  return stats;
};
