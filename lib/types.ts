export enum Sexe {
  Masculin = "Masculin",
  Feminin = "Féminin",
  Autre = "Autre"
}

export interface Formation {
  id: string | number;
  nom: string;
  description: string;
  dateDebut: string ;
  dateFin: string ;
  niveau: string;
  statut: string;
  dateCreation: string;
  dateModification?: string ;
}

export interface Etudiant {
  id: string | number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateNaissance: string ;
  lieuNaissance: string;
  matricule: string;
  sexe: Sexe;
  nationalite: string;
  ville: string;
  situationFamiliale: string;
  formationActuelle: string;
  niveauScolaire: string;
  groupeScolaire: string;
  anneeScolaire: string;
  nomTuteur: string;
  contactTuteur: string;
  boursier: boolean;
  handicap: boolean;
  photo?: string;
  dateInscription: string ;
  statut: string;
  formations?: Formation[];
  dateCreation: string;
  dateModification?: string ;
}
