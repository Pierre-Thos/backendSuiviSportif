Notre application est dédiée au suivi sportif indivduel. Elle permet aux utilisateurs d’enregistrer, consulter et analyser leurs séances d’entraînement de manière simple et centralisée.
Développé avec Node.js, Express et MongoDB Atlas, le projet met l’accent sur la performance, la sécurité et l’évolution future.

# Exemples d’appels API – Backend Suivi Sportif


## 1. Récupérer tous les utilisateurs

### Requête
```bash
curl http://localhost:3000/user
```
### Réponse: Code 200 OK

```json
[
  {
    "_id": "665f1a9e3b9d2c0012ab1234",
    "nom": "Dupont",
    "prenom": "Jean",
    "age": 25
  },
  {
    "_id": "875f1a9e3basdc0012ab1234",
    "nom": "Martin",
    "prenom": "Sophie",
    "age": 22
  },
  {
    "_id": "45345g9e3b9d2c34625b1244",
    "nom": "Bernard",
    "prenom": "Stephane",
    "age": 45
  }
]
```

## 2. Créer un utilisateur

### Requête

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Martin",
    "prenom": "Alice",
    "age": 22
  }'
```

### Réponse: Code 201 Created

```json
{
  "_id": "665f1b1a3b9d2c0012ab5678",
  "nom": "Martin",
  "prenom": "Alice",
  "age": 22
}
```

## 3. Récupérer une séance par identifiant

### Requête

```bash
curl http://localhost:3000/seance/665f1c2b3b9d2c0012ab9012
```

### Réponse: Code 200 OK

```json
{
  "_id": "665f1c2b3b9d2c0012ab9012",
  "titre": "Séance Push",
  "date": "2024-02-10",
  "userId": "user1",
  "difficulte": "Intermédiaire",
  "duree_totale": 60,
  "exercices": [
    {
      "nom": "Développé couché barre",
      "reps": 8,
      "series": 4,
      "charge": 80
    }
  ]
}
```

## 4. Importer un fichier JSON vers Atlas

### Requête

```bash
curl -X POST http://localhost:3000/import/json \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "sessions.json",
    "collectionName": "seance"
  }'
```

### Réponse: Code 200 OK

```json
{
  "message": "Import JSON vers Atlas réussi",
  "inserted": 4,
  "collection": "seance"
}
```