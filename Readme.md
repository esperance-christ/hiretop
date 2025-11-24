# HireTop

**Statut :** En développement  
**Version :** 1.0.0  

HireTop est une plateforme africaine de mise en relation entre talents et entreprises. Les utilisateurs peuvent consulter et postuler facilement aux offres d’emploi, tandis que les recruteurs peuvent publier et gérer leurs opportunités.  

---

## Stack technique utilisée

### Backend
- **AdonisJS 6** – Framework Node.js MVC fullstack, structuration rapide et sécurisée.
- **@adonisjs/lucid** – ORM pour MySQL pour la gestion des modèles et relations.
- **@adonisjs/auth** – Authentification des talents et recruteurs.
- **@adonisjs/drive** – Gestion des fichiers locaux ou cloud.
- **@adonisjs/mail** – Envoi d’e-mails pour notifications et confirmations.
- **@adonisjs/session & @adonisjs/shield** – Sécurité et gestion des sessions.

### Frontend
- **React 19** – Interface utilisateur dynamique et réactive.
- **InertiaJS** – Liaison backend/front-end pour une expérience type SPA.
- **TailwindCSS 4** – Styling moderne, responsive et modulable.
- **Radix UI** – Composants accessibles (Avatar, Dialog, Tooltip…).
- **React Hook Form & Zod** – Validation et gestion des formulaires.

### Base de données
- **MySQL 8** – Base relationnelle pour toutes les données.
- **mysql2** – Driver Node.js pour MySQL.

### Outils & Développement
- **Vite** – Build rapide et développement frontend moderne.
- **TypeScript** – Typage statique pour plus de sécurité et lisibilité.
- **Prettier & ESLint** – Standardisation du code.
- **Japa** – Tests unitaires et fonctionnels.

---

## Instructions de lancement local

1. **Cloner le projet**

```bash
git clone <repo_url>
cd hiretop-project
````

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer la base de données**

Créer un fichier `.env` ou éditer celui existant :

```
DB_CONNECTION=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=hiretop
```

4. **Exécuter les migrations et seeds**

```bash
node ace migration:run
node ace db:seed
```

5. **Lancer le serveur en développement**

```bash
npm run dev
```

Le frontend sera servi via InertiaJS, le backend est disponible sur le port configuré par AdonisJS.

---

## Explication des choix faits (techniques et fonctionnels)

### Choix techniques

* **AdonisJS** : Permet un backend complet avec ORM, auth, mailing, et gestion des fichiers sans complexité supplémentaire.
* **Architecture orientée services** : Chaque fonctionnalité (utilisateur, offres, candidature) est isolée dans des services pour une meilleure maintenabilité et scalabilité.
* **React + InertiaJS** : Permet une expérience utilisateur type SPA tout en gardant la logique côté serveur et les avantages SEO.
* **TailwindCSS & SHADCN UI** : Rapidité de prototypage et interface moderne, accessible et responsive.
* **TypeScript** : Typage fort pour sécuriser et documenter le code côté frontend et backend.

## Fonctionnalités actuellement implémentées

* Création et validation d’un compte.
* Création d’offres par les recruteurs.
* Accès aux offres selon le rôle et les compétences des utilisateurs.
* Acceptation ou rejet d’une offre.
* Modification du profil pour les talents et les entreprises.

## Accès par défaut pour tests

### Pour tester rapidement le processus, deux comptes sont créés par défaut :

**Email	Rôle	Mot de passe**
* alice@digitalcompany.com
	* **Role: COMPANY_ADMIN** 
  * **Mot de passe :** password123
* charlie@talent.com
  * **Role: TALENT** 
  * **Mot de passe :** password123

Ces comptes permettent de se connecter en tant que talent ou COMPANY_ADMIN.
