import { fetchStudents } from "./students";
import { fetchFormations } from "./formation";
import { fetchEnseignants } from "./enseignant";
import { fetchDiplomes } from "./diplome";

type FormationCount = { formation: string; count: number };
type InscriptionsPoint = { name: string; inscriptions: number };
type MonthlyPoint = { month: string; inscriptions: number };
type SpecCount = { specialite: string; count: number };

const monthNamesShortFr = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

/**
 * Totaux simples
 */
export const getTotalEtudiants = async (): Promise<number> => {
  try {
    const students = await fetchStudents();
    return Array.isArray(students) ? students.length : 0;
  } catch {
    return 0;
  }
};

export const getTotalFormations = async (): Promise<number> => {
  try {
    const formations = await fetchFormations();
    return Array.isArray(formations) ? formations.length : 0;
  } catch {
    return 0;
  }
};

export const getTotalProfesseurs = async (): Promise<number> => {
  try {
    const profs = await fetchEnseignants();
    return Array.isArray(profs) ? profs.length : 0;
  } catch {
    return 0;
  }
};

export const getTotalDiplomes = async (): Promise<number> => {
  try {
    const diplomes = await fetchDiplomes();
    return Array.isArray(diplomes) ? diplomes.length : 0;
  } catch {
    return 0;
  }
};

/**
 * Répartition des étudiants par formation
 * - Tente d'utiliser student.formation.* ; si absent, regroupe sous "Inconnu"
 */
export const getEtudiantsParFormation = async (): Promise<FormationCount[]> => {
  try {
    const students: any[] = await fetchStudents();
    const map = new Map<string, number>();
    (students || []).forEach(s => {
      const name = s.formation?.nomFormation || s.formation?.titre || s.formation?.name || "Inconnu";
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([formation, count]) => ({ formation, count }));
  } catch {
    return [];
  }
};

/**
 * Inscriptions par jour sur la semaine courante
 * - Cherche un champ date d'inscription dans l'objet étudiant (createdAt, dateInscription, created_at...)
 * - Retourne un tableau pour les 7 jours (Lun..Dim) utilisable par BarChart
 */
const dayNamesFr = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
export const getInscriptionsThisWeek = async (): Promise<InscriptionsPoint[]> => {
  try {
    const students: any[] = await fetchStudents();
    const now = new Date();
    // start Monday
    const start = new Date(now);
    const day = (start.getDay() + 6) % 7; // 0..6 where 0=Mon
    start.setDate(start.getDate() - day);
    start.setHours(0,0,0,0);
    const counts = new Array(7).fill(0);
    (students || []).forEach(s => {
      const dateStr = s.createdAt || s.dateInscription || s.created_at || s.date_creation || s.dateInscrit;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      const diffDays = Math.floor((d.getTime() - start.getTime()) / (24*60*60*1000));
      if (diffDays >= 0 && diffDays < 7) counts[diffDays]++;
    });
    return counts.map((c, i) => ({ name: dayNamesFr[i], inscriptions: c }));
  } catch {
    return dayNamesFr.map(n => ({ name: n, inscriptions: 0 }));
  }
};

/* Inscriptions par mois sur 12 mois (dernier mois inclus) */
export const getMonthlyRegistrations = async (): Promise<MonthlyPoint[]> => {
  try {
    const students: any[] = await fetchStudents();
    const now = new Date();
    const months: { [key: string]: number } = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months[key] = 0;
    }
    Object.keys(months).forEach(k => months[k] = 0);
    (students || []).forEach(s => {
      const dateStr = s.createdAt || s.dateInscription || s.created_at || s.date_creation || s.dateInscrit;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in months) months[key]++;
    });
    const points: MonthlyPoint[] = Object.keys(months).map(k => {
      const [y, m] = k.split("-").map(Number);
      return { month: `${monthNamesShortFr[m]} ${y}`, inscriptions: months[k] };
    });
    return points;
  } catch {
    return [];
  }
};

/* Taux de validation des diplômes */
export const getDiplomeValidationRate = async (): Promise<{ validated: number; total: number; rate: number }> => {
  try {
    const diplomes: any[] = await fetchDiplomes();
    const total = Array.isArray(diplomes) ? diplomes.length : 0;
    const validated = (diplomes || []).filter(d => d.estValide === true).length;
    const rate = total === 0 ? 0 : Math.round((validated / total) * 100);
    return { validated, total, rate };
  } catch {
    return { validated: 0, total: 0, rate: 0 };
  }
};

/* Top formations (par nombre d'étudiants) */
export const getTopFormations = async (top = 5): Promise<FormationCount[]> => {
  const list = await getEtudiantsParFormation();
  list.sort((a,b) => b.count - a.count);
  return list.slice(0, top);
};

/* Répartition des profs par spécialité */
export const getProfesseursParSpecialite = async (): Promise<SpecCount[]> => {
  try {
    const profs: any[] = await fetchEnseignants();
    const map = new Map<string, number>();
    (profs || []).forEach(p => {
      const spec = p.specialite || p.speciality || "Autre";
      map.set(spec, (map.get(spec) || 0) + 1);
    });
    return Array.from(map.entries()).map(([specialite, count]) => ({ specialite, count }));
  } catch {
    return [];
  }
};
