Bien sûr ! Voici une version complète du README en **Markdown**, prête à être sauvegardée en `README.md` :

```markdown
# HireTop

![Version](https://img.shields.io/badge/version-0.0.0-blue)
![Licence](https://img.shields.io/badge/license-UNLICENSED-red)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

**Statut :** En développement  

HireTop est une plateforme de mise en relation entre talents et entreprises en Afrique, permettant aux utilisateurs de publier, consulter et postuler facilement aux offres d’emploi. Le projet est basé sur **AdonisJS**, **React** et **InertiaJS**, avec une architecture **orientée services** pour faciliter l’évolution et la maintenance.

---

## Table des matières

- [Objectif du projet](#objectif-du-projet)  
- [Technologies utilisées](#technologies-utilisées)  
- [Structure du projet](#structure-du-projet)  
- [État actuel](#état-actuel)  
- [Installation](#installation)  
- [Scripts disponibles](#scripts-disponibles)  
- [Roadmap](#roadmap)  
- [Licence](#licence)

---

## Objectif du projet

Le but de HireTop est de :

- Connecter les **talents africains** avec des entreprises locales et internationales.  
- Permettre aux utilisateurs de **postuler facilement** sans processus de vérification complexe.  
- Fournir une interface intuitive pour **publier et gérer des offres d’emploi**.  
- Utiliser une architecture **modulaire et orientée services** pour garantir la scalabilité.  

---

## Technologies utilisées

### Backend

- **AdonisJS 6** – Framework Node.js MVC fullstack  
- **@adonisjs/drive** – Gestion des fichiers locaux ou cloud  
- **@adonisjs/lucid** – ORM pour MySQL  
- **@adonisjs/auth** – Gestion des utilisateurs et de l’authentification  
- **@adonisjs/mail** – Envoi de mails  
- **@adonisjs/session et @adonisjs/shield** – Sécurité et gestion des sessions  

### Frontend

- **React 19** – UI dynamique  
- **InertiaJS** – Communication backend/frontend type SPA  
- **TailwindCSS 4** – Styling moderne et responsive  
- **Radix UI** – Composants accessibles (Avatar, Dialog, Tooltip…)  
- **React Hook Form & Zod** – Validation de formulaire  

### Base de données

- **MySQL 8** – Stockage des données relationnelles  
- **mysql2** – Driver Node.js  

### Outils & Développement

- **Vite** – Build et développement frontend rapide  
- **TypeScript** – Typage statique  
- **Prettier & ESLint** – Linter et formateur  
- **Japa** – Tests unitaires et fonctionnels  

---

## Structure du projet

Le projet est structuré autour des **services**, avec un découpage clair entre les modules et les responsabilités :

```

app/
controllers/    # Contrôleurs AdonisJS
services/       # Logique métier et services
models/         # Modèles Lucid ORM
validators/     # Validation des données
middleware/     # Middleware
policies/       # Gestion des permissions
database/         # Migrations et seeds
start/            # Bootstrap de l'application
config/           # Configuration globale

````

Le frontend React est intégré via **InertiaJS**, permettant de gérer les pages directement depuis AdonisJS.

---

## État actuel du projet

- Le **module entreprise** est encore en cours de développement.  
- Les utilisateurs peuvent **postuler directement aux offres**.  
- La vérification des compétences et les boutons “Details” ont été supprimés pour simplifier le processus.  
- La devise affichée est soit **XOF** (Franc CFA) soit **$**, pas d’Euro.  
- L’architecture est basée sur **des services**, facilitant la réutilisation et la maintenabilité.  
- Les fonctionnalités principales pour les talents (recherche, postuler) et les offres sont opérationnelles.  

---

## Installation

1. Cloner le projet :

```bash
git clone <repo_url>
cd hiretop-project
````

2. Installer les dépendances :

```bash
npm install
```

3. Configurer la base de données dans `.env` :

```
DB_CONNECTION=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=hiretop
```

4. Exécuter les migrations et seeds :

```bash
node ace migration:run
node ace db:seed
```

5. Lancer le serveur en développement :

```bash
npm run dev
```

---

## Scripts disponibles

| Script              | Description                                      |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Lancer le serveur en mode développement avec HMR |
| `npm run build`     | Compiler le projet TypeScript pour la production |
| `npm run start`     | Démarrer le serveur en production                |
| `npm run seed`      | Exécuter les seeds de base de données            |
| `npm run test`      | Lancer les tests unitaires/fonctionnels          |
| `npm run lint`      | Linter le code avec ESLint                       |
| `npm run format`    | Formater le code avec Prettier                   |
| `npm run typecheck` | Vérifier le typage TypeScript                    |

---

## Roadmap

* [x] Authentification des talents et recruteurs
* [x] Publication et affichage des offres d’emploi
* [x] Fonctionnalité de postulation simplifiée
* [ ] Module entreprise (en cours)
* [ ] Gestion avancée des talents et compétences
* [ ] Notifications et messagerie interne
* [ ] Dashboard admin et reporting

---

## Licence

Projet **UNLICENSED** – usage interne et en développement.
