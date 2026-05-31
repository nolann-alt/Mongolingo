const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path'); // Pour construire des chemins de fichiers de manière portable
const multer = require('multer');
const fs = require('fs');

// Configuration de Multer : on stocke les fichiers uploadés dans un dossier temporaire
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}
const upload = multer({ dest: uploadFolder });

// Initialisation d'Express et des middlewares
const app = express();
app.use(cors());
app.use(express.json());

// Middleware de log pour afficher chaque requête entrante dans la console
app.use((req, res, next) => {
    // horodatage pour savoir quand la requête a été faite
    const heure = new Date().toLocaleTimeString();

    // On affiche la méthode (GET, POST...) et l'URL demandée
    console.log(`[${heure}] Nouvelle requête : ${req.method} ${req.url}`);

    // TRÈS IMPORTANT : on dit à Express de passer à la suite (sinon le serveur reste bloqué ici)
    next();
});

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
const DB_NAME = "Mongolingo";

// Route pour exécuter les requêtes du Quiz en conditions RÉELLES
app.post('/api/execute', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(DB_NAME);

        // On reçoit 3 choses de React :
        // 1. La collection (ex: "media")
        // 2. L'opération (ex: "find", "insert", "delete", "aggregate")
        // 3. La requête en texte brut (ex: '{ "type": "Movie" }')
        const { collection, operation, queryText } = req.body;

        // ÉTAPE A : Convertir le texte en objet JSON lisible par MongoDB
        let queryObj;
        try {
            queryObj = JSON.parse(queryText);
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: "Erreur de syntaxe JSON. Vérifie tes guillemets et tes accolades !"
            });
        }

        const col = db.collection(collection || "media");
        let results;

        // ÉTAPE B : Aiguillage selon le type d'opération avec un switch executant la requête et récupérant le résultat
        switch (operation) {
            case 'find':
                // On exécute un find et on limite à 10 résultats pour ne pas faire exploser l'écran React
                results = await col.find(queryObj).limit(10).toArray();
                break;

            case 'insert':
                const insertRes = await col.insertOne(queryObj);
                results = { message: `Document inséré avec l'ID : ${insertRes.insertedId}` };
                break;

            case 'delete':
                const deleteRes = await col.deleteOne(queryObj);
                results = { message: `${deleteRes.deletedCount} document(s) supprimé(s).` };
                break;

            case 'aggregate':
                // Pour l'agrégation, la requête EST le pipeline (un tableau)
                results = await col.aggregate(queryObj).toArray();
                break;

            default:
                // Par défaut, on fait un find
                results = await col.find(queryObj).limit(10).toArray();
        }

        // On renvoie le résultat réel de la base de données
        res.json({ success: true, data: results });

    } catch (err) {
        // Si MongoDB n'aime pas la requête (ex: opérateur qui n'existe pas)
        res.status(500).json({ success: false, error: err.message });
    }
});

// Route pour récupérer toutes les questions du quiz
app.get('/api/questions', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(DB_NAME);

        // On va chercher toutes les questions dans la collection "questions"
        // Le sort({ id: 1 }) permet de s'assurer qu'elles sont dans le bon ordre (1 à 30)
        const questions = await db.collection('questions').find({}).sort({ id: 1 }).toArray();

        res.json(questions);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(5000, () => console.log("Serveur prêt sur le port 5000"));

// Définition centralisée des chemins
const MONGO_BIN_DIR = "/home/lescop/Documents/Info/BUT/BUT_2/Semestre 4/R4.03 NoSQL/TD2/mongodb-database/bin";

// __dirname est le dossier /backend. Avec '..', on remonte à la racine du projet.
const backupFolder = path.resolve(__dirname, '..', 'backups'); // Le dossier où seront stockées les sauvegardes BSON (mongodump) et les exports JSON (mongoexport)

// SÉCURITÉ : Création du dossier backups s'il n'existe pas
if (!fs.existsSync(backupFolder)) {
    console.log("Création du dossier de sauvegardes :", backupFolder);
    fs.mkdirSync(backupFolder, { recursive: true });
}

// 1. SAUVEGARDE BSON (mongodump) - Ton code original
app.get('/api/backup/bson', (req, res) => {
    const binaryPath = `${MONGO_BIN_DIR}/mongodump`;
    const command = `"${binaryPath}" --db=${DB_NAME} --out="${backupFolder}"`;

    console.log("Exécution de :", command);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erreur d'exécution: ${error.message}`);
            return res.status(500).json({ error: error.message, details: stderr });
        }
        console.log("Sortie mongodump :", stderr || stdout);
        res.json({ message: "Sauvegarde BSON effectuée !", folder: backupFolder, details: stderr });
    });
});

// 2. RESTAURATION BSON (mongorestore)
app.post('/api/restore/bson', (req, res) => {
    const binaryPath = `${MONGO_BIN_DIR}/mongorestore`;
    // mongodump crée un sous-dossier avec le nom de la BDD.
    // Il faut donc dire à mongorestore de pointer vers ce sous-dossier exact.
    const dbBackupPath = path.join(backupFolder, DB_NAME);

    // --drop efface les collections existantes avant de restaurer
    const command = `"${binaryPath}" --db=${DB_NAME} --drop "${dbBackupPath}"`;

    console.log("Exécution de :", command);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erreur d'exécution: ${error.message}`);
            return res.status(500).json({ error: error.message, details: stderr });
        }
        console.log("Sortie mongorestore :", stderr || stdout);
        res.json({ message: "Restauration BSON effectuée avec succès !", details: stderr });
    });
});

// 3. EXPORT JSON DYNAMIQUE (mongoexport)
app.get('/api/export/json/:collection', (req, res) => {
    const collection = req.params.collection;

    // Sécurité : on n'autorise que nos deux collections
    if (!['media', 'questions'].includes(collection)) {
        return res.status(400).json({ success: false, error: "Collection non autorisée." });
    }

    const binaryPath = `${MONGO_BIN_DIR}/mongoexport`;
    // Le nom du fichier généré s'adaptera : media_export.json ou questions_export.json
    const dynamicExportFile = path.resolve(__dirname, '..', 'backups', `${collection}_export.json`);

    const command = `"${binaryPath}" --db=${DB_NAME} --collection=${collection} --out="${dynamicExportFile}" --jsonArray`;

    console.log("Exécution de :", command);

    exec(command, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ success: false, error: error.message, details: stderr });
        res.json({ success: true, message: `Export JSON de '${collection}' réussi !`, file: dynamicExportFile });
    });
});

// 4. IMPORT JSON DYNAMIQUE (via Upload)
app.post('/api/import/json/:collection', upload.single('file'), async (req, res) => {
    const collection = req.params.collection;

    if (!['media', 'questions'].includes(collection)) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, error: "Collection non autorisée." });
    }

    if (!req.file) {
        return res.status(400).json({ success: false, error: "Aucun fichier uploadé." });
    }

    const uploadedFilePath = req.file.path;

    try {
        // On s'assure que la connexion est établie AVANT de faire quoi que ce soit
        await client.connect();
        const db = client.db(DB_NAME);

        // deleteMany({}) supprime tous les documents, mais garde le validateur intact !
        await db.collection(collection).deleteMany({});

        const binaryPath = `${MONGO_BIN_DIR}/mongoimport`;
        // La commande sans le --drop pour éviter de supprimer le schéma de validation.
        const command = `"${binaryPath}" --db=${DB_NAME} --collection=${collection} --file="${uploadedFilePath}" --jsonArray`;

        console.log("Exécution de :", command);

        exec(command, (error, stdout, stderr) => {
            // Nettoyage du fichier temporaire
            if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);

            // mongoimport écrit toujours ses logs dans stderr (même quand tout va bien)
            const logs = stderr || stdout || "";

            // On vérifie s'il y a une erreur d'exécution (ex: problème de syntaxe JSON, fichier mal formé...)
            const hasValidationErrors = logs.includes("Document failed validation");
            // On vérifie si certains documents n'ont pas été importés à cause d'erreurs de validation
            const hasFailedDocuments = logs.includes("failed to import") && !logs.includes("0 document(s) failed to import");
            // On vérifie si le fichier était vide ou si rien n'a marché
            const isCompletelyEmpty = logs.includes("0 document(s) imported successfully");

            // Si l'une des conditions d'erreur est vraie...
            if (error || hasValidationErrors || hasFailedDocuments || isCompletelyEmpty) {
                console.error(`Erreur ou validation échouée :\n`, logs);

                return res.status(400).json({
                    success: false,
                    error: "Échec de l'importation ! Certains documents n'ont pas respecté le schéma (ou le fichier est vide).",
                    details: logs
                });
            }

            // Si on arrive ici, c'est un succès
            res.json({
                success: true,
                message: `Importation JSON dans '${collection}' parfaitement réussie et validée !`
            });
        });

    } catch (err) {
        if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
        res.status(500).json({ success: false, error: "Erreur lors du nettoyage de la collection.", details: err.message });
    }
});