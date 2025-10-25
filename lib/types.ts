
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

export enum TypeNote {
  C1 = "Contrôle 1",
  C2 = "Contrôle 2",
  EXAMEN_TH = "Examen Théorique",
  EXAMEN_PR = "Examen Pratique",
  RATTRAPAGE = "Rattrapage"
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

export enum CategorieDepense {
  SALAIRE_ENSEIGNANT = "SALAIRE_ENSEIGNANT",
  SALAIRE_PERSONNEL = "SALAIRE_PERSONNEL",
  FACTURE_ELECTRICITE = "FACTURE_ELECTRICITE",
  FACTURE_EAU = "FACTURE_EAU",
  FACTURE_INTERNET = "FACTURE_INTERNET",
  MATERIEL_PEDAGOGIQUE = "MATERIEL_PEDAGOGIQUE",
  MATERIEL_INFORMATIQUE = "MATERIEL_INFORMATIQUE",
  MATERIEL_BUREAU = "MATERIEL_BUREAU",
  MAINTENANCE = "MAINTENANCE",
  EVENEMENT = "EVENEMENT",
  FORMATION = "FORMATION",
  AUTRE = "AUTRE"
}
// Unité de dépense
export enum UniteDepense {
  HEURE = "Par heure",
  JOUR = "Par jour",
  FORFAIT = "Montant forfaitaire",
}

export enum StatutDepense {
  EN_ATTENTE = "EN_ATTENTE",
  APPROUVEE = "APPROUVEE", 
  PAYEE = "PAYEE",
  REJETEE = "REJETEE"
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
export enum TypeSeance{
  COURS="COURS",
  TD="TD",
  TP="TP",
  ATELIER="ATELIER",
  CONFERENCE="CONFERENCE"
}
export enum JourSemaine{
  LUNDI="LUNDI",
  MARDI="MARDI",
  MERCREDI="MERCREDI",
  JEUDI="JEUDI",
  VENDREDI="VENDREDI",
  SAMEDI="SAMEDI",
  DIMANCHE="DIMANCHE"
}

export enum TypePaiement {
  FRAIS_INSCRIPTION = "FRAIS_INSCRIPTION",
  FRAIS_SCOLARITE = "FRAIS_SCOLARITE",
  FRAIS_EXAMEN = "FRAIS_EXAMEN",
  FRAIS_BIBLIOTHEQUE = "FRAIS_BIBLIOTHEQUE",
  FRAIS_TRANSPORT = "FRAIS_TRANSPORT",
  FRAIS_HEBERGEMENT = "FRAIS_HEBERGEMENT",
  FRAIS_MATERIEL = "FRAIS_MATERIEL",
  AUTRE = "AUTRE",
}
export enum ModePaiement {
  MENSUEL = 'MENSUEL',
  TRIMESTRIEL = 'TRIMESTRIEL',
  ANNUEL = 'ANNUEL',
  ESPECES = 'ESPECES',
  CHEQUE = 'CHEQUE',
  VIREMENT_BANCAIRE = 'VIREMENT_BANCAIRE',
  CARTE_BANCAIRE = 'CARTE_BANCAIRE'
}
export enum StatutPaiement {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  ANNULE = 'ANNULE',
  REMBOURSE = 'REMBOURSE'
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
  heuresTotal?: number;
  heuresCours?: number;
  heuresTD?: number;
  heuresTP?: number;
  enseignantId?: string | null;
  diplomeId: string;
}

export interface ModuleResponse extends ModuleRequest {
  idModule: string;
  note?: number | null; 
  enseignantNom?: string | null; 
  enseignantPrenom?: string | null;
  diplomeNom: string;
  studentsIds?: string[];
  nombreEtudiants?: number;
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
  image?: File | null; 
}

export interface UserUpdateRequest {
  email?: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  image?: File | null; 
}

export interface UserResponse  {
  idUser: string;
   email: string;
  password: string;
  role: RoleUtilisateur;
  nom: string;
  prenom: string;
  telephone: string;
  image?: string | null;
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
export interface BulkNoteRequest {
  enseignantId: string;
  notes: NoteRequest[];
}
export interface NoteModuleResponse {
  moduleId: string;
  moduleNom: string;
  coefficient: number;
  noteC1: number;
  noteC2: number;
  noteExamenTh: number;
  noteExamenPr: number;
  moyenneModule: number;
  moyennePonderee: number;
}
export interface BulletinResponse {
  studentId: string;
  studentNom: string;
  studentPrenom: string;
  matricule: string;
  niveau: string;
  anneeScolaire: string;
  typeEvaluation: string;
  notes: NoteModuleResponse[];
  moyenneGenerale: number;
  mention: string;
  professeurResponsable: string;
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
  nom: string;
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

export interface NoteRequest{
  studentId: string;
  moduleId:string;
  typeNote:TypeNote;
  valeur:number;
  enseignantId: string;
  anneeScolaire:string;

}
export interface NoteResponse {
  idNote:string;
  studentNom:string;
  studentPrenom:string;
  matricule:string;
  moduleNom:string;
  dateCreation:string;
  dateModification:string;
  saisiePar:string;
   studentId: string;
  moduleId:string;
  typeNote:TypeNote;
  valeur:number;
  anneeScolaire:string;

}

export interface AbsenceRequest{
  moduleId:string;
  date:string;
  studentIds:string[];
  reason:AbsenceReason;
  justified:boolean;

}
export interface AbsenceResponse{
  idAbsence:string;
  studentId:string;
  studentName:string;
  studentMatricule:string;
  moduleId:string;
  moduleName:string;
  date:string;
  reason:AbsenceReason;
  justified:boolean;
}

export interface EmploiDuTempsRequest {
  moduleId:string;
  enseignantId:string;
  jour:JourSemaine;
  heureDebut:string;
  heureFin:string;
  salle:string;
  typeSeance:TypeSeance;
  groupe:string;
  anneeAcademique:string;
  remarques:string;

}
export interface EmploiDuTempsResponse extends EmploiDuTempsRequest{
  idEmploi :string;
  moduleName:string;
  enseignantName:string;
  
}
export interface DepenseRequest{
  categorieDepense:CategorieDepense;
  montant:number;
  dateDepense:string;
  libelle:string;
  description:string;
  enseignantId:string;
  beneficiaire:string;
  numeroPiece:string;
  statutDepense:StatutDepense;
  anneeAcademique:string;
  remarques:string;
}
export interface DepenseResponse extends DepenseRequest{
  idDepense:string;
  numeroDepense:string;
  enseignantName:string;
  justificatifPath:string;
  createdAt:string;
  updatedAt:string;
}
export interface PaiementRequest {
  studentId: string;                 
  typePaiement: TypePaiement;       
  montant: number;                   
  datePaiement: string;             
  modePaiement: ModePaiement;        
  statutPaiement: StatutPaiement;    
  anneeAcademique: string;           
  referenceTransaction?: string;     
  description?: string;              
  remarques?: string;                
}
export interface PaiementUpdateRequest {
  typePaiement?: TypePaiement;
  montant?: number;
  datePaiement?: string;
  modePaiement?: ModePaiement;
  statutPaiement?: StatutPaiement;
  referenceTransaction?: string;
  description?: string;
  remarques?: string;
}
export interface PaiementResponse {
  idPaiement: string;
  studentId: string;
  studentName: string;
  studentMatricule: string;
  numeroPaiement: string;
  typePaiement: TypePaiement;
  montant: number;
  datePaiement: string;
  modePaiement: ModePaiement;
  statutPaiement: StatutPaiement;
  anneeAcademique: string;
  referenceTransaction?: string;
  description?: string;
  remarques?: string;
  recuPdfPath?: string;
  createdAt: string;
  updatedAt: string;
  annule: boolean;
  dateAnnulation?: string;
  motifAnnulation?: string;
}








