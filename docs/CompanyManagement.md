# LinkLock - Module de Gestion d'Entreprise

## 📋 Vue d'ensemble

Ce module permet la gestion des entreprises de conciergerie et d'agence immobilière, incluant la gestion du personnel et des clés.

## 🏗️ Architecture

### Modèles de Données

#### 1. Entreprises (`companies`)

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Identifiant unique |
| name | VARCHAR(255) | Nom de l'entreprise |
| type | ENUM | `conciergerie` ou `agence_imobiliere` |
| siret | VARCHAR(50) | Numéro SIRET |
| address | VARCHAR(500) | Adresse complète |
| phone | VARCHAR(50) | Téléphone |
| email | VARCHAR(255) | Email |
| status | ENUM | `active` ou `inactive` |

#### 2. Personnel (`personnel`)

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Identifiant unique |
| company_id | INT | Clé étrangère vers companies |
| first_name | VARCHAR(100) | Prénom |
| last_name | VARCHAR(100) | Nom |
| email | VARCHAR(255) | Email unique |
| phone | VARCHAR(50) | Téléphone |
| role | ENUM | `manager`, `employee`, `admin` |
| access_level | ENUM | `full`, `limited`, `restricted` |
| password_hash | VARCHAR(255) | Mot de passe hashé (Bcrypt) |
| status | ENUM | `active` ou `inactive` |

#### 3. Clés (`keys`)

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Identifiant unique |
| company_id | INT | Clé étrangère vers companies |
| manager_id | INT | Clé étrangère vers personnel |
| address | VARCHAR(500) | Adresse complète du bien |
| owner_name | VARCHAR(255) | Nom du propriétaire |
| owner_contact | VARCHAR(255) | Contact du propriétaire |
| house_manager_name | VARCHAR(255) | Nom du gestionnaire du bien |
| house_manager_contact | VARCHAR(255) | Contact du gestionnaire |
| key_location | VARCHAR(255) | Emplacement de la clé |
| status | ENUM | `available`, `borrowed`, `returned`, `lost` |
| notes | TEXT | Notes supplémentaires |

## 🔐 Sécurité

- **Hashage de mot de passe** : Bcrypt avec 10 rounds de sel
- **Logging discret** : Niveau configurable (error, warn, info, debug)
- **Persistance de session** : JWT pour l'authentification

## 🎨 Interface Utilisateur

### Composants Utilisés

- **Cards** : Soft UI Dashboard Cards
- **Tables** : Soft UI Dashboard Tables
- **Modals** : Dialog Material-UI

### Fonctionnalités

- **Lazy Loading** : Pages chargées dynamiquement
- **Persistance des préférences** : Mode liste/carte sauvegardé
- **Boutons flottants** : Bug et Moai déplaçables avec position sauvegardée

## 📡 API Routes

### Entreprises

```
GET    /api/companies          - Liste toutes les entreprises
GET    /api/companies/:id      - Récupère une entreprise
POST   /api/companies          - Crée une entreprise
PUT    /api/companies/:id      - Met à jour une entreprise
DELETE /api/companies/:id      - Supprime une entreprise
```

### Personnel

```
GET    /api/personnel          - Liste tout le personnel
GET    /api/personnel/:id      - Récupère un membre du personnel
POST   /api/personnel          - Crée un membre du personnel
PUT    /api/personnel/:id      - Met à jour un membre du personnel
DELETE /api/personnel/:id      - Supprime un membre du personnel
POST   /api/personnel/login   - Connexion du personnel
```

### Clés

```
GET    /api/keys               - Liste toutes les clés
GET    /api/keys/:id           - Récupère une clé
POST   /api/keys               - Crée une clé
PUT    /api/keys/:id           - Met à jour une clé
PATCH  /api/keys/:id/status   - Met à jour le statut
DELETE /api/keys/:id           - Supprime une clé
GET    /api/keys/stats/summary - Statistiques des clés
```

## 📦 Installation

1. Créer les tables dans la base de données :
```bash
node src/models/init-db.js
```

2. Démarrer le serveur :
```bash
node server.js
```

3. Démarrer l'application React :
```bash
npm start
```

## 🔧 Configuration

Variables d'environnement :

```env
DB_PASSWORD=your_password
REACT_APP_BACKEND_SERVER=http://localhost:5000/api/
LOG_LEVEL=warn  # error, warn, info, debug
NODE_ENV=development
```

## 📝 Notes

- Les mots de passe sont toujours hashés avec Bcrypt avant stockage
- Le logging discret ne pollue pas la production
- Les positions des boutons flottants sont sauvegardées dans localStorage
