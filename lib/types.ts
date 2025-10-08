
// Sexe
export enum Sexe {
  M = "male",
  F = "female",
}
export enum YesOrNo{
  YES="Yes",
  NO="No",
}
// Noms de formations standardisées
export enum FormationNom {
  ANIMATEUR_HSE = "Animateur H.S.E",
  CONTROLEUR_CAMERAS = "Contrôleur & administrateur des caméras de surveillance",
  REPARATEUR_TELEPHONES = "Réparateur de téléphones",
  REPARATEUR_PC = "Réparateur de PC portables",
  DEVELOPPEUR_WEB = "Développeur de sites web",
  AUTRE = "Autre (précisez)"
}
export enum Niveau{
  PREMIEREANNEE='premiere_annee ',
  DEUXIEMEANNEE='deuxieme_annee',
  TROISIEMEANNEE='troisieme_annee',
  QUATRIEMEANNEE='quatrieme_annee',
  CINQUIEMEANNEE='cinquieme_annee',
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
export enum StatutEnseignant {
  PERMANENT = "permanent",
  CONTRACTUEL = "contractuel",
  VACATAIRE = "vacataire",
}


// Mode remise diplôme
export enum ModeRemise{
  PRESENTIEL = "PRESENTIEL",
  EN_LIGNE = "EN_LIGNE",
  PAR_COURRIER = "PAR_COURRIER",
}

// Mode de formation
export enum ModeFormation {
  PRESENTIEL = "PRESENTIEL",
  EN_LIGNE = "EN_LIGNE",
  HYBRIDE = "HYBRIDE",
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
  LICENCE = "LICENCE",
  MASTER = "MASTER",
  DEUG = "DEUG",
  DIPLOME_1_AN = "DIPLOME_1_AN",
  DIPLOME_20_MOIS = "DIPLOME_20_MOIS",
  PERSONNALISE = "CUSTOM",
}

// Role utilisateur
export enum RoleUtilisateur {
  ADMINISTRATION = "ADMINISTRATION",
  ETUDIANT = "ETUDIANT",
  ENSEIGNANT = "ENSEIGNANT"
}
export enum AbsenceReason {
  MALADIE = "MALADIE",
  URGENCE_FAMILIALE = "URGENCE_FAMILIALE",
  NON_JUSTIFIEE = "NON_JUSTIFIEE",
  RETARD="RETARD",
  RAISON_PERSONNELLE="RAISON_PERSONNELLE",
  EVENEMENT_SCOLAIRE="EVENEMENT_SCOLAIRE",
  AUTRE="AUTRE"
}
export enum Mention{
  PASSABLE="PASSABLE",
  ASSEZ_BIEN="ASSEZ_BIEN",
  BIEN="BIEN",
  TRES_BIEN="TRES_BIEN",
  EXCELLENT="EXCELLENT"
}
/* Diplome */
export interface Diplome {
  idDiplome: string;
  typeDiplome: TypeDiplome;
  customDiplomeLabel:string;
  niveau: string; 
  modules:Module[];
  nomDiplome: string;
  anneeObtention?: number;
  estValide?: boolean;
  mention: Mention;
  dateDelivrance: string;
  signatureAdmin: Utilisateur;
  qrCodeUrl: string; 
  fichierDiplome?: string; 
  commentaire?: string;
  modeRemise?: ModeRemise;
  professeurs?: Enseignant[]; 
  student:Student;
}


export interface TimeSlot {
  day: string;       
  startTime: string;  
  endTime: string;   
}
/* Enseignant */
export interface Enseignant {
  enseignantId: string;
  user:Utilisateur;
  specialite: string;
  dateEmbauche: string;
  statusEnseignant: StatutEnseignant;
  heuresTravail?: string;
  horaires: TimeSlot;
  diplomes?: Diplome[]; 
  modules?: Module[];
  customFields: CustomField[];
  
}
/* Absence */
export interface Absence {
  idAbsence: string;
  student: Student;
  module: Module;
  date: string;
  reason :AbsenceReason;
  Justified: boolean;
}


export interface CustomField {
  id: string;                    
  fieldName: string;           
  fieldValue: string;           
  student?: Student;           
  enseignant?: Enseignant;      
}
export interface CustomFieldRequest {
  fieldName: string;
  fieldValue: string;
}
// Utilisateur (général)
export interface Utilisateur {
  id: string;       
  email: string;
  role: RoleUtilisateur;
  nom: string;
  prenom: string;
  telephone: string;
  image?: string | null; 
}
export interface Module {
  idModule: string;
  nom: string;
  note: number;
  enseignant: Enseignant;
  diplome: Diplome;
  students: Student[];
  absences?: Absence[];
}
export interface ModuleRequest {
   nom: string;
   coefficient: number;
   description?: string;
   heuresTotal: number;
   heuresCours: number;
   heuresTD: number;
   heuresTP: number;
   enseignantId: string;
   diplomeId: string;
}
export interface ModuleResponse extends ModuleRequest {
  idModule: string;
  note: number;
  enseignantNom: string;
  enseignantPrenom: string;
  diplomeNom: string;
  studentsIds: string[];
  nombreEtudiants: number;
}

export interface Student {
  idStudent: string;  
  nom:string;
  prenom: string;
  telephone: string;
  email: string;
  image?: string | null; 
  
  matricule: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: Sexe;
  nationalite: string;
  adresse: string;
  ville: string;
  situationFamiliale: SituationFamiliale;
  niveau: string;
  groupe: string;
  anneeAcademique: string;
  statut: StatutEtudiant;
  bourse: YesOrNo;
  handicap: YesOrNo;
  absences?: Absence[];
  diplomes?: Diplome[];
  modules?: Module[];
  customFields: CustomField[];
}

export interface UserRequest {
  email: string;
  password: string;
  role: RoleUtilisateur;
  nom: string;
  prenom: string;
  telephone: string;
  image?: string | null; 
}
export interface UserUpdateRequest {
  email?: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  image?: string | null; 
}
export interface UserResponse extends UserRequest {
  idUser: string;
}

export interface StudentRequest {

  matricule?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  sexe?: Sexe;
  nationalite?: string;
  adresse?: string;
  ville: string;
  situationFamiliale?: SituationFamiliale;
  niveau: string;
  groupe: string;
  statut?: StatutEtudiant;
  anneeAcademique: string;
  bourse?: YesOrNo;
  handicap?: YesOrNo;
  customFields?: CustomFieldRequest[];
}
export interface StudentResponse extends StudentRequest {
  idStudent: string;
  email: string;  
  nom: string;
  prenom: string;
  telephone: string;
  image: string;
}
export interface DiplomeRequest {
  typeDiplome: TypeDiplome;
  customDiplomeLabel?:string;
  niveau: string; 
  nomDiplome: string;
  anneeObtention?: number;
  estValide?: boolean;
  mention: Mention;
  dateDelivrance: string;
  modeRemise?: ModeRemise;
  commentaire?: string;
  professeursIds?: string[]; 
  studentId: string;
}
export interface DiplomeResponse extends DiplomeRequest {
  idDiplome: string;
  signatureAdmin: Utilisateur;
  qrCodeUrl: string; 

}

// Interface principale EnseignantRequest
export interface EnseignantRequest {
  userId: string;             
  specialite: string;
  dateEmbauche: string;        
  statusEnseignant: StatutEnseignant;
  heuresTravail: string;       
  horaire: HoraireRequest;
  moduleIds: string[];         
  diplomeIds: string[];       
  customFields: CustomFieldRequest[];
}

export interface EnseignantResponse extends EnseignantRequest{
  enseignantId:string;
  

}
export interface HoraireRequest{
  jour: string;       
  heureDebut: string;  
  heureFin: string;   
}
export interface HoraireResponse extends HoraireRequest{
}


export interface EmploiDuTemps{
  id:string;
  slots:EmploiSlot;
}
export interface EmploiSlot{
  id :string;
  jour:string;
  heureDebut:string;
  heureFin:string;
  module :string;
}
/* Formation */
export interface Formation {
  idFormation: string;
  nom: FormationNom;
  duree: number; 
  cout: number;  
  professeurs?: Enseignant[];
  emploiDuTempsId: EmploiDuTemps;
  description?: string;
  anneeFormation?: string;
  estActive?: boolean;
  modeFormation?: ModeFormation;
  niveauAcces?: NiveauAcces;
  capaciteMax?: number;
}
export interface FormationRequest{
  nom:string;
  duree:number;
  cout: number;
  enseignantsIds:string[];
  description:string;
  anneeFormation:string;
  estActive:Boolean;
  modeFormation:ModeFormation;
  niveauAcces:string;
  capaciteMax:number;
}
export interface FormationResponse extends FormationRequest{
  idFormation:string;
}
export interface ModuleRequest{
  nomModule:string;
  note:number;
  enseignantId:string;
  diplomeId:string;
  studentIds:string[];
}
export interface ModuleResponse extends ModuleRequest{
  idModule:string;
}




