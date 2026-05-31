import React from 'react';

/**
 * Le bandeau qui apparaît lorsque l'utilisateur verfie sa réponse
 * @param isCorrect indique si la réponse de l'utilisateur était correcte ou non, pour afficher un message et des styles différents
 * @param onExplain fonction à appeler quand l'utilisateur clique sur le bouton "Expliquer la réponse", pour afficher la modal d'explication du professeur
 * @param onNext fonction à appeler quand l'utilisateur clique sur le bouton "CONTINUER", pour passer à la question suivante du quiz
 * @param onRequestResult fonction à appeler quand l'utilisateur clique sur le bouton "Afficher ma requête et le résultat".
 * @returns {Element} Un composant React pour afficher un bandeau de feedback après la vérification de la réponse de l'utilisateur.
 * @constructor
 */
export default function FeedbackBanner({ isCorrect, onExplain, onNext, onRequestResult }) {
    return (
        <div className={`fixed bottom-0 left-0 right-0 p-6 border-t-2 animate-slide-up ${
            isCorrect ? "bg-green-900/90 border-green-700" : "bg-red-900/90 border-red-700"}`}>

            <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Le message de feedback avec une icône ✓ ou ✗ selon la réponse, et le bouton "Expliquer la réponse" pour expliquer la réponse */ }
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-3xl bg-white ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                        {isCorrect ? "✓" : "✗"}
                    </div>
                    <div>
                        <h3 className={`text-2xl font-extrabold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                            {isCorrect ? "Excellent !" : "Presque..."}
                        </h3>
                        {/* Le bouton pour expliquer la réponse */}
                        <button
                            onClick={onExplain}
                            className="text-sm underline mt-1 opacity-80 hovPourquoier:opacity-100 transition">
                            Expliquer la réponse
                        </button>
                        {/* Le bouton pour afficher le résulat de la requête */}
                        <button
                            onClick={onRequestResult}
                            className="text-sm underline mt-1 opacity-80 hovPourquoier:opacity-100 transition md:ml-6">
                            Afficher ma requête et le résultat
                        </button>
                    </div>
                </div>

                {/* Le bouton "CONTINUER" pour passer à la question suivante */ }
                <button
                    onClick={onNext}
                    className={`w-full sm:w-auto px-8 py-4 rounded-xl font-extrabold text-white text-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
                        isCorrect ? "bg-green-500 border-green-700 hover:bg-green-400" : "bg-red-500 border-red-700 hover:bg-red-400"
                    }`}>
                    CONTINUER
                </button>
            </div>
        </div>
    );
}