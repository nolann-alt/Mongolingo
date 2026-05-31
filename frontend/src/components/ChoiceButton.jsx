import React from 'react';

/**
 * Le composant pour afficher un bouton de choix de réponse, avec une couleur qui change selon s'il est sélectionné, et si la réponse a été vérifiée comme correcte ou non.
 * @param choice choix de réponse à afficher sur le bouton
 * @param isSelected indique si ce bouton est celui sélectionné par l'utilisateur
 * @param isChecked indique si l'utilisateur a vérifié sa réponse (en cliquant sur le bouton "Vérifier"), ce qui désactive les boutons et affiche les bonnes/mauvaises réponses
 * @param isCorrect indique si ce bouton est la bonne réponse (true) ou une mauvaise réponse (false), pour afficher la couleur verte ou rouge après vérification
 * @param isActualCorrectAnswer indique si ce bouton correspond à la bonne réponse réelle, pour l'afficher en vert clair même si l'utilisateur a sélectionné une mauvaise réponse, afin de lui montrer la bonne réponse
 * @param onSelect fonction à appeler quand l'utilisateur clique sur ce bouton pour sélectionner cette réponse
 * @returns {Element} Un bouton stylisé pour une réponse de quiz, avec des couleurs et des interactions selon l'état de la sélection et de la vérification
 * @constructor le composant React pour afficher un bouton de choix de réponse dans le quiz, avec des styles conditionnels selon l'état de la sélection et de la vérification
 *
 * @author Nolann LESCOP
 * @version 1.0
 */
export default function ChoiceButton({ choice, isSelected, isChecked, isCorrect, isActualCorrectAnswer, onSelect }) {
    // Détermine le style du bouton selon s'il est sélectionné, et si la réponse a été vérifiée
    let btnStyle = "bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:border-slate-500";

    if (isSelected) {
        if (!isChecked) {
            btnStyle = "bg-blue-500/20 border-blue-500 text-blue-400"; // Sélectionné
        } else if (isCorrect) {
            btnStyle = "bg-green-500/20 border-green-500 text-green-400"; // Bonne réponse
        } else {
            btnStyle = "bg-red-500/20 border-red-500 text-red-400"; // Mauvaise réponse
        }
    } else if (isChecked && isActualCorrectAnswer) {
        // Met en surbrillance la bonne réponse si l'utilisateur s'est trompé
        btnStyle = "bg-green-500/10 border-green-500 text-green-400";
    }

    return (
        <button
            disabled={isChecked} // Désactive le clic après vérification
            onClick={() => onSelect(choice)}
            className={`
                border-2 border-b-4 rounded-xl p-4 text-left font-mono text-sm break-all transition-all
                ${btnStyle}
                ${!isChecked && "active:border-b-2 active:translate-y-1"}
            `}>
            {choice}
        </button>
    );
}