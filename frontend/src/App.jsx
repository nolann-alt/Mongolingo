import React, { useState, useEffect } from 'react';
import MapScreen from './components/MapScreen';
import DatabaseScreen from './components/DatabaseScreen';
import QuizScreen from "./components/QuizScreen.jsx";
import ScoreScreen from "./components/ScoreScreen.jsx";

/**
 * Le composant principal de l'application qui gère la navigation entre les différentes vues (carte d'apprentissage, base de données, quiz et écran de score) et la progression de l'utilisateur.
 * @returns {Element} Un composant React pour gérer la navigation entre les différentes vues de l'application, la progression de l'utilisateur et le score total en XP.
 * @constructor le composant principal de l'application qui gère la navigation entre les différentes vues (carte d'apprentissage, base de données, quiz et écran de score) et la progression de l'utilisateur.
 *
 * @author Nolann LESCOP
 * @version 1.0
 */
export default function App() {

    // On défini la vue actuelle
    const [currentView, setCurrentView] = useState('LEARN');

    // On garde en mémoire le niveau selectionné pour le quiz
    const [selectedLevel, setSelectedLevel] = useState(null);

    // État pour ouvrir/fermer le menu sur mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // On ajoute un state pour garder l'XP en mémoire
    const [currentXPReward, setCurrentXPReward] = useState(0);

    // Un state pour stocker le résultat du dernier quiz (score et total de questions)
    const [lastQuizResult, setLastQuizResult] = useState(null);

    // ======================= Gestion de la progression et du score utilisateur =======================

    // Initialisation : On lit la mémoire du navigateur au démarrage pour récupérer le score total de l'utilisateur. Si c'est la première fois, on commence à 0.
    const [totalXP, setTotalXP] = useState(() => {
        const savedXP = localStorage.getItem('mongolingo_xp');
        return savedXP ? parseInt(savedXP, 10) : 0; // S'il y a une sauvegarde, on la prend. Sinon 0.
    });

    // Effet pour sauvegarder le score total dans la mémoire du navigateur à chaque fois qu'il change.
    const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(() => {
        const savedLevel = localStorage.getItem('mongolingo_max_level');
        return savedLevel ? parseInt(savedLevel, 10) : 1; // S'il y a une sauvegarde, on la prend. Sinon 1 (radix c'est la base de numération, 10 pour décimal).
    });

    // Effet pour sauvegarder le score total dans la mémoire du navigateur à chaque fois qu'il change.
    useEffect(() => {
        localStorage.setItem('mongolingo_xp', totalXP.toString());
    }, [totalXP]);

    // Effet pour sauvegarder le niveau maximum débloqué dans la mémoire du navigateur à chaque fois qu'il change.
    useEffect(() => {
        localStorage.setItem('mongolingo_max_level', maxUnlockedLevel.toString());
    }, [maxUnlockedLevel]);

    // Fonction pour réinitialiser la progression de l'utilisateur. Elle vide la mémoire du navigateur et remet les variables d'état à zéro.
    const handleResetProgress = () => {
        // Une petite sécurité pour éviter les clics accidentels
        if (window.confirm("Es-tu sûr de vouloir effacer toute ta progression ? Cette action est irréversible.")) {
            // On vide le navigateur
            localStorage.removeItem('mongolingo_xp');
            localStorage.removeItem('mongolingo_max_level');

            // On remet les variables d'état à zéro (la mise à jour visuelle sera instantanée)
            setTotalXP(0);
            setMaxUnlockedLevel(1);

            // On ramène l'utilisateur sur la carte
            setCurrentView('LEARN');
        }
    };

    // ==========================================================================================================

    // Fonction pour démarrer un quiz depuis le MapScreen. Elle reçoit l'id du niveau sélectionné, met à jour l'état et change la vue.
    const handleStartQuiz = (levelId, xpReward) => {
        setSelectedLevel(levelId);
        setCurrentXPReward(xpReward); // On garde l'XP en mémoire pour l'ajouter au score à la fin du quiz
        setCurrentView('QUIZ');
        setIsSidebarOpen(false); // Ferme le menu si on lance un quiz
    };

    // Si la vue actuelle est le quiz, on affiche un écran de quiz.
    if (currentView === 'QUIZ') {
        return (
            <QuizScreen
                levelId={selectedLevel}
                onBack={() => setCurrentView('LEARN')}
                onFinishQuiz={(scoreFinal, totalQuestions) => {

                    const isSuccess = scoreFinal > 0; // Au moins 1 bonne réponse
                    const earnedXP = isSuccess ? currentXPReward : 0;

                    // 1. On met à jour la progression
                    if (isSuccess) {
                        setTotalXP(prevXP => prevXP + earnedXP);
                        // Si l'utilisateur a réussi le quiz et que c'était le niveau maximum débloqué, on débloque le niveau suivant
                        if (selectedLevel === maxUnlockedLevel) {
                            setMaxUnlockedLevel(maxUnlockedLevel => maxUnlockedLevel + 1);
                        }
                    }

                    // 2. On sauvegarde les stats pour le ScoreScreen
                    setLastQuizResult({
                        score: scoreFinal,
                        total: totalQuestions,
                        xp: earnedXP,
                        success: isSuccess
                    });

                    // 3. On change la vue vers l'écran de score
                    setCurrentView('SCORE');
                }}
            />
        );
    }

    // ================= VUE 2 : L'ÉCRAN DE FIN DE NIVEAU =================
    // Si on est sur la vue score et qu'on a un résultat de quiz en mémoire on affiche la vue de fin de niveau
    if (currentView === 'SCORE' && lastQuizResult) {
        return (
            <ScoreScreen
                score={lastQuizResult.score}
                totalQuestions={lastQuizResult.total}
                xpEarned={lastQuizResult.xp}
                isSuccess={lastQuizResult.success}
                onContinue={() => setCurrentView('LEARN')} // Retourne à la carte quand on clique
            />
        );
    }

    return (
        <div className="flex h-screen bg-slate-900 text-white font-sans selection:bg-green-500 overflow-hidden">

            {/* OVERLAY : Le fond noir transparent quand le menu est ouvert sur mobile */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                     onClick={() => setIsSidebarOpen(false)}/>
            )}

            {/* Menu : Modifiée pour être masquée par défaut sur mobile */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 border-r border-slate-700 flex flex-col p-6 shadow-xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}> {/* La classe translate-x-full déplace la sidebar complètement à gauche (hors écran) quand elle est fermée sur mobile. Sur desktop, elle reste toujours visible. *\/}

                {/* Bouton pour fermer (Mobile uniquement) */}
                <button
                    className="lg:hidden absolute top-4 right-4 text-slate-400"
                    onClick={() => setIsSidebarOpen(false)}>
                    ✕
                </button>

                {/* En-tête de la sidebar */}
                <div className="mb-12">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                        Mongolingo
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">User Panel</p>
                </div>

                {/* Menu de navigation dans le User Panel*/}
                <nav className="flex flex-col gap-3 flex-1">
                    {/*Bouton de navigation vers le MapScreen*/}
                    <button
                        onClick={() => { setCurrentView('LEARN'); setIsSidebarOpen(false); }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all
                        ${currentView === 'LEARN' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                        `}>
                        <span>🗺️</span> Parcours
                    </button>

                    {/*Bouton de navigation vers le DatabaseScreen*/}
                    <button
                        onClick={() => { setCurrentView('DATABASE'); setIsSidebarOpen(false); }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all 
                        ${currentView === 'DATABASE' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                        `}>
                        <span>🗄️</span> Base de Données
                    </button>
                </nav>

                {/* Section de profil utilisateur en bas de la sidebar */}
                <div className="pt-6 border-t border-slate-700 mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-xl">🔥</div>
                        <div>
                            <p className="font-bold text-sm text-white">User</p>
                            <p className="text-xs text-green-400">Score: {totalXP} xp</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">

                {/* BARRE HAUTE MOBILE (Visible uniquement sur mobile pour ouvrir le menu) */}
                <header className="lg:hidden bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 bg-slate-700 rounded-lg text-white">
                        ☰
                    </button>
                    <span className="font-bold text-green-400">Mongolingo</span>
                    <div className="w-8"></div> {/* Équilibre visuel */}
                </header>

                {/* Zone de contenu scrollable et changement de vue en fonction du bouton selectionner */}
                <main className="flex-1 overflow-y-auto relative">
                    {currentView === 'LEARN' && <MapScreen onStartLevel={handleStartQuiz} maxUnlockedLevel={maxUnlockedLevel}/>}
                    {currentView === 'DATABASE' && <DatabaseScreen onResetProgress={handleResetProgress}/>}
                </main>
            </div>
        </div>
    );
}