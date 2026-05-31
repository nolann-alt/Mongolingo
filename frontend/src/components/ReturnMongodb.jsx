import React from 'react';

/**
 * Composant qui s'affichera en plein écran ou en pop-up par-dessus le quiz quand on clique sur le bouton expliquer
 * @param dbResult le résultat de la requête MongoDB à afficher dans la modal.
 * @param onClose fonction à appeler quand l'utilisateur clique sur le bouton pour fermer la modal, pour revenir au quiz et passer à la question suivante
 * @returns {Element} Un composant React pour afficher une modal avec le résultat de la requête MongoDB après que l'utilisateur ait cliqué sur le bouton pour afficher sa requête et le résultat, avec des styles pour rendre le résultat lisible et un bouton pour fermer la modal
 * @constructor le composant React pour afficher une modal avec le résultat de la requête MongoDB après que l'utilisateur ait cliqué sur le bouton pour afficher sa requête et le résultat, avec des styles pour rendre le résultat lisible et un bouton pour fermer la modal
 *
 * @author Nolann LESCOP
 * @version 1.0
 */
export default function ReturnMongodb({dbResult, onClose}) {
    return (
        <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            {/* La carte centrale avec l'explication du professeur */ }
            <div className="bg-slate-800 border-2 border-slate-600 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative">

                <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
                    Ma requête MongoDB :
                </h3>

                {/* La consigne de la question (ex: "Trouve tous les films") */ }
                <div className="bg-slate-900 p-4 rounded-xl mb-6 border border-slate-700">
                    {/* La zone d'affichage du résultat de la requête MongoDB, qui n'apparaît que si dbResult existe (c'est à dire après la vérification de la réponse) */ }
                    {dbResult && (
                        <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-700/50 max-h-32 sm:max-h-48 overflow-y-auto w-full font-mono text-sm shadow-inner custom-scrollbar">
                        <span className="text-slate-400 text-xs font-bold uppercase mb-2 block tracking-wider">
                            Retour du serveur MongoDB :
                        </span>
                            {dbResult.success ? (
                                // La balise pre permet de garder le formatage du JSON (espaces, sauts de ligne) pour une meilleure lisibilité
                                // On affiche le résultat de la requête MongoDB
                                <pre className="text-green-300 whitespace-pre-wrap">
                                {/* JSON.stringify(data, null, 2) permet de formater joliment le JSON avec des sauts de ligne */}
                                    {JSON.stringify(dbResult.data, null, 2)}
                            </pre>
                            ) : (
                                <pre className="text-red-300 whitespace-pre-wrap">
                                {dbResult.error}
                            </pre>
                            )}
                        </div>
                    )}
                </div>

                {/* Le bouton pour fermer la modal et revenir au quiz */ }
                <button
                    onClick={onClose}
                    className="w-full bg-blue-500 hover:bg-blue-400 text-white border-b-4 border-blue-700 font-bold py-4 rounded-xl active:border-b-0 active:translate-y-1 transition-all">
                    J'ai consulté le résultat !
                </button>
            </div>
        </div>
    );
}