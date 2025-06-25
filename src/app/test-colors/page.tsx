'use client';

export default function TestColorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-teal-800">Test des Couleurs La BELLA vita</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Carte Teal */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6">
            <h2 className="text-xl font-semibold mb-4 text-teal-800">Couleur Teal</h2>
            <p className="text-teal-600 mb-4">
              Ceci est un texte en teal-600 pour tester la couleur principale.
            </p>
            <div className="w-full h-4 bg-teal-100 rounded mb-2"></div>
            <div className="w-full h-4 bg-teal-600 rounded"></div>
          </div>

          {/* Carte Orange */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-800">Couleur Orange</h2>
            <p className="text-orange-600 mb-4">
              Ceci est un texte en orange-600 pour tester la couleur d'accent.
            </p>
            <div className="w-full h-4 bg-orange-100 rounded mb-2"></div>
            <div className="w-full h-4 bg-orange-600 rounded"></div>
          </div>

          {/* Carte Dégradé */}
          <div className="bg-gradient-to-br from-teal-50 to-orange-50 rounded-xl shadow-lg border border-teal-100 p-6">
            <h2 className="text-xl font-semibold mb-4 text-teal-800">Dégradé</h2>
            <p className="text-teal-600 mb-4">
              Arrière-plan avec dégradé teal-orange.
            </p>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">Stable</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">Beta</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-orange-100">
          <h3 className="text-lg font-semibold mb-4 text-teal-800">Instructions</h3>
          <ul className="text-teal-600 space-y-2">
            <li>• Si vous voyez des couleurs teal (vert-bleu) et orange, les couleurs fonctionnent !</li>
            <li>• L'arrière-plan doit être un dégradé rose-orange très subtil</li>
            <li>• Les cartes doivent avoir des bordures orange claires</li>
            <li>• Les textes doivent être en différentes nuances de teal</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 