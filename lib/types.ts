
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

// Situation familiale
export enum SituationFamiliale {
  CELIBATAIRE = "Célibataire",
  MARIE = "Marié(e)",
  DIVORCE = "Divorcé(e)",
  VEUF = "Veuf(ve)",
  AUTRE = "Autre",
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
  motDePasse: string; // hashé côté backend
  role: RoleUtilisateur;
  telephone?: string;
  dateCreation?: string;
  dateModification?: string;
}

// Horaire type simple
export interface Horaire {
  jour: string;   // ex: "Lundi"
  debut: string;  // ex: "08:00"
  fin: string;    // ex: "12:00"
}

/* Formation */
export interface Formation {
  id: number;
  nom: string;
  duree: number; // en mois ou heures selon convention
  cout: number;  // décimal en number (ex: 5000.00)
  professeurs?: Professeur[]; // 0..2 professeurs recommandés
  emploiDuTempsId?: number | null;
  description?: string;
  anneeFormation?: number;
  estActive?: boolean;
  modeFormation?: ModeFormation;
  niveauAcces?: string;
  capaciteMax?: number;
}

/* Diplome */
export interface Diplome {
  id: number;
  typeDiplome: TypeDiplome;
  professeurs?: Professeur[]; // relation M:N
  nomDiplome: string;
  niveau?: string; // ex: Bac+2, Bac+3
  nombreProf?: number;
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
  diplomes?: Diplome[]; // diplômes sur lesquels il intervient
  formations?: Formation[]; // formations qu'il assure
}

/* Étudiant */
export interface Etudiant {
  id: number | string;
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

  dateCreation?: string;
  dateModification?: string;
}

/* Scolarité */
export interface Scolarite {
  id: number | string;
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
  id: number | string;
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
  id: number | string;
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
