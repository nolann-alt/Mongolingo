// La barre de progression verte en haut de l'écran.
import React from 'react';

/**
 *  La bar de progression pour chaque réponse du quizz
 * @param progressPercentage le pourcentage de progression à afficher (de 0 à 100), qui détermine la largeur de la barre verte
 * @param onBack fonction à appeler quand l'utilisateur clique sur le bouton pour revenir à la carte, pour revenir au MapScreen.jsx
 * @returns {Element} Un composant React pour afficher une barre de progression en haut de l'écran, avec un bouton pour revenir à la carte et une barre verte qui grandit selon le pourcentage de progression
 * @constructor le composant React pour afficher une barre de progression en haut de l'écran, avec un bouton pour revenir à la carte et une barre verte qui grandit selon le pourcentage de progression
 *
 * @author Nolann LESCOP
 * @version 1.0
 */
export default function ProgressBar({ progressPercentage, onBack }) {
    return (
        <div className="flex items-center p-4 max-w-2xl mx-auto w-full gap-4">

            {/* Le bouton pour revenir à la carte */ }
            <button
                onClick={onBack}
                className="text-slate-400 hover:text-white text-2xl font-bold px-2">
                ✕
            </button>

            {/* La barre de progression avec un fond sombre et une barre verte qui grandit selon le pourcentage de progression */ }
            <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden relative">
                {/* La taille de la barre verte est définie par le pourcentage de progression, et elle grandit avec une transition fluide */ }
                <div
                    className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}>
                </div>

                {/* Le petit reflet brillant sur la barre de progression (Tah Duolingo) */}
                <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full"></div>
            </div>

        </div>
    );
}