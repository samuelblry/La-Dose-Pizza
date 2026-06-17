# La Dose Pizza — Instructions

## Projet
Site web d'une pizzeria pour le projet fil rouge B2 Ynov (Technologies WEB & BDD).
Binôme : Samuel BOUHNIK-LOURY + William PONS.
Rendu : 22 juin 2026. Repo PUBLIC sur GitHub.

## Stack technique
- **Backend** : Python / Django (MVC, ORM Django)
- **Frontend** : React + Tailwind CSS
- **BDD** : PostgreSQL
- **Deps** : pip (backend), npm (frontend)
- **Auth** : JWT via `djangorestframework-simplejwt`, rôles (client / admin)

## Fonctionnalités

### Client
- Voir la carte (pizzas disponibles / indisponibles)
- Créer un compte, se connecter
- Commander en ligne (livraison ou sur place)
- Réserver une table
- Suivre ses commandes passées et en cours
- Points de fidélité cumulés à chaque achat → réductions
- Télécharger ses factures (PDF)

### Admin / Chef
- Dashboard : stats du jour
- Voir et changer le statut des commandes
- Gérer la carte (ajouter / modifier / supprimer des pizzas, toggle disponibilité)
- Fiches clients (nom, prénom, email, téléphone, points de fidélité)
- Voir et changer le statut des réservations

## Règles absolues
- **Ne jamais faire de commit ou push** — Samuel et William commitent eux-mêmes
- **Zéro mention IA** dans le code, les commits, les commentaires
- **Commentaires courts en français** — style naturel B2, pas de docstrings multi-lignes
- **Pas de TODO/FIXME** générés automatiquement
- **Ne pas toucher à `frontend/`** — Samuel gère tout le front

## Lancer le projet (Première fois & Local)

### Backend (Docker / Django)

#### 1. Lancement des conteneurs
Pour démarrer le projet **pour la première fois** sur une nouvelle machine :
```bash
docker compose up --build
```
*Note : Cela construit l'image backend et lance PostgreSQL ainsi que Django (accessible sur le port `8000`). Les migrations Django sont appliquées automatiquement à chaque démarrage du conteneur grâce au script défini dans le `Dockerfile`.*

#### 2. Création du compte Administrateur / Staff
La base de données étant initialement vide lors du premier lancement, vous devez créer manuellement le compte administrateur utilisé pour les tests et le dashboard admin :
```bash
docker compose exec backend python manage.py createsuperuser
```
Entrez les informations suivantes :
- **Adresse email** : `staff@ladose.fr` (requis par le frontend pour les tests d'accès admin)
- **Mot de passe** : `Staff1234`

#### 3. Initialisation des données (Pizzas, Tables, etc.)
Connectez-vous sur le panel d'administration Django pour créer les premières pizzas et tables indispensables au bon fonctionnement de l'application :
👉 [http://localhost:8000/admin/](http://localhost:8000/admin/)
*(Vous devez ajouter au moins quelques pizzas disponibles dans le menu et quelques tables de restaurant avec leurs capacités respectives pour tester le module de réservation).*

---

### Frontend (React / Vite)

#### 1. Installation des dépendances et lancement
```bash
cd frontend
npm install
npm run dev
```
Le serveur de développement Vite démarrera sur :
👉 [http://localhost:5173/](http://localhost:5173/)

---

## État du front (13/13 pages faites, toutes branchées API)

### Pages publiques
- [x] Accueil (`/`) — `Home.jsx`
- [x] Carte / Menu (`/menu`) — `Menu.jsx` (Désormais dynamique via `apiPizzas`)
- [x] Panier (`/panier`) — `Cart.jsx`
- [x] Connexion (`/connexion`) — `Login.jsx`
- [x] Inscription (`/inscription`) — `Register.jsx`

### Client connecté
- [x] Mon Compte (`/mon-compte`) — `Account.jsx` (Avec liste des réservations et suppression sécurisée)
- [x] Commander / Checkout (`/commander`) — `Checkout.jsx`
- [x] Réservation (`/reservation`) — `Reservation.jsx`

### Admin / Chef
- [x] Dashboard (`/admin`) — `admin/Dashboard.jsx`
- [x] Gérer la carte (`/admin/menu`) — `admin/ManageMenu.jsx`
- [x] Commandes (`/admin/commandes`) — `admin/Orders.jsx`
- [x] Clients (`/admin/clients`) — `admin/Clients.jsx`
- [x] Réservations (`/admin/reservations`) — `admin/Reservations.jsx`

### Ce qui reste à faire côté front
- Rien de bloquant. Améliorations UX possibles (ex: rollback optimiste en cas d'erreur API admin, formulaire d'édition complet pour les pizzas).
- **Points de fidélité & Factures** : ✅ Entièrement opérationnels. Les points s'ajoutent lors du passage à l'état "livrée" sur la base du montant brut. Le téléchargement des factures PDF fonctionne via un appel fetch authentifié.

### Notes importantes pour William & Samuel
- **Images & Factures** : Les URLs d'images et de factures PDF sont construites à l'aide de la constante `MEDIA_BASE` exportée de `api.js` (actuellement `'http://localhost:8000'`). Cela évite les liens codés en dur.
- **Identifiants PK** : Le front utilise `id` comme clé primaire par défaut avec un fallback défensif `obj.id_xxx ?? obj.id` pour garantir la compatibilité avec la BDD.
- **Accès admin/staff** : Un compte de test a été créé en BDD avec les rôles admin/staff : `staff@ladose.fr` / `Staff1234`.
- **Déconnexion** : La Navbar appelle l'API `/api/auth/logout/` (POST) avec les tokens d'accès et de rafraîchissement avant de vider le localStorage.
- **Mon Compte (`Account.jsx`)** : Affiche désormais l'historique complet des réservations de table en plus des commandes de pizzas. La suppression de compte est enveloppée dans un bloc `try/catch` pour éviter tout crash si l'API ne répond pas.
- **Pied de page (`Footer.jsx`)** : Utilise désormais des composants `<Link>` de React Router pour éviter les recharges complètes de page lors de la navigation interne.

---

## Instructions pour William (backend)

### Endpoints déjà en place (vérifiés)
| Méthode | URL | Status |
|---------|-----|--------|
| POST | `/api/auth/register/` | ✅ |
| POST | `/api/auth/login/` | ✅ |
| POST | `/api/auth/logout/` | ✅ |
| GET | `/api/users/me/` | ✅ |
| PATCH | `/api/users/me/` | ✅ |
| PATCH | `/api/users/me/password/` | ✅ |
| DELETE | `/api/users/me/` | ✅ |
| GET | `/api/menu/pizzas/` | ✅ |
| POST | `/api/menu/pizzas/` | ✅ |
| PATCH | `/api/menu/pizzas/{id}/` | ✅ |
| DELETE | `/api/menu/pizzas/{id}/` | ✅ |
| GET | `/api/orders/` | ✅ |
| POST | `/api/orders/` | ✅ |
| GET | `/api/orders/{id}/invoice/` | ✅ |
| GET | `/api/reservations/` | ✅ |
| POST | `/api/reservations/` | ✅ |
| PATCH | `/api/reservations/{id}/` | ✅ |
| GET | `/api/reservations/tables/` | ✅ |
| GET | `/api/admin/stats/` | ✅ |
| GET | `/api/admin/orders/` | ✅ |
| PATCH | `/api/admin/orders/{id}/` | ✅ |
| GET | `/api/admin/clients/` | ✅ |
| GET | `/api/admin/reservations/` | ✅ |
| PATCH | `/api/admin/reservations/{id}/` | ✅ |

### Endpoints à créer — PRIORITÉ

Tous les endpoints prioritaires initiaux ont été implémentés.


### Détails des corps de requête

#### POST `/api/auth/register/`
```json
{ "first_name": "...", "last_name": "...", "email": "...", "password": "...", "phone": "..." }
```
Retourne : `{ token, is_admin }`

#### POST `/api/auth/login/`
```json
{ "email": "...", "password": "..." }
```
Retourne : `{ token, is_admin }`

#### POST `/api/orders/`
```json
{ "street": "...", "zip_code": "...", "city": "...", "order_type": "livraison", "items": [{ "id_pizza": 1, "quantity": 2 }] }
```
- `order_type` : `"livraison"` ou `"sur_place"` (si `sur_place`, les champs adresse sont absents)
- Retourne : `{ id, invoice_number, total_amount }`

#### POST `/api/reservations/`
```json
{ "reservation_date": "2026-06-20", "reservation_time": "12:30", "guest_count": 4, "table_id": 3 }
```
- Si `table_id` est précisé, vérifie sa disponibilité. Sinon, assigne automatiquement une table.
- Retourne : `{ id, status, table_number }`

#### PATCH `/api/reservations/{id}/`
```json
{ "status": "annulee" }
```
- Permet au client d'annuler sa réservation (statut passe à `annulee`).

#### GET `/api/reservations/tables/`
- Paramètres query : `?date=2026-06-20&time=12:30`
- Retourne la liste de toutes les tables avec un flag `is_reserved: true|false`.

#### POST `/api/menu/pizzas/` — multipart/form-data
Champs : `name, description, base_price, image_url` (fichier image)
- Le modèle `Pizza.image_url` est un `ImageField` qui stocke dans `media/pizzas/`
- Pillow est déjà dans `requirements.txt`

#### PATCH `/api/admin/orders/{id}/`
```json
{ "status": "en_preparation" }
```
Valeurs possibles : `en_attente`, `en_preparation`, `en_livraison`, `livree`, `annulee`

#### PATCH `/api/admin/reservations/{id}/`
```json
{ "status": "confirmee" }
```
Valeurs possibles : `en_attente`, `confirmee`, `annulee`

### Champs renvoyés par l'API (ce que le front attend)

#### GET `/api/users/me/`
```json
{
  "first_name": "...", "last_name": "...", "email": "...", "phone": "...",
  "loyalty_points": 0,
  "address": { "street": "...", "zip_code": "...", "city": "..." }
}
```

#### GET `/api/menu/pizzas/`
```json
[{
  "id": 1, "name": "Margherita", "description": "...",
  "base_price": "12.50", "image_url": "/media/pizzas/...",
  "is_available": true,
  "ingredients": [{ "id": 1, "name": "Tomate", "extra_cost": "0.00" }],
  "allergens": ["Lactose"]
}]
```
Les `allergens` sont dédoublonnés et extraits via `pizza_recipe → has_allergen → allergen`.

#### GET `/api/orders/`
```json
[{
  "id": 1, "invoice_number": "FAC-001", "order_date": "2026-06-15T10:00:00Z",
  "status": "livree", "total_amount": "24.50", "order_type": "livraison"
}]
```

#### GET `/api/admin/orders/`
```json
[{
  "id": 1, "invoice_number": "FAC-001", "order_date": "...",
  "status": "...", "total_amount": "...", "order_type": "...",
  "user_email": "...", "user_first_name": "...", "user_last_name": "...", "user_phone": "..."
}]
```

#### GET `/api/admin/clients/`
```json
[{
  "id": 1, "email": "...", "first_name": "...", "last_name": "...",
  "phone": "...", "loyalty_points": 42,
  "address": { "street": "...", "city": "..." }
}]
```

#### GET `/api/admin/reservations/`
```json
[{
  "id": 1, "reservation_date": "2026-06-20", "reservation_time": "12:30:00",
  "guest_count": 4, "status": "confirmee",
  "user_email": "...", "user_first_name": "...", "user_last_name": "...", "user_phone": "...",
  "table_number": 3
}]
```

#### GET `/api/admin/stats/`
```json
{ "orders_today": 5, "pending_reservations": 3, "total_clients": 42 }
```

### Points de fidélité
À chaque commande passée en `status = "livree"`, ajouter des points dans `user_account.loyalty_points`. Règle : **1 pt par euro** (arrondi à l'entier inférieur).

---

## Charte graphique

### Couleurs
| Nom | Hex | Usage |
|-----|-----|-------|
| Dark | `#1A0200` | Fond principal, texte |
| Rouge | `#B43024` | Accent principal, CTA |
| Or/Ambre | `#E6A557` | Accent secondaire, highlights |
| Beige chaud | `#E0BB93` | Fond carte, éléments doux |
| Crème | `#F4E1CC` | Fond clair, sections légères |

### Typographie
- **Titres** : Lostar (même police que le logo)
- **Sous-titres / corps** : Poppins
- Tagline : "FINGER-LICKING GOOD"

### Assets disponibles (`/public/img/`)
```
background/
  background_pizza_hero.webp
element/
  assiette.png
  pizzaiolo_envoie_pizza.png
  pizza_qui_vole.png
  scooter.png
logo/
  logo_court.svg          ← monogramme "LsD"
  logo_long.svg           ← "LA DOSE PIZZA"
  logo_long_complet.svg   ← logo + tagline
```

---

## Évaluation (critères)
- CRUD + Auth : 4 pts
- Présentation/démo : 4 pts
- Architecture + UML + MERISE : 2 pts
- UI/UX responsive (mobile first) : 2 pts
- Hébergement : 2 pts
- Qualité code : 2 pts
