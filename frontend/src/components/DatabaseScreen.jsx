import React, {useRef} from 'react';

/**
 * L'écran de gestion de la base de données, accessible depuis la carte du monde.
 * Il permet d'exporter et d'importer les collections "media" et "questions" au format JSON, ainsi que de faire des sauvegardes/restaurations complètes au format BSON.
 * C'est aussi ici que l'utilisateur peut réinitialiser sa progression (XP et niveaux débloqués).
 * @param onResetProgress fonction à appeler pour réinitialiser la progression de l'utilisateur (XP et niveaux débloqués)
 * @returns {Element} Un écran complet avec des sections pour expliquer les schémas de la base, gérer les import/export JSON et BSON, et réinitialiser la progression de l'utilisateur.
 * @constructor le composant React pour l'écran de gestion de la base de données, avec des fonctionnalités d'import/export et de réinitialisation de la progression
 *
 * @author Nolann LESCOP
 * @version 1.0
 */
export default function DatabaseScreen({onResetProgress}) {
    // Référence pour cacher l'input de fichier (Import JSON)
    const fileInputRef = useRef(null);
    const targetCollectionRef = useRef(null); // Mémorise si on importe 'media' ou 'questions'

    // --- 1. EXPORT JSON (Dynamique) ---
    const handleExportJSON = async (collection) => {
        alert(`Exportation JSON de '${collection}' en cours...`);
        try {
            const res = await fetch(`http://localhost:5000/api/export/json/${collection}`);
            const data = await res.json();
            alert(data.message || data.error);
        } catch (e) {
            console.log(e)
            alert("Erreur de connexion au serveur.");
        }
    };

    // --- 2. IMPORT JSON (Étape A : Clic sur le bouton) ---
    const triggerImport = (collection) => {
        targetCollectionRef.current = collection; // On retient le choix
        fileInputRef.current.click(); // On ouvre l'explorateur Windows/Mac
    };

    // --- 2. IMPORT JSON (Étape B : Fichier sélectionné) ---
    const handleImportJSON = async (event) => {
        const file = event.target.files[0];
        const collection = targetCollectionRef.current; // On récupère le choix
        if (!file || !collection) return;

        if(!window.confirm(`Tu vas écraser la collection '${collection}' avec "${file.name}". Continuer ?`)) {
            event.target.value = null;
            return;
        }

        alert(`Upload et importation dans '${collection}' en cours...`);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`http://localhost:5000/api/import/json/${collection}`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            alert(data.message || data.error);
        } catch (e) {
            console.log(e);
            alert("Erreur lors de l'upload du fichier.");
        } finally {
            event.target.value = null; // On vide l'input
            targetCollectionRef.current = null; // On réinitialise la cible
        }
    };

    // --- 3. BACKUP BSON ---
    const handleBackupBSON = async () => {
        alert("Sauvegarde BSON en cours...");
        try {
            const res = await fetch('http://localhost:5000/api/backup/bson');
            const data = await res.json();
            alert(data.message || data.error);
        } catch (e) {
            console.error(e);
            alert("Erreur de connexion au serveur.");
        }
    };

    // --- 4. RESTORE BSON ---
    const handleRestoreBSON = async () => {
        if(!window.confirm("Attention : Cela va écraser toute la base Mongolingo avec la dernière sauvegarde. Continuer ?")) return;
        alert("Restauration BSON en cours...");
        try {
            const res = await fetch('http://localhost:5000/api/restore/bson', { method: 'POST' });
            const data = await res.json();
            alert(data.message || data.error);
        } catch (e) {
            console.error(e);
            alert("Erreur de connexion au serveur.");
        }
    };

    return (
        <div className="p-10 max-w-6xl mx-auto text-slate-200">

            <div className="mb-10 border-b border-slate-700 pb-6">
                <h1 className="text-4xl font-extrabold text-white mb-2">Gestion de la Base</h1>
                <p className="text-slate-400">Consulte l'architecture des collections et gère tes sauvegardes.</p>
            </div>

            {/* ================= EXPLICATION DES SCHÉMAS ================= */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
                    Architecture des Collections
                </h2>

                {/* items-stretch permet aux deux colonnes d'avoir exactement la même hauteur */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

                    {/* Explication Collection Media */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-4">Collection <span className="text-blue-400">"media"</span></h3>

                        {/* flex-grow pousse le bloc de code tout en bas si le texte est court */}
                        <div className="text-sm text-slate-400 mb-6 leading-relaxed space-y-3 flex-grow">
                            <p>
                                Cette collection stocke le catalogue de films et séries. Elle est protégée par un <strong>$jsonSchema</strong> très détaillé :
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Bases obligatoires :</strong> Les champs <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">title</code>, <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">year</code>, <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">type</code> ("Movie" ou "Series") et <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">director</code> ne peuvent pas être omis.</li>
                                <li><strong>Champs numériques :</strong> L'année, la note (<code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">rating</code>, de 0 à 10) et la durée (<code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">duration_min</code>) utilisent le type BSON générique <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">number</code> pour éviter les erreurs de typage avec JavaScript.</li>
                                <li><strong>Tableaux (Arrays) :</strong> Les <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">genres</code> (textes simples), le <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">cast</code> (objets avec acteur et rôle), et les <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">seasons</code> (objets avec numéro et épisodes).</li>
                                <li><strong>Sous-documents :</strong> Les récompenses (<code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">awards</code>) détaillent les victoires et nominations, et la disponibilité (<code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">availability</code>) utilise des booléens.</li>
                            </ul>
                        </div>

                        {/* h-96 force la hauteur du bloc de code. Le scroll s'activera automatiquement si le code est plus long. */}
                        <div className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-green-300 overflow-y-auto custom-scrollbar h-96 border border-slate-700/50 shadow-inner">
                <pre>
{`{
  bsonType: "object",
  required: ["title", "year", "type", "director"],
  properties: {
    title: { bsonType: "string" },
    year: { bsonType: "number", minimum: 1900 },
    type: { enum: ["Movie", "Series"] },
    genres: { bsonType: "array", items: { bsonType: "string" } },
    director: { bsonType: "string" },
    rating: { bsonType: "number", minimum: 0, maximum: 10 },
    cast: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: { actor: { bsonType: "string" }, role: { bsonType: "string" } }
      }
    },
    awards: { 
      bsonType: "object", 
      properties: { wins: { bsonType: "number" }, nominations: { bsonType: "number" } } 
    },
    duration_min: { bsonType: "number" },
    seasons: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: { number: { bsonType: "number" }, episodes: { bsonType: "number" } }
      }
    },
    availability: {
      bsonType: "object",
      properties: { netflix: { bsonType: "bool" }, prime: { bsonType: "bool" }, disney: { bsonType: "bool" } }
    }
  }
}`}
                </pre>
                        </div>
                    </div>

                    {/* Explication Collection Questions */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-4">Collection <span className="text-purple-400">"questions"</span></h3>

                        <div className="text-sm text-slate-400 mb-6 leading-relaxed space-y-3 flex-grow">
                            <p>
                                Cette collection est le "moteur interactif" de Mongolingo. Elle configure l'UI React et pilote l'exécution du serveur :
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Cœur pédagogique :</strong> Les champs <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300">id</code>, <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300">instruction</code>, <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300">correctAnswer</code> et les retours <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300">explanation_*</code> sont obligatoires pour garantir que chaque question possède un retour détaillé.</li>
                                <li><strong>Logique d'affichage :</strong> Le champ <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300">level</code> gère la difficulté (dont "Expert"). Le <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300">type_question</code> bascule l'interface entre QCM et Terminal. Le tableau <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300">choices</code> est limité à 4 éléments maximum (mais optionnel).</li>
                                <li><strong>Exécution Backend :</strong> Les métadonnées <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300">operation</code> (find, insert, delete, aggregate...) et <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300">target_collection</code> indiquent au serveur Node.js la méthode exacte à lancer sur MongoDB.</li>
                            </ul>
                        </div>

                        {/* Même hauteur (h-96) pour un alignement parfait avec le bloc de gauche */}
                        <div className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-green-300 overflow-y-auto custom-scrollbar h-96 border border-slate-700/50 shadow-inner">
                <pre>
{`{
  bsonType: "object",
  required: ["id", "level", "instruction", "correctAnswer", "explanation_success", "explanation_error"],
  properties: {
    id: { bsonType: "number" },
    level: { enum: ["Facile", "Moyen", "Difficile", "Expert"] },
    type_question: { enum: ["qcm", "text"] },
    operation: { enum: ["find", "insert", "update", "delete", "aggregate"] },
    target_collection: { bsonType: "string" },
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
}`}
                </pre>
                        </div>
                    </div>

                </div>
            </section>

            {/* ================= IMPORT / EXPORT (JSON & BSON) ================= */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-3">
                    Sauvegardes & Chargements
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Colonne EXPORT */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Exporter (JSON)</h3>
                        <div className="flex flex-col gap-3 mb-6">
                            <button onClick={() => handleExportJSON('media')} className="flex items-center justify-between px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition group text-left">
                                <div>
                                    <div className="font-bold text-white group-hover:text-emerald-400 transition">Export Films/Séries</div>
                                    <div className="text-xs text-slate-400">Collection 'media'</div>
                                </div>
                                <span className="text-xl">🎬</span>
                            </button>

                            <button onClick={() => handleExportJSON('questions')} className="flex items-center justify-between px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition group text-left">
                                <div>
                                    <div className="font-bold text-white group-hover:text-emerald-400 transition">Export Questions</div>
                                    <div className="text-xs text-slate-400">Collection 'questions'</div>
                                </div>
                                <span className="text-xl">📝</span>
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Sauvegarde (BSON)</h3>
                        <button onClick={handleBackupBSON} className="flex items-center justify-between px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition group w-full text-left">
                            <div>
                                <div className="font-bold text-white group-hover:text-blue-400 transition">Backup BSON</div>
                                <div className="text-xs text-slate-400">Copie complète (mongodump)</div>
                            </div>
                            <span className="text-xl">📦</span>
                        </button>
                    </div>

                    {/* Colonne IMPORT */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Importer (JSON)</h3>
                        <div className="flex flex-col gap-3 mb-6">

                            {/* L'input unique qui sert pour les deux boutons */}
                            <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImportJSON} />

                            <button onClick={() => triggerImport('media')} className="flex items-center justify-between px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition group text-left">
                                <div>
                                    <div className="font-bold text-white group-hover:text-emerald-400 transition">Import Films/Séries</div>
                                    <div className="text-xs text-slate-400">Écrase 'media'</div>
                                </div>
                                <span className="text-xl">🎬</span>
                            </button>

                            <button onClick={() => triggerImport('questions')} className="flex items-center justify-between px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition group text-left">
                                <div>
                                    <div className="font-bold text-white group-hover:text-emerald-400 transition">Import Questions</div>
                                    <div className="text-xs text-slate-400">Écrase 'questions'</div>
                                </div>
                                <span className="text-xl">📝</span>
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Restauration (BSON)</h3>
                        <button onClick={handleRestoreBSON} className="flex items-center justify-between px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition group w-full text-left">
                            <div>
                                <div className="font-bold text-white group-hover:text-blue-400 transition">Restauration BSON</div>
                                <div className="text-xs text-slate-400">Restaure tout (mongorestore)</div>
                            </div>
                            <span className="text-xl">🔄</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ================= RÉINITIALISATION DE LA PROGRESSION (SUPPRIMER TOUTES LES DONNÉES DE L'UTILISATEUR) ================= */}
            <section>
                <div className="flex items-center justify-center">
                    {/* Zone de réinitialisation de la progression */}
                    <div className="flex flex-col bg-red-900/20 border-2 border-red-900/50 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                            Réinitialiser ma progression
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Cette action effacera définitivement tes points d'XP et reverrouillera tous les niveaux que tu as débloqués sur cet appareil.
                        </p>
                        <button
                            onClick={onResetProgress}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all">
                            Réinitialiser ma progression
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}