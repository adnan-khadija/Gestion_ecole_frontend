# 🎓 Système de Gestion d'École

Une application web moderne et complète pour la gestion d'établissements scolaires, construite avec Next.js et React. Cette plateforme offre une solution intégrée pour gérer tous les aspects d'une école, de l'administration des étudiants et enseignants aux notes, absences, emplois du temps et paiements.

## ✨ Fonctionnalités Principales

### 🔐 Authentification et Gestion des Rôles

- **Système d'authentification sécurisé** avec JWT
- **Gestion multi-rôles** :
  - **Administrateur** : Accès complet à toutes les fonctionnalités
  - **Enseignant** : Gestion des notes, absences et emplois du temps
  - **Étudiant** : Consultation des notes, absences et emploi du temps personnel
- **Middleware de protection des routes** basé sur les rôles
- Fonction "Se souvenir de moi" et récupération de mot de passe

### 👨‍💼 Module Administrateur

- **Dashboard analytique** avec statistiques en temps réel
- **Gestion des étudiants** 
  - Ajout, modification, suppression d'étudiants
  - Affectation aux formations et programmes
  - Gestion des informations personnelles et académiques
  - Export des données en Excel/PDF
- **Gestion des enseignants**
  - CRUD complet des professeurs
  - Affectation aux modules et matières
  - Gestion des spécialités
- **Gestion des absences**
  - Suivi des présences
  - Justification des absences
  - Statistiques de présence
- **Gestion des notes**
  - Saisie et modification des notes
  - Calcul automatique des moyennes
  - Visualisation des résultats par étudiant/classe
- **Gestion des paiements**
  - Suivi des frais de scolarité
  - Historique des paiements
  - Génération de reçus
- **Gestion des emplois du temps**
  - Création et modification des plannings
  - Affectation des salles et enseignants
  - Gestion des conflits horaires
- **Gestion des formations**
  - Création de programmes académiques
  - Gestion des modules et matières
  - Organisation par niveaux et filières
- **Gestion des programmes**
  - Définition des cursus
  - Association modules/formations
- **Gestion des modules**
  - Création et modification des matières
  - Affectation des coefficients
  - Association aux enseignants
- **Gestion des dépenses**
  - Suivi des dépenses de l'établissement
  - Catégorisation des frais
  - Rapports financiers
- **Gestion des diplômes**
  - Délivrance de diplômes
  - Génération de certificats
  - Historique académique

### 👨‍🏫 Module Enseignant

- **Dashboard personnalisé** avec vue d'ensemble
- **Gestion des notes** de ses étudiants
- **Gestion des absences** pour ses classes
- **Consultation de l'emploi du temps** personnel
- **Liste des étudiants** affectés

### 👨‍🎓 Module Étudiant

- **Dashboard personnel** avec informations académiques
- **Consultation des notes** par matière
- **Historique des absences**
- **Emploi du temps personnel**

## 🛠️ Technologies Utilisées

### Framework & Core

- **[Next.js 15.4.6](https://nextjs.org/)** - Framework React avec App Router
- **[React 19.1.0](https://react.dev/)** - Bibliothèque UI
- **[TypeScript 5](https://www.typescriptlang.org/)** - Typage statique
- **[Turbopack](https://turbo.build/pack)** - Bundler ultra-rapide

### Styling & UI

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Material-UI (MUI) 7.3.4](https://mui.com/)** - Composants React
- **[@emotion/react](https://emotion.sh/)** - CSS-in-JS
- **[Lucide React](https://lucide.dev/)** - Icônes modernes
- **[React Icons](https://react-icons.github.io/react-icons/)** - Collection d'icônes
- **[React Bootstrap](https://react-bootstrap.github.io/)** - Composants Bootstrap

### État & Data Management

- **[Zustand 5.0.8](https://zustand-demo.pmnd.rs/)** - Gestion d'état légère
- **[Axios 1.12.2](https://axios-http.com/)** - Client HTTP
- **[js-cookie](https://github.com/js-cookie/js-cookie)** - Gestion des cookies

### UI/UX Components

- **[Recharts 3.1.2](https://recharts.org/)** - Graphiques et visualisations
- **[React Hot Toast](https://react-hot-toast.com/)** - Notifications toast modernes
- **[Sonner](https://sonner.emilkowal.ski/)** - System de notifications
- **[React DatePicker](https://reactdatepicker.com/)** - Sélecteur de dates
- **[@headlessui/react](https://headlessui.com/)** - Composants UI accessibles
- **[React Spinners](https://www.davidhu.io/react-spinners/)** - Indicateurs de chargement

### Utilitaires & Export

- **[jsPDF 3.0.1](https://github.com/parallax/jsPDF)** - Génération de PDF
- **[html2canvas](https://html2canvas.hertzen.com/)** - Capture d'écran HTML
- **[FileSaver.js](https://github.com/eligrey/FileSaver.js/)** - Téléchargement de fichiers
- **[XLSX](https://sheetjs.com/)** - Export Excel
- **[React QR Code](https://www.npmjs.com/package/react-qr-code)** - Génération de QR codes

### Authentification

- **[jwt-decode](https://github.com/auth0/jwt-decode)** - Décodage JWT

### Routing

- **[React Router DOM](https://reactrouter.com/)** - Navigation


## 🚀 Installation et Configuration

### Prérequis

- Node.js 20+ 
- npm, yarn, pnpm ou bun

### Installation

1. **Cloner le repository**

```bash
git clone <repository-url>
cd frontend
```

2. **Installer les dépendances**

```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

3. **Configuration de l'environnement**

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=ISEEM
```

4. **Lancer le serveur de développement**

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)


## 📁 Structure du Projet

```
frontend/
├── app/                        # App Router Next.js
│   ├── admin/                 # Routes administrateur
│   │   ├── dashboard/         # Tableau de bord admin
│   │   ├── students/          # Gestion étudiants
│   │   ├── professeurs/       # Gestion enseignants
│   │   ├── absences/          # Gestion absences
│   │   ├── notes/             # Gestion notes
│   │   ├── paiement/          # Gestion paiements
│   │   ├── emploi-du-temps/   # Gestion emplois du temps
│   │   ├── formations/        # Gestion formations
│   │   ├── modules/           # Gestion modules
│   │   ├── programmes/        # Gestion programmes
│   │   ├── depenses/          # Gestion dépenses
│   │   └── diplomes/          # Gestion diplômes
│   ├── enseignant/            # Routes enseignant
│   │   ├── dashboard/         # Tableau de bord enseignant
│   │   ├── etudiants/         # Liste étudiants
│   │   ├── notes/             # Gestion notes
│   │   ├── absences/          # Gestion absences
│   │   └── emploi-du-temps/   # Emploi du temps
│   ├── etudiant/              # Routes étudiant
│   │   ├── notes/             # Consultation notes
│   │   └── absences/          # Consultation absences
│   ├── globals.css            # Styles globaux
│   ├── layout.tsx             # Layout racine
│   └── page.tsx               # Page d'accueil
├── components/                # Composants réutilisables
│   ├── forms/                 # Formulaires
│   ├── cards/                 # Composants carte
│   ├── Button.tsx             # Bouton personnalisé
│   ├── Header.tsx             # En-tête
│   ├── SideBar.tsx            # Barre latérale
│   ├── TableauDynamique.tsx   # Tableau dynamique
│   ├── Pagination.tsx         # Pagination
│   └── SearchBar.tsx          # Barre de recherche
├── lib/                       # Utilitaires et configurations
│   ├── types/                 # Types TypeScript
│   ├── api/                   # Services API
│   └── utils/                 # Fonctions utilitaires
├── middleware.ts              # Middleware d'authentification
├── public/                    # Fichiers statiques
└── package.json               # Dépendances

```

## 🔧 Build de Production

```bash
npm run build
npm start
```

## 📝 Scripts Disponibles

- `npm run dev` - Lancer en mode développement avec Turbopack
- `npm run build` - Créer un build de production
- `npm run start` - Lancer le serveur de production
- `npm run lint` - Vérifier le code avec ESLint

## 🎨 Fonctionnalités UI/UX

- Design moderne et responsive
- Interface multilingue (Français)
- Thème personnalisé avec couleurs de marque
- Animations et transitions fluides
- Composants accessibles
- Tableaux dynamiques avec tri et filtrage
- Export de données (Excel, PDF)
- Génération de QR codes
- Graphiques interactifs
- Notifications toast élégantes

## 🔒 Sécurité

- Authentification JWT
- Protection des routes par middleware
- Gestion sécurisée des cookies
- Validation des données côté client et serveur
- Contrôle d'accès basé sur les rôles (RBAC)

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- Desktop (1920px+)
- Tablette (768px - 1919px)
- Mobile (320px - 767px)




