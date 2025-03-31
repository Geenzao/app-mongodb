# Readme

## Explication de l'API

L'aplication est divisé en deux parties : l'API et l'interface web.
L'API peut fonctionner seul mais pas l'interface web.

## Installation

### Backend

Tout d'abord, aller dans le dossier backend :

```bash
cd .\backend
```

Puis lancer la commande `npm install`

### Frontend

Ca va être pareil que dans le backend.
Tout d'abord, aller dans le dossier frontend :

```bash
cd .\frontend
```

Puis lancer la commande `npm install`

## Lancement de l'application

Pour lancer l'API, il suffit d'aller dans le dossier backend comme vu précédement `cd .\backend` puis de lancer la commande `npm start`

Puis si vous souhaitez allez sur l'interface web, il suffit de faire pareil : `cd .\frontend` puis `npm start`

## Fonctionnement de l'API

Tout d'abord, si vous souhaitez utiliser l'API sans interface web, il faudra que que vous ayez un lanceur de requetes comme postman.
Voici les différentes requètes possible :

**Récupérer toutes les tâches**

```bash
GET http://localhost:3000/api/tasks
```

**Récupérer une tâche spécifique**

```bash
GET http://localhost:3000/api/tasks/:id
```

**Filtrer et trier les tâches**

```bash
GET http://localhost:3000/api/tasks
Paramètres :
- statut: string (ex: "en cours")
- priorite: string (ex: "haute")
- categorie: string (ex: "perso")
- sortBy: string (ex: "dateCreation:desc", "dateEcheance:asc")
```

**Créer une tache**

```bash
POST http://localhost:3000/api/tasks
Body:
{
  "titre": "string", // obligatoire
  "description": "string",
  "statut": "string", // enum: ["à faire", "en cours", "terminé", "annulée"]
  "priorite": "string", // enum: ["basse", "moyenne", "haute", "critique"]
  "categorie": "string",
  "etiquettes": ["string"],
  "dateEcheance": "date",
  "auteur": {
    "nom": "string", // obligatoire
    "prenom": "string", // obligatoire
    "email": "string" // obligatoire
  }
}
```

**Modifier une tâche**

```bash
PUT http://localhost:3000/api/tasks/:id
Body:
{
  "titre": "string",
  "description": "string",
  "statut": "string",
  "priorite": "string",
  "categorie": "string",
  "etiquettes": ["string"],
  "dateEcheance": "date"
}
```

**Supprimer une tâche**

```bash
DELETE http://localhost:3000/api/tasks/:id
```

**Ajouter un commentaire à une tâche**

```bash
POST http://localhost:3000/api/tasks/:id/comments
Body:
{
  "contenu": "string", // obligatoire
  "auteur": {
    "nom": "string", // obligatoire
    "prenom": "string", // obligatoire
    "email": "string" // obligatoire
  }
}
```

**Ajouter une sous-tâche**

```bash
POST http://localhost:3000/api/tasks/:id/subtasks
Body:
{
  "titre": "string" // obligatoire
}
```

### Exemples de requêtes

1. Récupérer les tâches en cours triées par date de création (récentes d'abord)

```bash
GET http://localhost:3000/api/tasks?statut=en cours&sortBy=dateCreation:desc
```

2. Créer une nouvelle tâche

```bash
POST http://localhost:3000/api/tasks
Body:
{
  "titre": "Faire les courses",
  "statut": "à faire",
  "priorite": "moyenne",
  "auteur": {
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com"
  }
}
```

3. Modifier une tâche existante

```bash
PUT http://localhost:3000/api/tasks/12345
Body:
{
  "statut": "terminé",
  "priorite": "basse"
}
```

4. Supprimer une tâche

```bash
DELETE http://localhost:3000/api/tasks/12345
```

5. Ajouter un commentaire

```bash
POST http://localhost:3000/api/tasks/12345/comments
Body:
{
  "contenu": "Ceci est un commentaire",
  "auteur": {
    "nom": "Martin",
    "prenom": "Lucie",
    "email": "lucie.martin@example.com"
  }
}
```

6. Ajouter une sous-tâche

```bash
POST http://localhost:3000/api/tasks/12345/subtasks
Body:
{
  "titre": "Acheter du lait"
}
```
