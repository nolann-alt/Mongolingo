# Mongolingo - Apprendre MongoDB en s'amusant
**Nom** : LESCOP  
**Prénom** : Nolann  
**Groupe** : 2C1

**Mongolingo** est une plateforme éducative interactive inspirée de Duolingo. Elle permet d'apprendre et de pratiquer le langage de requête NoSQL **MongoDB** à travers des défis progressifs.

## Objectifs du projet
- Proposer un parcours d'apprentissage de **39 requêtes réelles**.
- Exécuter du code en direct sur une base de données locale.
- Sécuriser et structurer les données via des **$jsonSchema** rigoureux.
- Offrir des outils d'administration (Import/Export/Backup).

## ⚠️ CONFIGURATION IMPORTANTE (Scripts d'administration)

Pour que les fonctions d'Import/Export JSON et les Backups BSON fonctionnent sur votre machine, vous devez configurer le chemin vers vos exécutables MongoDB (mongodump, mongoimport, etc.) :

1. Ouvrez le fichier `backend/server.js`.
2. À la ligne **117**, modifiez la variable `MONGO_BIN_DIR` :
```javascript
// Remplacez par le chemin vers le dossier /bin de vos MongoDB Database Tools
const MONGO_BIN_DIR = "/votre/chemin/vers/mongodb-database-tools/bin";
```

## Lancement Rapide de Mongolingo
Ensuite il faut lancer votre base de données MongoDB (mongod) et votre shell MongoDB (mongosh) dans des terminaux séparés.
Pour cela rendez-vous dans le dossier `mongo/bin` et lancez mongod avec le chemin vers votre dossier de données (mongodata) :
```bash
./mongod --dbpath "/chemin/vers/votre/mongodata"
```
Pour ma part j'ai utilisé :
```bash
./mongod --dbpath "/home/lescop/Documents/Info/BUT/BUT_2/Semestre 4/R4.03 NoSQL/R403MONGO/mongodata"
```
Ensuite dans un autre terminal, lancez mongosh en vous rendant dans le dossier `mongosh/bin` :
```bash
./mongosh
```
Il faut importer les schémas de la base de données MongoDB (collections `media` et `questions`) avant de lancer le backend, pour cela copiez-collez les commandes de création de schémas dans votre terminal mongosh présente dans le dossier `schemas` du projet.

Vous pouvez aussi utiliser la backup BSON dans le dossier `backup` pour restaurer la base de données avec les schémas et les données déjà en place, pour cela rendez-vous dans la partie Sauvegardes & Changements dans l'onglet Base de Données du USER PANEL et selectionner Restauration BSON **après avoir lancer le serveur et l'application**.

Installation des dépendances du projet : 
1. On installe les dépendances du backend
```bash
cd backend
npm install
```

2. On installe les dépendances du frontend
```bash
cd ../frontend
npm install
```

3. On revient à la racine
```bash
cd ..
npm install
```

Pour lancer le backend et le frontend simultanément avec une seule commande :  
À la racine du projet (grâce au package.json et au plugin concurrently) :
```bash
npm run dev
```
Vous pourrez ensuite utiliser l'application en vous rendant à l'adresse `http://localhost:5173/` dans votre navigateur et effectuer la restauration BSON.
## Les commandes utilisés pour le fonctionnement du projet
### Installation de react dans le dossier frontend
```bash
cd frontend
npx create-react-app .
```
### Installation de react avec vite dans le dossier frontend
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Installation de node dans le dossier backend
```bash
cd backend
npm init -y
npm install express cors dotenv
```

### Relier le frontend et le backend
Installation d'un client HTTP pour faire des requêtes depuis le frontend vers le backend
```bash
cd frontend
npm install axios
```

### Installation de tailwindcss
```bash
npm install @tailwindcss/postcss
```

### Lancer la bdd MongoDB dans le dossier mongo/bin avec le chemin vers le dossier mongodata
```bash
./mongod --dbpath "/home/lescop/Documents/Info/BUT/BUT_2/Semestre 4/R4.03 NoSQL/R403MONGO/mongodata"
```

### Lancer mongosh dans le dossier mongosh/bin
```bash
./mongosh
```

### Lancer le backend
```bash
cd backend
node server.js
```

### Gérer l'import json (dans le dossier backend)
```bash
npm install multer
```

### Créer les schémas pour la bdd MongoDB dans mongosh
```bash
use Mongolingo
db.createCollection("media", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["title", "year", "type", "director"],
            properties: {
                title: { bsonType: "string", description: "Le titre est requis et doit être une chaîne" },
                year: { bsonType: "number", minimum: 1900, description: "L'année est requise (nombre)" },
                type: { enum: ["Movie", "Series"], description: "Doit être 'Movie' ou 'Series'" },
                genres: { bsonType: "array", items: { bsonType: "string" } },
                director: { bsonType: "string" },
                rating: { bsonType: "number", minimum: 0, maximum: 10 },
                cast: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            actor: { bsonType: "string" },
                            role: { bsonType: "string" }
                        }
                    }
                },
                awards: {
                    bsonType: "object",
                    properties: {
                        wins: { bsonType: "number" },
                        nominations: { bsonType: "number" }
                    }
                },
                duration_min: { bsonType: "number", description: "Durée en minutes" },
                seasons: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            number: { bsonType: "number" },
                            episodes: { bsonType: "number" }
                        }
                    }
                },
                availability: {
                    bsonType: "object",
                    properties: {
                        netflix: { bsonType: "bool" },
                        prime: { bsonType: "bool" },
                        disney: { bsonType: "bool" }
                    }
                }
            }
        }
    }
});
```
```bash
db.createCollection("questions", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["id", "level", "instruction", "correctAnswer", "explanation_success", "explanation_error"],
            properties: {
                id: { bsonType: "number" },
                level: { enum: ["Facile", "Moyen", "Difficile", "Expert"] },
                type_question: {
                    enum: ["qcm", "text"],
                    description: "Mode d'affichage (boutons ou terminal)"
                },
                operation: {
                    enum: ["find", "insert", "update", "delete", "aggregate"],
                    description: "L'action CRUD réelle à lancer sur la base"
                },
                target_collection: {
                    bsonType: "string",
                    description: "La collection visée par la requête, ex: 'media'"
                },
                instruction: { bsonType: "string" },
                choices: {
                    bsonType: "array",
                    maxItems: 4,
                    items: { bsonType: "string" }
                },
                correctAnswer: { bsonType: "string" },
                explanation_success: { bsonType: "string" },
                explanation_error: { bsonType: "string" }
            }
        }
    }
});
```

### Importer les données dans la bdd MongoDB dans un autre terminal à la racine du projet
```bash
mongoimport --db Mongolingo --collection media --file ./data_demo/media_db.json --jsonArray
```

### Réimporter les données dans la bdd MongoDB
```bash
mongoimport --db Mongolingo --collection questions --file ./data_demo/questions_db.json --jsonArray
```

## Sécurité et Validation des Données
Le projet utilise la puissance du moteur de validation natif de MongoDB :

- **Typage Strict :** Utilisation de `bsonType: "number"` pour harmoniser les échanges entre JavaScript (flottants) et MongoDB (entiers).
- **Contraintes métier :** Les films doivent dater d'après 1900, les notes sont bornées entre 0 et 10, et le champ `type` est limité par une énumération (`Movie` / `Series`).
- **Structure de Quiz :** La collection `questions` garantit la présence des explications pédagogiques (`explanation_success/error`) pour chaque défi.

## Fonctionnalités Clés
1. **Mode Quiz Progressif :** - Niveaux Facile/Moyen : Questions de type QCM.
    - Niveaux Difficile/Expert : Mode **Terminal** avec saisie libre de requêtes.
2. **Exécution en conditions réelles :** Les requêtes saisies par l'utilisateur sont envoyées au backend (`exec`) et testées directement sur la collection `media`.
3. **Pédagogie active :** Chaque réponse, juste ou fausse, déclenche une explication technique détaillée.
4. **Dashboard d'Administration :**
    - **Backup BSON (mongodump/mongorestore) :** Sauvegarde complète de la structure (schémas inclus) et des données.
    - **Import/Export JSON (mongoexport/mongoimport) :** Gestion des collections via l'explorateur de fichiers.
    - **Protection du Schéma :** L'importation JSON nettoie la collection (`deleteMany`) sans détruire le validateur (schéma) existant.

## Vidéo de démonstration du projet :
[![Mongolingo](https://img.youtube.com/vi/cdZKjIZXkQw/0.jpg)](https://www.youtube.com/watch?v=cdZKjIZXkQw)