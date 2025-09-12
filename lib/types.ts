
// Role utilisateur
export enum RoleUtilisateur {
  ADMIN = "Administrateur",
  ENSEIGNANT = "Enseignant",
  ETUDIANT = "Étudiant",
}

// Sexe
export enum Sexe {
  M = "M",
  F = "F",
}
export enum FormationNom {
  ANIMATEUR_HSE = "Animateur H.S.E",
  CONTROLEUR_CAMERAS = "Contrôleur & administrateur des caméras de surveillance",
  REPARATEUR_TELEPHONES = "Réparateur de téléphones",
  REPARATEUR_PC = "Réparateur de PC portables",
  DEVELOPPEUR_WEB = "Développeur de sites web",
  AUTRE = "Autre (précisez)"
}

// Situation familiale
export enum SituationFamiliale {
  CELIBATAIRE = "Célibataire",
  MARIE = "Marié(e)",
  DIVORCE = "Divorcé(e)",
  VEUF = "Veuf(ve)",
  AUTRE = "Autre",
}

export enum NiveauAcces{
  BAC="Bac",
  BAC2="Bac + 2",
  AUTRE="Autre",

}
// Statut étudiant
export enum StatutEtudiant {
  ACTIF = "Actif",
  SUSPENDU = "Suspendu",
  DIPLOME = "Diplômé",
  DESINSCRIT = "Désinscrit",
}

// Statut professeur
export enum StatutProfesseur {
  PERMANENT = "Permanent",
  CONTRACTUEL = "Contractuel",
  VACATAIRE = "Vacataire",
}

// Mention diplôme
export enum MentionDiplome {
  PASSABLE = "Passable",
  ASSEZ_BIEN = "Assez bien",
  BIEN = "Bien",
  TRES_BIEN = "Très bien",
  EXCELLENT = "Excellent",
}

// Mode remise diplôme
export enum ModeRemiseDiplome {
  PRESENTIEL = "Présentiel",
  EN_LIGNE = "En ligne",
  PAR_COURRIER = "Par courrier",
}

// Mode de formation
export enum ModeFormation {
  PRESENTIEL = "Présentiel",
  EN_LIGNE = "En ligne",
  HYBRIDE = "Hybride",
}

// Mode paiement (général)
export enum ModePaiement {
  ESPECES = "Espèces",
  CHEQUE = "Chèque",
  VIREMENT = "Virement",
  CARTE = "Carte bancaire",
}

// État paiement (transaction)
export enum EtatPaiement {
  VALIDE = "Validé",
  EN_ATTENTE = "En attente",
  ANNULE = "Annulé",
}

// Mode paiement pour scolarité
export enum ModePaiementScolarite {
  MENSUEL = "Mensuel",
  TRIMESTRIEL = "Trimestriel",
  ANNUEL = "Annuel",
}

// État scolarité
export enum EtatScolarite {
  REGLE = "Réglé",
  A_COMPLETER = "À compléter",
  NON_REGLE = "Non réglé",
}

// Catégorie dépense
export enum CategorieDepense {
  SALAIRE = "Salaire de professeur",
  EQUIPEMENT = "Équipement",
  EVENEMENT = "Événement",
  MAINTENANCE = "Maintenance",
  AUTRE = "Autre",
}

// Unité de dépense
export enum UniteDepense {
  HEURE = "Par heure",
  JOUR = "Par jour",
  FORFAIT = "Montant forfaitaire",
}

// Statut dépense
export enum StatutDepense {
  PAYEE = "Payée",
  EN_ATTENTE = "En attente",
  ANNULEE = "Annulée",
}

// Type diplôme
export enum TypeDiplome {
  LICENCE = "Licence",
  MASTER = "Master",
  DEUG = "Deug",
  DIPLOME_1_AN = "Diplôme 1 an",
  DIPLOME_20_MOIS = "Diplôme 20 mois",
  PERSONNALISE = "Champ personnalisé",
}


// Utilisateur (général)
export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string; 
  role: RoleUtilisateur;
  telephone?: string;
  dateCreation?: string;
  dateModification?: string;
}

// Horaire type simple
export interface Horaire {
  jour: string;  
  debut: string;  
  fin: string;   
  mois:string;
  annee:string;
}

/* Formation */
export interface Formation {
  id: number;
  nom: FormationNom;
  duree: number; 
  cout: number;  
  professeurs: Professeur[];
  emploiDuTempsId?: number | null;
  description?: string;
  anneeFormation?: number;
  estActive?: boolean;
  modeFormation?: ModeFormation;
  niveauAcces?: NiveauAcces;
  capaciteMax?: number;
}

/* Diplome */
export interface Diplome {
  id: number;
  typeDiplome: TypeDiplome;
  professeurs?: Professeur[]; // relation M:N
  nomDiplome: string;
  niveau?: string; // ex: Bac+2, Bac+3
  anneeObtention?: number;
  estValide?: boolean;
  etudiant?: Etudiant | null; // si lien immédiat
  mention?: MentionDiplome;
  dateDelivrance?: string;
  signatureAdmin?: Utilisateur | null;
  qrCode?: string; // URL ou data
  fichierDiplome?: string; // URL/chemin
  commentaire?: string;
  modeRemise?: ModeRemiseDiplome;
}

/* Professeur */
export interface Professeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  specialite?: string;
  dateEmbauche?: string;
  statut?: StatutProfesseur;
  photo?: string;
  heuresTravail?: number;
  horaires?: Horaire[];
  diplomes?: Diplome[]; 
  formations?: Formation[]; 
  
}

/* Étudiant */
export interface Etudiant {
  id: number;
  matricule?: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  sexe?: Sexe;
  nationalite?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  situationFamiliale?: SituationFamiliale;
  formationActuelle?: Formation | null;
  niveauScolaire?: string;
  groupeScolaire?: string;
  anneeAcademique?: string;
  statut?: StatutEtudiant;
  dateInscription?: string;
  boursier?: boolean;
  handicap?: boolean;
  nouvelEtudiant?: boolean;
  nomTuteur?: string;
  contactTuteur?: string;
  photo?: string;
  
  formations?: Formation[]; // M:N
  diplomes?: Diplome[];     // M:N

}

/* Scolarité */
export interface Scolarite {
  id: number;
  etudiant: Etudiant;
  formation?: Formation | null;
  anneeAcademique?: string;
  coutScolarite: number;
  montantPaye: number;
  etatScolarite: EtatScolarite;
  modePaiement?: ModePaiementScolarite;
  dateDernierPaiement?: string;
  commentaire?: string;
  numeroRecu?: string;
  fichierRecu?: string; // URL
  scanRecu?: string;    // URL
  dateEmissionRecu?: string;
  emetteurRecu?: string;
  dateCreation?: string;
  dateModification?: string;
}

/* Absence */
export interface AbsenceEtudiant {
  id: number;
  etudiant: Etudiant;
  formation?: Formation | null;
  dateAbsence: string;
  heureDebut?: string;
  heureFin?: string;
  professeur?: Professeur | null;
  dateSaisie?: string;
  justification?: string;
  estJustifiee?: boolean;
  commentaire?: string;
}

/* Depense */
export interface Depense {
  id: number;
  dateDepense: string;
  categorie: CategorieDepense;
  nomConcerne?: string;
  uniteDepense?: UniteDepense;
  description?: string;
  montant: number;
  modePaiement?: ModePaiement;
  fournisseur?: string;
  numeroFacture?: string;
  fichierFacture?: string;
  statut: StatutDepense;
  datePaiement?: string;
  creePar?: Utilisateur;
  dateCreation?: string;
}

/* Paiement (transaction) */
export interface Paiement {
  id: number ;
  etudiant?: Etudiant | null;
  formation?: Formation | null;
  diplome?: Diplome | null;
  montant: number;
  modePaiement: ModePaiement;
  etatPaiement: EtatPaiement;
  fichierRecu?: string;
  datePaiement?: string;
  creePar?: Utilisateur;
  commentaire?: string;
  referencePaiement?: string;
  numeroRecu?: string;
}
export interface Matiere {
  id: number;
  nomMatiere: string;
  description?: string;
}

export interface Programme {
  id: number;
  nomProgramme: string;
  formation?: Formation;
  diplome?: Diplome;
  description?: string;
  derue: number|string;
  dateDebut: string;
  dateFin: string;
  salle:string;
  matieres?: Matiere[]; 
 
}

// export interface Creneau {
//   id: number;
//   programme: Programme; // ou directement matiere: Matiere
//   professeur: Professeur;
//   salle: Salle; // voir point 4
//   groupe: Groupe; // voir point 4
//   dateDebut: string; // Format ISO: "2025-10-27T09:00:00Z"
//   dateFin: string;   // Format ISO: "2025-10-27T11:00:00Z"
//   commentaire?: string;
//   statut?: 'Planifié' | 'Confirmé' | 'Annulé';
// }
// // Version améliorée de AbsenceEtudiant
// export interface AbsenceEtudiant {
//   id: number;
//   etudiant: Etudiant;
//   creneau: Creneau; // On lie l'absence à la session de cours exacte !
//   estJustifiee?: boolean;
//   commentaire?: string;
//   dateSaisie?: string;
// }
// export interface Salle {
//   id: number;
//   nom: string; // "Amphi A", "Salle 102"
//   capacite: number;
//   type?: 'Amphithéâtre' | 'Salle de TD' | 'Laboratoire';
// }
// export interface Groupe {
//   id: number;
//   nom: string; // "Groupe A"
//   formation: Formation;
//   anneeAcademique: string; // "2025-2026"
//   etudiants: Etudiant[];
// }
