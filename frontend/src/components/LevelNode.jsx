import React from 'react';

/**
 * L'affichage d'un niveau sur la carte (MapScreen.jsx). Il reçoit les infos du niveau, son statut (débloqué ou pas, actif ou pas) et des fonctions pour gérer les interactions.
 * @param level les infos du niveau à afficher (titre, icône, XP, classes de couleur et d'ombre)
 * @param isUnlocked indique si le niveau est débloqué ou pas, pour afficher le cadenas et désactiver le clic si c'est verrouillé
 * @param isActive indique si la bulle de ce niveau est actuellement ouverte ou pas, pour l'afficher ou la cacher
 * @param onToggle fonction à appeler quand on clique sur le niveau pour ouvrir ou fermer la bulle, qui reçoit l'id du niveau pour que le parent puisse gérer quel niveau est actif
 * @param onStartLevel fonction à appeler quand on clique sur le bouton "JOUER" dans la bulle, qui reçoit l'id du niveau et l'XP pour que le parent puisse lancer le quiz correspondant et afficher l'XP gagné dans le ScoreScreen
 * @returns {Element} Un composant React pour afficher un niveau sur la carte, avec une bulle d'information qui s'affiche quand on clique dessus, et des styles différents selon le statut du niveau.
 * @constructor le composant React pour afficher un niveau sur la carte, avec une bulle d'information qui s'affiche quand on clique dessus, et des styles différents selon le statut du niveau.
 *
 * @author Nolann LESCOP
 * @version 1.0
 */
export default function LevelNode({ level, isUnlocked, isActive, onToggle, onStartLevel }) {
    return (
        <div className={`flex flex-col items-center relative z-10 ${level.offsetClass}`}>

            {/* La bulle (Tooltip) qui s'affiche que quand le niveau est debloqué */}
            {isActive && isUnlocked && (
                <div className="absolute -top-24 bg-slate-800 border-2 border-slate-600 rounded-2xl p-3 shadow-xl z-50 flex flex-col items-center ">
                <span className="text-yellow-400 font-extrabold mb-2 whitespace-nowrap">
                    +{level.xp} XP
                </span>
                    <button
                        // On passe l'ID ET l'XP à la fonction parente pour qu'elle puisse les utiliser dans le QuizScreen et le ScoreScreen
                        onClick={() => onStartLevel(level.id, level.xp)}
                        className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-6 rounded-xl w-full">
                        JOUER
                    </button>
                    {/* Petit triangle pour faire l'effet bulle de BD */}
                    <div className="absolute -bottom-2 w-4 h-4 bg-slate-800 border-b-2 border-r-2 border-slate-600 transform rotate-45"></div>
                </div>
            )}

            {/* Le bouton "Duolingo" rond */}
            <button
                // Au lieu de lancer le niveau direct, ça ouvre la bulle
                onClick={() => {
                    // Si le niveau est débloqué, on peut cliquer pour ouvrir la bulle. Sinon, on ne fait rien.
                    if (isUnlocked) {
                        // Si on clique sur le même, on le ferme. Sinon, on l'ouvre et on stock l'id du level dans le state de la carte.
                        onToggle(level.id);
                    }
                }}
                // La classe change en fonction du statut du niveau : s'il est verrouillé, il est grisé et non cliquable. S'il est débloqué, il a une couleur et un effet au survol.
                className={`
                w-20 h-20 rounded-full flex items-center justify-center text-3xl
                border-b-8 active:border-b-0 active:translate-y-2 transition-all
                ${level.shadow}
                ${!isUnlocked ? `opacity-60 cursor-not-allowed grayscale ${level.colorLocked}` : `cursor-pointer hover:brightness-110 ${level.colorUnlocked}`}
                `}>

                {/* Si c'est bloqué on met le cadenas, sinon l'icône de la leçon */}
                {!isUnlocked ? '🔒' : level.icon}
            </button>

            {/* Titre en dessous du rond */}
            <span className="mt-3 font-bold text-sm text-slate-200 bg-slate-900/80 px-3 py-1 rounded-xl backdrop-blur-sm">
            {level.title}
        </span>
        </div>
    );
}