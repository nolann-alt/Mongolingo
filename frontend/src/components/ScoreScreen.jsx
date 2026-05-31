import React from 'react';

/**
 * Le composant pour afficher l'écran de score à la fin d'une leçon, avec un message dynamique selon le score obtenu, et des cartes pour afficher le score et les XP gagnés,
 * ainsi qu'un bouton pour continuer vers la carte.
 * @param score le nombre de réponses correctes de l'utilisateur dans la leçon, pour calculer le pourcentage et afficher un message dynamique
 * @param totalQuestions le nombre total de questions dans la leçon, pour calculer le pourcentage et afficher un message dynamique
 * @param xpEarned le nombre d'XP gagnés par l'utilisateur dans la leçon, pour l'afficher dans la carte de score
 * @param onContinue fonction à appeler quand l'utilisateur clique sur le bouton "CONTINUER", pour revenir à la carte et passer à la leçon suivante
 * @returns {Element} Un composant React pour afficher l'écran de score à la fin d'une leçon, avec un message dynamique selon le score obtenu, et des cartes pour afficher le score et les XP gagnés, ainsi qu'un bouton pour continuer vers la carte.
 * @constructor le composant React pour afficher l'écran de score à la fin d'une leçon, avec un message dynamique selon le score obtenu, et des cartes pour afficher le score et les XP gagnés, ainsi qu'un bouton pour continuer vers la carte.
 *
 * @author Nolann LESCOP
 * @version 1.0
 */
export default function ScoreScreen({ score, totalQuestions, xpEarned, onContinue }) {
    // Calcul du pourcentage pour un message dynamique
    const percentage = (score / totalQuestions) * 100;

    let message = "Leçon terminée !";
    let icon = "🎉";
    let color = "text-yellow-400";

    if (percentage === 100) {
        message = "Parfait ! Sans faute !";
        icon = "🏆";
    } else if (percentage >= 50) {
        message = "Bon travail !";
        icon = "👍";
    } else {
        message = "Accroche-toi, réessaie !";
        icon = "💪";
        color = "text-slate-400";
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in">

            <div className="text-8xl mb-6">
                {icon}
            </div>

            <h1 className={`text-4xl font-extrabold mb-8 ${color}`}>
                {message}
            </h1>

            {/* Les cartes de statistiques */}
            <div className="flex gap-6 mb-12 w-full max-w-md">

                {/* Carte Score */}
                <div className="flex-1 bg-blue-500/20 border-2 border-blue-500 rounded-2xl p-6 flex flex-col items-center">
                    <span className="text-blue-400 font-bold uppercase text-sm mb-2">Total XP</span>
                    <span className="text-blue-400 font-extrabold text-3xl">
                        +{xpEarned}
                    </span>
                </div>

                {/* Carte Précision */}
                <div className="flex-1 bg-green-500/20 border-2 border-green-500 rounded-2xl p-6 flex flex-col items-center">
                    <span className="text-green-400 font-bold uppercase text-sm mb-2">Score</span>
                    <span className="text-green-400 font-extrabold text-3xl">
                        {score} / {totalQuestions}
                    </span>
                </div>

            </div>

            {/* Bouton pour revenir à la carte */}
            <button
                onClick={onContinue}
                className="w-full max-w-md bg-green-500 hover:bg-green-400 text-white border-b-8 border-green-700 active:border-b-0 active:translate-y-2 font-extrabold text-xl py-4 rounded-2xl transition-all"
            >
                CONTINUER
            </button>

        </div>
    );
}