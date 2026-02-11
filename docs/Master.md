# LinkLock - Master Blueprint

## 📋 Vue d'ensemble du Projet

Application de gestion pour conciergerie et agence immobiliere avec gestion du personnel et des cles.

## 🏗️ Architecture

### Backend
- **Framework** : Node.js + Express
- **Base de donnees** : MariaDB/MySQL avec mysql2
- **Authentification** : Bcrypt pour le hashage des mots de passe (10 rounds)
- **Logging** : Logging discret avec niveaux configurables

### Frontend
- **Framework** : React 18
- **UI Framework** : Soft UI Dashboard React + Material-UI
- **Routing** : React Router DOM v6 avec React.lazy() et Suspense
- **State Management** : React Context

## 🗺️ Routes LinkLock

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Tableau de bord principal |
| `/companies` | Companies | Gestion unifiee des entreprises (Conciergerie + Agences) |
| `/personnel` | Personnel | Gestion du personnel avec affectation entreprise |
| `/cles` | Cles | Gestion des cles, adresses, proprietaires |
| `/cles/:id/visualiser` | KeyVisualisation | Visualisation QR code pour les cles |
| `/profile` | Profile | Profil utilisateur |
| `/authentication/sign-in` | SignIn | Connexion |
| `/authentication/sign-out` | SignOut | Deconnexion |

## 🗂️ Structure des Fichiers

```
LinkLock/
├── server.js                 # Point entre backend
├── src/
│   ├── api/                  # API frontend
│   │   ├── companies.js      # CRUD Entreprises + hierarchie
│   │   ├── personnel.js      # CRUD Personnel (Bcrypt)
│   │   ├── keys.js           # CRUD Cles + partage
│   │   └── logger.js         # Utility logging discret
│   ├── backend/              # Routes Express backend
│   │   ├── companies.js      # Routes entreprises (hierarchie)
│   │   ├── personnel.js      # Routes personnel (Bcrypt)
│   │   └── keys.js           # Routes cles (partage + visibilite)
│   ├── layouts/
│   │   ├── companies/        # Page Entreprises unifiee (lazy)
│   │   ├── personnel/        # Page Personnel (lazy)
│   │   ├── cles/             # Page Cles avec partage (lazy)
│   │   ├── key-visualisation/# Page QR code (lazy)
│   │   └── dashboard/        # Dashboard principal
│   └── routes.js             # Routes avec lazy loading
└── docs/
    ├── Master.md             # Ce fichier
    └── CompanyManagement.md  # Documentation technique
```

## 🔐 Securite

### Bcrypt Hashing
- **Round de sel** : 10
- **Application** : Tous les mots de passe personnel

### Logging Discret
- **Niveaux** : error, warn, info, debug
- **Production** : JSON silencieux
- **Developpement** : Console verbeux

## 📊 Hierarchie Entreprises

### Structure
- **Agences Immobilieres** : Entreprises meres (peuvent avoir des conciergeries)
- **Conciergeries** : Entreprises filles (rattachement optionnel a une agence)

### Relations
```
Agence Paris Opéra (id: 1)
├── Conciergerie Paris Centre (parent_id: 1)
└── Conciergerie Paris Nord (parent_id: 1)

Agence Lyon Bellecour (id: 2)
├── Conciergerie Lyon Part-Dieu (parent_id: 2)
└── Conciergerie Lyon Presqu'ile (parent_id: 2)

Conciergerie Indépendante (parent_id: NULL)
```

## 🔑 Partage de Clés

### Fonctionnalites
- **Partage manuel** : Entreprises peuvent partager des cles entre elles
- **Permissions** : Lecture, Edition, Controle total
- **Visibilite** : Les agences voient les cles de leurs conciergeries

### Table key_shares
```sql
CREATE TABLE key_shares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key_id INT NOT NULL,
  shared_with_company_id INT NOT NULL,
  permissions ENUM('view', 'edit', 'full') DEFAULT 'view',
  UNIQUE KEY unique_share (key_id, shared_with_company_id)
);
```

### Visibilite des cles
- **Proprietaire** : Cles creees par l'entreprise
- **Partage** : Cles partagees avec l'entreprise
- **Hierarchie** : Cles des conciergeries (pour les agences uniquement)

## 🎨 Composants UI

### Soft UI Dashboard
- **Cards** : Affichage des entreprises (style Projects)
- **Tables** : Affichage du personnel (style Authors)
- **Modals/Drawers** : Formulaires d'edition
- **Tabs** : Filtrage Conciergerie/Agence

### Key Sharing
- **Dialog de partage** : Selection des entreprises
- **Permissions** : Dropdown Lecture/Edition/Controle total
- **Badges** : Affichage du type de visibilite

## 📦 Lazy Loading

Les pages suivantes utilisent React.lazy() :

```javascript
const Companies = lazy(() => import("layouts/companies"));
const Personnel = lazy(() => import("layouts/personnel"));
const Cles = lazy(() => import("layouts/cles"));
const KeyVisualisation = lazy(() => import("layouts/key-visualisation"));
```

Suspense avec CircularProgress comme fallback :

```javascript
<Suspense fallback={<LoadingFallback />}>
  <Routes>{getRoutes(routes)}</Routes>
</Suspense>
```

## 💾 Persistance

### Preferences Utilisateur
- **Mode d'affichage** : Liste/Carte (localStorage) - pour les futures cartes
- **Position boutons** : Historique des positions (localStorage)

### Base de Donnees
- **Tables** : companies, personnel, keys, key_shares
- **Relations** : Cles etrangeres avec CASCADE
- **Hierarchie** : parent_id dans companies

## 🔧 Configuration

### Variables d'Environnement
```env
DB_PASSWORD=your_password
REACT_APP_BACKEND_SERVER=http://localhost:5000/api/
LOG_LEVEL=warn
NODE_ENV=development
```

## 📝 Journal des Modifications

### 2026-02-11 - Architecture Avancee

#### Module Entreprises
- ✅ Page combinee Conciergerie + Agences avec onglets
- ✅ Selection du parent (agence de rattachement)
- ✅ Indicateurs visuels hierarchie (chips)

#### Module Cles
- ✅ Partage de cles entre entreprises
- ✅ Dialog de partage avec permissions
- ✅ Visibilite (Proprietaire/Partage/Hiérarchie)
- ✅ QR Code pour visualisation

#### Personnel
- ✅ Affectation a une entreprise
- ✅ Roles (admin/manager/employee)
- ✅ Hash Bcrypt 10 rounds

#### Backend
- ✅ Routes hierarchie (/parents, /children, /hierarchy)
- ✅ Routes partage (/share, /unshare, /shares)
- ✅ Visibilite des cles (/visible)

### 2026-02-11 - Architecture Routes
- ✅ Routes /companies (unique), /personnel, /cles
- ✅ React.lazy() avec Suspense
- ✅ Mock data fallback si API indisponible
- ✅ try/catch sur tous les appels API

### 2026-02-11 - Nettoyage Template
- ✅ Suppression Configurator
- ✅ Suppression SidenavCard
- ✅ Correction SpaceShip icon -> Material UI Icon
- ✅ Suppression FloatingButtons (retire pour simplifier)

## 🚀 Demarrage

```bash
# Backend
node src/models/init-db.js  # Creer les tables avec schema complet
node server.js              # Demarrer le serveur

# Frontend
npm start                   # Demarrer React
```

## 📞 Support

- **GitHub** : https://github.com/beyrem/LinkLock
- **Documentation** : docs/CompanyManagement.md

## 📌 Notes S-Directive

### Standards respectes
- [cite: 2026-01-30] Bcrypt 10 rounds pour personnel
- [cite: 2026-01-11] React.lazy() pour optimisation cache
- [cite: 2025-12-29] Persistance preferences localStorage
- [cite: 2026-02-10] Boutons flottants (retires pour simplifier UI)
- [cite: 2026-01-16] Logging discret (logAction function)
- [cite: 2026-01-30] Analyse Master.md avant generation
- [cite: 2025-12-22] Documentation dans docs/
- [cite: 2026-01-19] Notification Slack apres CRUD
