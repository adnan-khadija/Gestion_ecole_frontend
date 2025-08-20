// Enum Sexe
export enum Sexe {
  Masculin = "Masculin",
  Feminin = "Féminin",
  Autre = "Autre",
}

export enum SituationFamiliale {
  Celibataire = "Célibataire",
  Marie = "Marié(e)",
  Divorcé = "Divorcé(e)",
  Veuf = "Veuf(ve)",
  Autre = "Autre",
}
// Enum Statut Étudiant
export enum StatutEtudiant {
  Actif = "Actif",
  Suspendu = "Suspendu",
  Diplome = "Diplômé",
  Desinscrit = "Désinscrit",
}

// Enum Type Diplôme
export enum TypeDiplome {
  Master = "Master",
  Licence = "Licence",
  DEUG = "DEUG",
  Autre = "Autre",
}

// Interface Diplôme
export interface Diplome {
  id: string | number;
  nom: string;
  description: string;
  type?: TypeDiplome;
}

// Interface Formation
export interface Formation {
  id: string | number;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string ;
  niveau: string;
  statut: string;
  dateCreation: string ;
  dateModification?: string;
}

// Interface Étudiant
export interface Etudiant {
  id: string | number;
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string ;
  lieuNaissance: string;
  sexe: Sexe;
  nationalite: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  situationFamiliale?: SituationFamiliale;
  formationActuelle: Formation;   // FK vers Formation
  niveauScolaire: string;
  groupeScolaire: string;
  anneeAcademique: string;
  statut: StatutEtudiant;
  dateInscription: string ;
  boursier: boolean;
  handicap: boolean;
  nouvelEtudiant: boolean;
  nomTuteur?: string;
  contactTuteur?: string;
  photo?: string;

  // Relations
  formations?: Formation[];
  diplome?: Diplome;

  // Audit
  dateCreation: string ;
  dateModification?: string ;
}
