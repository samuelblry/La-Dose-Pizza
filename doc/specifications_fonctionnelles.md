# Spécifications Fonctionnelles - La Dose Pizza

## 1. Fonctionnalités attendues de l'application
La Dose Pizza est une plateforme web permettant la gestion d'une pizzeria. Elle se divise en trois parties distinctes : l'espace client (publique et authentifié), l'espace administrateur (staff) et l'espace super-administrateur.

**Fonctionnalités "Client" (Publique) :**
- **Consultation de la carte** : Affichage dynamique des pizzas disponibles, de leurs ingrédients, des allergènes, ainsi que des boissons et desserts.
- **Création de compte et Authentification** : Inscription avec email/mot de passe et connexion sécurisée via JWT.

**Fonctionnalités "Client" (Authentifié) :**
- **Gestion du profil** : Modification des informations personnelles, de l'adresse de livraison et du mot de passe. Suppression du compte.
- **Commande en ligne** : Ajout d'articles au panier et passage de commande avec le choix "Livraison" ou "Sur place".
- **Paiement en ligne** : Intégration de Stripe pour le paiement sécurisé par carte bancaire.
- **Réservation de table** : Réservation pour une date, une heure et un nombre de convives via un plan de salle interactif.
- **Suivi et Historique** : Affichage des commandes passées/en cours et des réservations passées/à venir.
- **Programme de fidélité** : Cumul de points lors des commandes (1 pt = 0,10 €) et affichage du solde.
- **Facturation** : Téléchargement des factures au format PDF pour les commandes finalisées.

**Fonctionnalités "Administrateur / Employé" :**
- **Tableau de bord (Dashboard)** : Vue d'ensemble avec les statistiques du jour.
- **Gestion de la carte (CRUD)** : Ajout, modification (prix, description, disponibilité), suppression de pizzas, et upload d'images.
- **Gestion des commandes** : Visualisation de toutes les commandes et modification de leur statut.
- **Gestion des réservations** : Visualisation des réservations et validation/annulation de celles-ci.
- **Gestion des clients** : Accès aux fiches clients (coordonnées, adresse, solde de points de fidélité).

**Fonctionnalités "Super Administrateur" :**
- **Statistiques globales** : Chiffre d'affaires, total des commandes, réservations, clients et employés.
- **Gestion des employés** : Création, suppression et réinitialisation des mots de passe des comptes staff.
- **Audit et Logs** : Accès aux journaux de connexion (LoginLogs) des employés.

## 2. Rôles des utilisateurs et interactions

**Visiteur non authentifié :**
- Peut naviguer sur la page d'accueil et consulter la carte.
- Doit créer un compte ou se connecter pour finaliser une commande ou une réservation.

**Client authentifié (User) :**
- Accède à la totalité des fonctionnalités d'achat (commande, paiement Stripe) et de réservation.
- Peut consulter son historique et télécharger ses factures PDF générées par le serveur.

**Administrateur / Staff (Admin) :**
- Accède à une interface dédiée (back-office intégré) protégée.
- Interagit avec les données globales de la pizzeria (catalogue, commandes de tous les clients, réservations de tous les clients).

**Super Administrateur :**
- Possède tous les droits.
- Peut créer et gérer les accès des membres du staff.
- A une vue globale sur les performances financières de la pizzeria.

## 3. Cas d'utilisation principaux (Scénarios)

### Cas d'utilisation 1 : Passer une commande avec paiement
1. **Acteur** : Client authentifié
2. **Pré-condition** : Le client a des articles dans son panier.
3. **Scénario nominal** :
   - Le client accède à la page Panier et clique sur "Commander".
   - Il sélectionne l'option "Livraison" ou "Sur place" et valide.
   - Il procède au paiement via le module Stripe (saisie de la CB factice de test).
   - Le paiement est validé.
   - Le système enregistre la commande avec le statut "En attente" et génère un numéro de facture unique.
   - Le client est redirigé vers son compte avec la confirmation.

### Cas d'utilisation 2 : Réserver une table
1. **Acteur** : Client authentifié
2. **Pré-condition** : Le client souhaite manger sur place.
3. **Scénario nominal** :
   - Le client accède à la page "Réservation".
   - Il interagit avec le plan de salle ou choisit une date/heure.
   - Le système interroge l'API pour lister les tables disponibles.
   - Le client choisit une table et valide.
   - Le système enregistre la réservation.

### Cas d'utilisation 3 : Gestion d'un employé par le Super Admin
1. **Acteur** : Super Administrateur
2. **Pré-condition** : Le super admin est connecté.
3. **Scénario nominal** :
   - Il se rend sur l'onglet "Gestion Employés".
   - Il clique sur "Créer un employé", renseigne l'email et valide.
   - Le système génère un mot de passe temporaire et crée le compte avec les droits `is_staff`.
   - L'employé peut se connecter et changer son mot de passe.

## 4. Contraintes et exigences non fonctionnelles

**Performance et Évolutivité :**
- **Architecture Modulaire** : Frontend React et Backend Django découplés.
- **Déploiement** : Utilisation de Docker pour la conteneurisation et Vercel/Railway pour un hébergement scalable.

**Sécurité :**
- **Authentification Stateless** : Utilisation de JWT.
- **Paiement** : Sécurisé par Stripe (aucune donnée de carte bancaire ne transite ou n'est stockée sur nos serveurs).
- **Rôles stricts** : Contrôle d'accès par décorateurs côté API pour séparer Client, Staff, et SuperAdmin.

**Accessibilité et Ergonomie :**
- **Mobile First** : Développé avec Tailwind CSS.
- **Expérience Utilisateur** : Interface réactive sans rechargement de page (Vite + React).
