import React from 'react';

/**
 * Composant qui s'affichera en plein écran ou en pop-up par-dessus le quiz quand on clique sur le bouton expliquer
 * @param isCorrect indique si la réponse de l'utilisateur était correcte ou non, pour afficher l'explication correspondante
 * @param instruction la consigne de la question (ex: "Trouve tous les films") à afficher dans la modal pour rappeler à l'utilisateur quelle était la question posée
 * @param userAnswer la réponse de l'utilisateur à afficher dans la modal pour lui rappeler ce qu'il a répondu et faire le lien avec l'explication du professeur
 * @param explanationSuccess l'explication à afficher si la réponse de l'utilisateur était correcte, pour lui expliquer pourquoi sa réponse est bonne et renforcer ses connaissances
 * @param explanationError l'explication à afficher si la réponse de l'utilisateur était incorrecte, pour lui expliquer pourquoi sa réponse est fausse et lui donner des indices pour trouver la bonne réponse
 * @param onClose fonction à appeler quand l'utilisateur clique sur le bouton pour fermer la modal, pour revenir au quiz et passer à la question suivante
 * @returns {Element} Un composant React pour afficher une modal d'explication du professeur après la vérification de la réponse de l'utilisateur, avec des styles et du contenu conditionnels selon que la réponse était correcte ou non
 * @constructor le composant React pour afficher une modal d'explication du professeur après la vérification de la réponse de l'utilisateur, avec des styles et du contenu conditionnels selon que la réponse était correcte ou non
 *
 * @author Nolann LESCOP
 * @version 1.0
 */
export default function ExplanationModal({ isCorrect, instruction, userAnswer, explanationSuccess, explanationError, onClose }) {
    return (
        <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            {/* La carte centrale avec l'explication du professeur */ }
            <div className="bg-slate-800 border-2 border-slate-600 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative">

                <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
                    <span>🎓</span> Leçon du professeur
                </h3>

                {/* La consigne de la question (ex: "Trouve tous les films") */ }
                <div className="bg-slate-900 p-4 rounded-xl mb-6 border border-slate-700">
                    <p className="text-slate-400 text-sm mb-2">Ta mission était :</p>
                    <p className="font-bold text-white">{instruction}</p>
                </div>

                {/* La réponse de l'utilisateur */ }
                <div className="bg-slate-900 p-4 rounded-xl mb-6 border border-slate-700">
                    <p className="text-slate-400 text-sm mb-2">Ta réponse était :</p>
                    <p className="font-bold text-white">{userAnswer}</p>
                </div>

                {/* L'explication du professeur, qui change selon que la réponse était bonne ou mauvaise */ }
                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                    {isCorrect ? explanationSuccess : explanationError}
                </p>

                {/* Le bouton pour fermer la modal et revenir au quiz */ }
                <button
                    onClick={onClose}
                    className="w-full bg-blue-500 hover:bg-blue-400 text-white border-b-4 border-blue-700 font-bold py-4 rounded-xl active:border-b-0 active:translate-y-1 transition-all">
                    J'ai compris !
                </button>
            </div>
        </div>
    );
}