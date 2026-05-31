// La zone qui affiche la consigne (ex: "Trouve tous les films").
import React from 'react';
import ChoiceButton from './ChoiceButton';

/**
 * Composant qui affiche la consigne de la question et les 4 boutons de réponses cliquables
 * @param currentQuestion l'objet de la question actuelle, qui contient la consigne, les choix de réponses, et la bonne réponse
 * @param selectedAnswer la réponse actuellement sélectionnée par l'utilisateur, pour mettre à jour le style des boutons de réponses et la zone de saisie
 * @param isChecked indique si l'utilisateur a vérifié sa réponse, pour désactiver les boutons et afficher les bonnes/mauvaises réponses
 * @param isCorrect indique si la réponse de l'utilisateur est correcte ou non, pour afficher les styles verts ou rouges sur les boutons et la zone de saisie
 * @param onSelectAnswer fonction à appeler quand l'utilisateur sélectionne une réponse ou écrit dans la zone de saisie, pour mettre à jour le state "selectedAnswer" dans QuizScreen
 * @returns {Element} Un composant React pour afficher la consigne de la question et les boutons de réponses, avec des styles et des interactions selon l'état de la sélection et de la vérification
 * @constructor le composant React pour afficher la consigne de la question et les boutons de réponses, avec des styles et des interactions selon l'état de la sélection et de la vérification
 *
 * @author Nolann LESCOP
 * @version 1.0
 */
export default function QuestionCard({ currentQuestion, selectedAnswer, isChecked, isCorrect, onSelectAnswer }) {

    // On vérifie le type de la question (par défaut c'est un QCM)
    const isTextInput = currentQuestion.type_question === 'text';

    return (
        <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full flex flex-col justify-center pb-32">

            {/* L'instruction (ex: "Trouve tous les films") */}
            <h2 className="text-3xl font-extrabold text-white mb-8 leading-tight">
                {currentQuestion.instruction}
            </h2>

            {isTextInput ? (
                // ================= MODE TERMINAL (Saisie Libre) =================
                <div className="flex flex-col gap-4 animate-fade-in">
                    <div className={`relative bg-slate-950 p-4 rounded-xl border-2 transition-colors flex
                        ${isChecked && isCorrect ? "border-green-500" : ""}
                        ${isChecked && !isCorrect ? "border-red-500" : ""}
                        ${!isChecked ? "border-slate-700 focus-within:border-blue-500" : ""}`}>
                        <span className="text-slate-500 font-mono mt-1 mr-3">{'>'}</span>
                        <textarea
                            // On lit et on écrit dans le state "selectedAnswer" de QuizScreen
                            value={selectedAnswer || ''}
                            onChange={(e) => onSelectAnswer(e.target.value)}
                            disabled={isChecked}
                            placeholder='Écris ta requête BSON ici, ex: { "type": "Movie" }'
                            className="w-full bg-transparent text-green-400 font-mono text-lg outline-none resize-none h-32"
                            spellCheck="false"
                        />
                    </div>

                    {/* Si l'utilisateur a faux, on lui montre discrètement la vraie réponse pour l'aider */}
                    {isChecked && !isCorrect && (
                        <div className="bg-red-900/20 p-4 rounded-xl border border-red-900/50 mt-2">
                            <span className="text-red-400 text-sm font-bold">La requête attendue était :</span>
                            <p className="font-mono text-white mt-1">{currentQuestion.correctAnswer}</p>
                        </div>
                    )}
                </div>

            ) : (

                // ================= La grille avec les 4 boutons avec le composant ChoiceButton qui est dupliqué avec autant de fois que necessaire =================
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.choices && currentQuestion.choices.map((choice, index) => (
                        <ChoiceButton
                            key={index}
                            choice={choice}
                            isSelected={selectedAnswer === choice}
                            isChecked={isChecked}
                            isCorrect={isCorrect}
                            isActualCorrectAnswer={choice === currentQuestion.correctAnswer}
                            onSelect={onSelectAnswer}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}