# La Dose Pizza

Site web d'une pizzeria fictive — projet fil rouge B2 Ynov (Technologies WEB & BDD).  
Binôme : **Samuel BOUHNIK-LOURY** · **William PONS** — Rendu : 22 juin 2026

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Backend | Python 3.11 / Django 4.2 + Django REST Framework |
| Auth | JWT via `djangorestframework-simplejwt` |
| Base de données | PostgreSQL 16 |
| Frontend | React 18 + Vite + Tailwind CSS 3 |
| Paiement | Stripe (CardElement + PaymentIntent) |
| Génération PDF | ReportLab (factures) |
| Conteneurisation | Docker + Docker Compose |

---

## Fonctionnalités

### Client
- Consulter la carte (pizzas disponibles / indisponibles)
- Créer un compte, se connecter
- Commander en ligne (livraison ou sur place)
- Réserver une table via un plan de salle interactif
- Suivre ses commandes passées et en cours
- Points de fidélité (1 pt = 0,10 €) cumulés à chaque commande
- Télécharger ses factures en PDF

### Admin / Employé (staff)
- Dashboard avec statistiques du jour
- Gérer les statuts des commandes
- Gérer la carte (CRUD pizzas, toggle disponibilité)
- Fiches clients (nom, email, téléphone, points de fidélité)
- Gérer les réservations

### Super Admin
- Statistiques globales (CA, commandes, réservations, clients, employés)
- Gérer les comptes employés (créer, supprimer, reset mot de passe)
- Consulter tous les clients
- Logs de connexion des employés

---

## Architecture

```
La-Dose-Pizza/
├── backend/
│   ├── ladosepizza/        # settings, urls, wsgi
│   ├── users/              # auth, profil, JWT, LoginLog
│   ├── menu/               # pizzas, ingrédients, allergènes
│   ├── orders/             # commandes, factures PDF
│   ├── reservations/       # réservations, tables
│   ├── payments/           # intégration Stripe
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          # 16 pages (public + client + admin + super-admin)
│   │   ├── components/     # composants réutilisables
│   │   ├── context/        # AuthContext, CartContext
│   │   └── services/       # appels API
│   └── package.json
├── doc/
│   ├── MCD.png
│   ├── MLD.png
│   └── schema.sql
└── docker-compose.yml
```

---

## Lancer le projet en local

### Prérequis
- Docker Desktop
- Node.js 18+

### 1. Variables d'environnement

Créer `backend/.env` :

```env
SECRET_KEY=une-clé-secrète-django
DEBUG=True
DB_NAME=ladosepizza
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Backend (Django + PostgreSQL)

```bash
docker compose up --build
```

Django démarre sur `http://localhost:8000`. Les migrations sont appliquées automatiquement au démarrage.

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Vite démarre sur `http://localhost:5173`.

---

## Accès de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Super Admin | *(créé via `python manage.py createsuperuser`)* | — |
| Admin / Employé | *(créé depuis la page Super Admin)* | mot de passe temporaire affiché à la création |
| Client | *(inscription via `/inscription`)* | — |

**Carte Stripe de test :** `4242 4242 4242 4242` — date future — CVC 3 chiffres

---

## Base de données

Le schéma complet est disponible dans [`doc/schema.sql`](doc/schema.sql).  
Les diagrammes MCD et MLD sont dans [`doc/MCD.png`](doc/MCD.png) et [`doc/MLD.png`](doc/MLD.png).

Modèles principaux :
- `UserAccount` — utilisateurs (clients, staff, admin, superadmin)
- `Pizza`, `Ingredient`, `Allergen`, `PizzaRecipe`, `HasAllergen`
- `CustomerOrder`, `OrderItem`
- `RestaurantTable`, `Reservation`
- `Payment`
- `LoginLog`

---

## API REST

Base URL : `http://localhost:8000/api/`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register/` | Inscription |
| POST | `/auth/login/` | Connexion (renvoie JWT + flags rôles) |
| GET/PATCH | `/users/me/` | Profil utilisateur connecté |
| GET | `/menu/pizzas/` | Liste des pizzas |
| POST/PATCH/DELETE | `/menu/pizzas/{id}/` | CRUD pizza (admin) |
| GET/POST | `/orders/` | Commandes client |
| GET | `/orders/{id}/invoice/` | Facture PDF |
| GET/POST | `/reservations/` | Réservations client |
| GET | `/reservations/tables/` | Disponibilité des tables |
| POST | `/payments/create-intent/` | Créer un PaymentIntent Stripe |
| GET | `/admin/stats/` | Stats dashboard (staff) |
| GET/PATCH | `/admin/orders/{id}/` | Gestion commandes (staff) |
| GET | `/admin/clients/` | Liste clients (staff) |
| GET/PATCH | `/admin/reservations/{id}/` | Gestion réservations (staff) |
| GET | `/superadmin/stats/` | Stats globales |
| GET/POST/DELETE | `/superadmin/employees/` | Gestion employés |
| POST | `/superadmin/employees/{id}/reset-password/` | Reset mot de passe |
| GET | `/superadmin/logs/` | Logs de connexion |

---

## Hébergement

| Service | Usage |
|---------|-------|
| Vercel | Frontend (React/Vite) — déploiement automatique depuis GitHub |
| Railway ou Render | Backend Django + PostgreSQL |

> Les URLs de production seront ajoutées après déploiement.
