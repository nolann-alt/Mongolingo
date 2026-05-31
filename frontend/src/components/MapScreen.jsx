import React, { useState } from 'react';
import LevelNode from "./LevelNode.jsx";

/**
 * Le composant principal de la carte d'apprentissage (MapScreen.jsx) qui affiche les différentes unités et niveaux du parcours d'apprentissage.
 * @param onStartLevel fonction à appeler quand l'utilisateur clique sur "JOUER" dans la bulle d'un niveau, qui reçoit l'id du niveau et l'XP pour que le parent puisse lancer le quiz correspondant et afficher l'XP gagné dans le ScoreScreen
 * @param maxUnlockedLevel indique jusqu'à quel niveau l'utilisateur a débloqué, pour afficher les niveaux verrouillés ou non sur la carte. Par défaut, le niveau 1 est débloqué.
 * @returns {Element} Un composant React pour afficher la carte d'apprentissage avec les différentes unités et niveaux, et gérer les interactions pour ouvrir les bulles d'information et lancer les quiz.
 * @constructor le composant React pour afficher la carte d'apprentissage avec les différentes unités et niveaux, et gérer les interactions pour ouvrir les bulles d'information et lancer les quiz.
 *
 * @author Nolann LESCOP
 * @version 1.0
 */
export default function MapScreen({ onStartLevel, maxUnlockedLevel = 1 }) {

    // État pour mémoriser sur quel niveau l'utilisateur a cliqué
    const [activeLevelId, setActiveLevelId] = useState(null);

    // Structure complète : 3 Courses contenant plusieurs Leçons
    const courses = [
        {
            id: "course-1",
            title: "Unité 1 : Les Fondations",
            color: "text-green-400",
            lessons: [
                { id: 1, title: "Bases", icon: "📖", colorLocked: "bg-gray-500", colorUnlocked: "bg-green-500", shadow: "border-green-700", offsetClass: "translate-x-0", xp: 10 },
                { id: 2, title: "Types", icon: "🔢", colorLocked: "bg-gray-500", colorUnlocked: "bg-green-500", shadow: "border-green-700", offsetClass: "translate-x-16", xp: 20 },
                { id: 3, title: "Comparaisons", icon: "⚖️", colorLocked: "bg-gray-500", colorUnlocked: "bg-green-500", shadow: "border-green-700", offsetClass: "translate-x-0", xp: 30 }
            ]
        },
        {
            id: "course-2",
            title: "Unité 2 : Exploration Profonde",
            color: "text-orange-400",
            lessons: [
                { id: 4, title: "Imbrication", icon: "📦", colorLocked: "bg-gray-500", colorUnlocked: "bg-orange-500", shadow: "border-orange-700", offsetClass: "translate-x-0", xp: 40 },
                { id: 5, title: "Structure", icon: "🏗️", colorLocked: "bg-gray-500", colorUnlocked: "bg-orange-500", shadow: "border-orange-700", offsetClass: "-translate-x-16", xp: 50 },
                { id: 6, title: "Logique", icon: "🧠", colorLocked: "bg-gray-500", colorUnlocked: "bg-orange-500", shadow: "border-orange-700", offsetClass: "translate-x-0", xp: 60 }
            ]
        },
        {
            id: "course-3",
            title: "Unité 3 : Maître NoSQL",
            color: "text-purple-400",
            lessons: [
                { id: 7, title: "Expertise", icon: "🕵️", colorLocked: "bg-gray-500", colorUnlocked: "bg-purple-500", shadow: "border-purple-700", offsetClass: "translate-x-0", xp: 70 },
                { id: 8, title: "CRUD", icon: "✏️", colorLocked: "bg-gray-500", colorUnlocked: "bg-purple-500", shadow: "border-purple-700", offsetClass: "translate-x-16", xp: 80 },
                { id: 9, title: "Agrégations", icon: "🏆", colorLocked: "bg-gray-500", colorUnlocked: "bg-purple-500", shadow: "border-purple-700", offsetClass: "translate-x-0", xp: 100 }
            ]
        },
        {
            id: "course-4",
            title: "Unité 4 : Mode Terminal",
            color: "text-blue-400",
            lessons: [
                { id: 10, title: "Saisie Libre", icon: "⌨️", colorLocked: "bg-gray-500", colorUnlocked: "bg-blue-500", shadow: "border-blue-700", offsetClass: "translate-x-0", xp: 120 },
                { id: 11, title: "Cycle CRUD", icon: "🔄", colorLocked: "bg-gray-500", colorUnlocked: "bg-blue-500", shadow: "border-blue-700", offsetClass: "-translate-x-16", xp: 150 },
                { id: 12, title: "Pipelines", icon: "🚰", colorLocked: "bg-gray-500", colorUnlocked: "bg-blue-500", shadow: "border-blue-700", offsetClass: "translate-x-0", xp: 200 }
            ]
        }
    ];

    return (
        <div className="flex flex-col items-center py-12">

            {/* En-tête de l'application avec le titre et la description */}
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">
                    Mongolingo
                </h1>
                <p className="text-slate-400 font-medium">Maîtrise NoSQL pas à pas</p>
            </div>

            {/* Le chemin d'apprentissage (Learning Path) */}
            <div className="flex flex-col items-center w-full max-w-md">

                {/* On map chaque unité pour récupérer chaque cours et en faire un bouton en fonction des caractéristiques contenu dedans comme la couleur mais aussi affiché chaque unité */}
                {courses.map((course, index) => (
                    <div key={course.id} className="w-full mb-16 relative flex flex-col items-center">

                        {/* Titre de l'unité - Centré */}
                        <div className="w-full flex items-center justify-center mb-8 px-6 text-center">
                            <h2 className={`text-2xl font-bold ${course.color}`}>
                                {course.title}
                            </h2>
                        </div>

                        {/* Conteneur des leçons avec la ligne SVG en arrière-plan */}
                        <div className="flex flex-col items-center space-y-12 relative w-full">
                            {/* Ligne sinueuse SVG (chemin en arrière-plan) */}
                            <div className="absolute top-10 bottom-0 left-0 right-0 flex justify-center -z-10 pointer-events-none">
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-48 h-full text-slate-800">
                                    {/* Le chemin sinueux : il alterne entre une courbe vers la droite (90) et une courbe vers la gauche (10) pour créer un effet de zigzag. */}
                                    <path
                                        // Le chemin part du centre (50), s'incurve (90 ou 10), et revient au centre (50)
                                        d={index % 2 === 0 ? "M 50,0 C 90,30 90,70 50,100" : "M 50,0 C 10,30 10,70 50,100"}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                            </div>

                            {/* Affichage des petites leçons (les ronds) */}
                            {course.lessons.map((level) => {

                                const isUnlocked = level.id <= maxUnlockedLevel;

                                return (
                                    <LevelNode
                                        key={level.id}
                                        level={level}
                                        isUnlocked={isUnlocked}
                                        isActive={activeLevelId === level.id}
                                        onToggle={(id) => setActiveLevelId(activeLevelId === id ? null : id)}
                                        onStartLevel={onStartLevel}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}