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


# Instructions d'installation
## Ce projet nécessite l'installation de Node.js et un accès à une base de données MongoDB.

## A. Installation de Node.js

L'API nécessite Node.js (version 18.x ou supérieure recommandée).

### 1. Téléchargement

#### Windows & macOS : Rendez-vous sur nodejs.org et téléchargez la version LTS (Long Term Support). Lancez l'installateur et suivez les instructions par défaut.

#### Linux (Ubuntu/Debian) :

```Bash
sudo apt update
sudo apt install nodejs npm
```
### 2. Vérification

#### Une fois installé, ouvrez un terminal et vérifiez les versions :

```Bash
node -v
npm -v
B. Installation et Configuration du Projet
```

## B. Installation et Configuration du Projet

### 1. Cloner le projet

#### Récupérez les fichiers depuis le dépôt distant :

```Bash
git clone <URL_DE_VOTRE_DEPOT_GITHUB>
cd <NOM_DU_DOSSIER_PROJET>
```

### 2. Installer les dépendances

#### Utilisez NPM pour installer Express, Mongoose, ValidatorJS et les autres bibliothèques nécessaires :

```Bash
npm install
```

### 3. Configuration des variables d'environnement

#### Le projet utilise un fichier .env pour sécuriser les accès. Créez un fichier nommé .env à la racine du projet :

#### Extrait de code
PORT=3000
MONGODB_URI=mongodb+srv://<votre_utilisateur>:<votre_mot_de_passe>@cluster.mongodb.net/suivi-sportif
#### 

### 4. Import initial des données (Data Seed)

#### Pour peupler votre base de données avec le catalogue d'exercices par défaut (fichier JSON dans /data) :

Lancez le projet (voir étape suivante).


Utilisez un outil comme Postman pour appeler la route d'importation : POST http://localhost:3000/api/exercises/import
#### 

### C. Lancement de l'application

#### Pour démarrer le serveur en mode développement ou production :

#### Mode Standard :

```Bash
npm start
```

#### Mode Développement (avec redémarrage automatique via Nodemon) :

```Bash
npm run dev
```
#### L'API sera accessible par défaut à l'adresse : http://localhost:3000
