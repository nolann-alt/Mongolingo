import React, {useEffect, useState} from 'react';

// Importation des sous-composants
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';
import FeedbackBanner from './FeedbackBanner';
import ExplanationModal from './ExplanationModal';
import ReturnMongodb from "./ReturnMongodb.jsx";

/**
 * Composant principal du quiz, qui gère la logique de navigation entre les questions, le score, et l'affichage des différents éléments du quiz.
 * @param levelId l'id du niveau sélectionné, qui est utilisé pour charger les questions correspondantes depuis l'API Node.js. C'est une string, mais on la convertit en nombre pour calculer les indices des questions à afficher.
 * @param onBack fonction à appeler quand l'utilisateur clique sur le bouton pour revenir à la carte, pour revenir au MapScreen.jsx
 * @param onFinishQuiz fonction à appeler quand l'utilisateur a terminé toutes les questions du quiz, qui reçoit le score final et le nombre total de questions pour afficher les résultats dans le ScoreScreen.jsx
 * @returns {Element} Un composant React pour afficher le quiz d'un niveau, avec une barre de progression, des questions chargées depuis une API, des choix de réponses, et des bandeaux de feedback avec des modals d'explication et de résultat de requête MongoDB.
 * @constructor le composant React pour afficher le quiz d'un niveau, avec une barre de progression, des questions chargées depuis une API, des choix de réponses, et des bandeaux de feedback avec des modals d'explication et de résultat de requête MongoDB.
 *
 * @author Nolann LESCOP
 * @version 1.0
 */
export default function QuizScreen({ levelId, onBack, onFinishQuiz }) {

    // Chargement des questions depuis l'API Node.js à chaque changement de niveau. On gère aussi les états de chargement et d'erreur.
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // On interroge ton serveur Node.js !
        fetch('http://localhost:5000/api/questions')
            .then(res => {
                if (!res.ok) throw new Error("Erreur serveur");
                return res.json();
            })
            .then(data => {
                const numericLevelId = Number(levelId) || 1;

                let startIdx;
                let endIdx;

                if (numericLevelId < 9) {
                    // Pour les niveaux 1 à 8 (3 questions par niveau)
                    startIdx = (numericLevelId - 1) * 3;
                    endIdx = startIdx + 3;
                } else if (numericLevelId === 9) {
                    // Le niveau 9 est le "Boss" final des QCM, il a 6 questions (Index 24 à 29)
                    startIdx = 24;
                    endIdx = 30;
                } else {
                    // Pour les Niveaux 10, 11 et 12 (Le Mode Terminal)
                    // On ajoute un décalage de +3 car le niveau 9 a consommé 3 questions
                    startIdx = (numericLevelId - 1) * 3 + 3;
                    endIdx = startIdx + 3;
                }

                // On garde seulement les questions calculées
                setQuestions(data.slice(startIdx, endIdx));
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Erreur API :", err);
                setError("Impossible de charger les questions depuis la base de données.");
                setIsLoading(false);
            });
    }, [levelId]);

    // Etats locaux pour gérer la logique du quiz
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showRequestResult, setShowRequestResult] = useState(false);
    const [score, setScore] = useState(0);
    const [dbResult, setDbResult] = useState(null); // permet de stocker le résultat de la requête MongoDB
    const [isExecuting, setIsExecuting] = useState(false); // permet de savoir si on est en train d'exécuter une requête MongoDB

    // Écrans de chargement ou d'erreur
    if (isLoading) return <div className="p-10 text-white font-bold text-xl animate-pulse">Connexion à MongoDB...</div>;
    if (error) return <div className="p-10 text-red-500 font-bold">{error}</div>;
    if (questions.length === 0) return <div className="p-10 text-white">Aucune question trouvée.</div>;

    // Logique pour déterminer la question actuelle, si la réponse est correcte et le pourcentage de progression.
    const currentQuestion = questions[currentIndex];
    const progressPercentage = (currentIndex / questions.length) * 100;

    // Cette fonction enlève tous les espaces, sauts de ligne, et unifie les guillemets
    const normalizeQuery = (str) => {
        if (!str) return "";
        return str.replace(/\s+/g, '').replace(/'/g, '"');
    };

    // On vérifie si la question est un QCM classique ou une saisie de texte
    const isTextInput = currentQuestion.type_question === 'text';

    // On calcule isCorrect différemment selon le mode
    let isCorrect = false;
    if (selectedAnswer) {
        if (isTextInput) {
            // Mode Texte : on compare les requêtes "nettoyées"
            isCorrect = normalizeQuery(selectedAnswer) === normalizeQuery(currentQuestion.correctAnswer);
        } else {
            // Mode QCM : on compare le clic direct
            isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        }
    }

    // fonction pour gérer le clic sur le bouton "VÉRIFIER". Elle vérifie la réponse, met à jour le score et affiche le feedback.
    // elle envoie aussi la requête au backend pour récupérer le résultat réel de MongoDB, qui sera affiché dans le FeedbackBanner.
    const handleCheck = async () => {
        // On ne fait rien si aucune réponse n'est sélectionnée, ou si on est déjà en train d'exécuter une requête (pour éviter les doubles clics)
        if (!selectedAnswer || isChecked) return;

        setIsExecuting(true);

        // On vérifie logiquement si c'est la bonne réponse (pour les XP)
        let isAnswerCorrect = false;
        if (currentQuestion.type_question === 'text') {
            isAnswerCorrect = normalizeQuery(selectedAnswer) === normalizeQuery(currentQuestion.correctAnswer);
        } else {
            isAnswerCorrect = selectedAnswer === currentQuestion.correctAnswer;
        }

        // LE BOUCLIER DE SÉCURITÉ
        // On définit si l'opération est "sans danger" (lecture seule)
        const isSafeOperation = currentQuestion.operation === 'find' || currentQuestion.operation === 'aggregate';

        // On n'envoie à MongoDB QUE si c'est sans danger, OU si la réponse d'écriture est parfaitement juste.
        if (isSafeOperation || isAnswerCorrect) {
            try {
                const response = await fetch('http://localhost:5000/api/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        collection: currentQuestion.target_collection || 'media',
                        operation: currentQuestion.operation || 'find',
                        queryText: selectedAnswer
                    })
                });

                const data = await response.json();
                setDbResult(data);

            } catch (err) {
                console.error("Erreur lors de la requête MongoDB :", err);
                setDbResult({ success: false, error: "Erreur réseau: impossible de joindre MongoDB." });
            }
        } else {
            // C'est un insert/update/delete ET la réponse de l'utilisateur est fausse !
            // On simule une erreur pour ne pas polluer la vraie base de données.
            setDbResult({
                success: false,
                error: "⚠️ Exécution bloquée par sécurité : Ta requête n'est pas celle attendue. Corrige-la pour ne pas altérer la base de données avec de mauvaises informations !"
            });
        }

        // On affiche le bandeau
        setIsExecuting(false);
        setIsChecked(true);

        // On utilise directement la variable isCorrect dynamique pour donner les points
        if (isAnswerCorrect) {
            setScore(score + 1);
        }
    };

    // fonction pour gérer le clic sur le bouton "SUIVANT". Elle passe à la question suivante ou termine le quiz si c'était la dernière question.
    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
            setIsChecked(false);
            setShowExplanation(false);
            setShowExplanation(false);
            setDbResult(null);
        } else {
            // Quiz terminé, on appelle la callback pour remonter le score
            onFinishQuiz(score, questions.length);
        }
    };

    return (
        // Conteneur principal du quiz contenant la barre de progression, la question et les choix, et les bandeaux de feedback.
        <div className="flex flex-col h-screen bg-slate-900 text-slate-200 font-sans relative">

            {/* ================= BARRE DE PROGRESSION EN HAUT ================= */}
            {/* La barre de progression du niveau, qui affiche aussi le bouton "Retour" */}
            <ProgressBar
                progressPercentage={progressPercentage}
                onBack={onBack}
            />

            {/* ================= ZONE CENTRALE (La Question et les Choix) ================= */}
            {/* On appelle le composant pour l'affichage des questions !*/}
            <QuestionCard
                currentQuestion={currentQuestion}
                selectedAnswer={selectedAnswer}
                isChecked={isChecked}
                isCorrect={isCorrect}
                onSelectAnswer={setSelectedAnswer}
            />

            {/* ================= BANDEAUX DU BAS ================= */}
            {/* Si la question a été vérifiée, on affiche le feedback. Sinon, on affiche le bouton "VÉRIFIER" */ }
            {isChecked ? (
                <FeedbackBanner
                    isCorrect={isCorrect}
                    onExplain={() => setShowExplanation(true)}
                    onRequestResult={() => setShowRequestResult(true)}
                    onNext={handleNext}
                />
            ) : (
                /* Bouton VÉRIFIER permettant de gérer la logique du quiz */
                <div className="fixed bottom-0 left-0 right-0 p-6 border-t border-slate-700 bg-slate-900 z-40">
                    <div className="max-w-2xl mx-auto flex justify-end">
                        <button
                            // On désactive le bouton si aucune réponse n'est choisie OU si la requête est en cours
                            disabled={!selectedAnswer || isExecuting}
                            onClick={handleCheck}
                            className={`w-full sm:w-auto px-10 py-4 rounded-xl font-extrabold text-lg transition-all ${
                                // Le bouton s'allume en bleu seulement si on a une réponse ET qu'on n'est pas en train d'exécuter
                                selectedAnswer && !isExecuting
                                    ? "bg-blue-500 text-white border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 hover:bg-blue-400"
                                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                            }`}>
                            {/* On change le texte du bouton pendant l'appel à la base de données */}
                            {isExecuting ? "REQUÊTE EN COURS..." : "VÉRIFIER"}
                        </button>
                    </div>
                </div>
            )}

            {/* ================= MODAL D'EXPLICATION ================= */}
            {/* Si l'utilisateur clique sur "Expliquer la réponse", on affiche une modal avec l'explication de la question. */}
            {showExplanation && (
                <ExplanationModal
                    isCorrect={isCorrect}
                    instruction={currentQuestion.instruction}
                    userAnswer={selectedAnswer}
                    explanationSuccess={currentQuestion.explanation_success}
                    explanationError={currentQuestion.explanation_error}
                    onClose={() => setShowExplanation(false)}
                />
            )}

            {/* ================= MODAL DE RÉSULTAT DE LA REQUÊTE MONGODB ================= */}
            {/* Si l'utilisateur clique sur "Voir le résultat de ma requête", on affiche une modal avec le résultat de la requête MongoDB réelle, qui est stocké dans dbResult. */}
            {showRequestResult && (
                <ReturnMongodb
                    dbResult={dbResult}
                    onClose={() => setShowRequestResult(false)}
                />
            )}

        </div>
    );
}