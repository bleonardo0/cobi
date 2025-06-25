'use client';

import { motion } from "framer-motion";
import Link from "next/link";

export default function TestMenuPage() {
  const testCategories = [
    {
      title: "Tests de Base",
      description: "Tests fondamentaux des fonctionnalités 3D",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      tests: [
        {
          name: "Test Simple",
          description: "Test basique du model-viewer avec différents modèles",
          href: "/test-simple",
          status: "stable"
        },
        {
          name: "Test Thumbnails",
          description: "Génération et affichage des miniatures",
          href: "/test-thumbnail",
          status: "beta"
        }
      ]
    },
    {
      title: "Formats & Compatibilité",
      description: "Tests de compatibilité des formats 3D",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      tests: [
        {
          name: "Test USDZ",
          description: "Test de compatibilité USDZ et AR sur iOS",
          href: "/test-usdz",
          status: "stable"
        }
      ]
    },
    {
      title: "Fonctionnalités Avancées",
      description: "Tests des fonctionnalités interactives",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      tests: [
        {
          name: "Test Hotspots",
          description: "Points d'intérêt interactifs sur les modèles 3D",
          href: "/test-hotspots",
          status: "experimental"
        },
        {
          name: "Test Analytics",
          description: "Suivi des interactions et statistiques",
          href: "/test-analytics",
          status: "beta"
        }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return 'bg-teal-100 text-teal-800';
      case 'beta':
        return 'bg-orange-100 text-orange-800';
      case 'experimental':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable':
        return '✅';
      case 'beta':
        return '🧪';
      case 'experimental':
        return '⚡';
      default:
        return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      {/* Header */}
      <div className="sticky top-0 z-50" style={{ 
        background: 'rgba(255, 245, 235, 0.95)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <div className="container-modern py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-600 to-teal-700">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-bold text-teal-800">COBI</span>
              </Link>
              <div className="hidden sm:block w-px h-6 bg-teal-300"></div>
              <span className="hidden sm:block text-teal-700 font-medium">Centre de Tests</span>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-white text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors text-sm font-medium"
            >
              ← Retour au Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-modern section-padding">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-teal-100 to-teal-200">
            <svg
              className="w-10 h-10 text-teal-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-teal-800">Centre de Tests COBI</h1>
          <p className="text-xl text-teal-600 max-w-2xl mx-auto">
            Testez et validez toutes les fonctionnalités 3D, AR et d'interaction de la plateforme
          </p>
        </motion.div>

        {/* Test Categories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {testCategories.map((category, categoryIndex) => (
            <motion.div key={categoryIndex} variants={itemVariants}>
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-teal-800">{category.title}</h2>
                    <p className="text-teal-600">{category.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tests.map((test, testIndex) => (
                  <Link key={testIndex} href={test.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:border-teal-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 text-teal-800">{test.name}</h3>
                          <p className="text-teal-600 text-sm leading-relaxed">
                            {test.description}
                          </p>
                        </div>
                        <div className={`ml-4 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(test.status)}`}>
                          {getStatusIcon(test.status)} {test.status}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-orange-100">
                        <span className="text-sm font-medium text-teal-700">
                          Lancer le test →
                        </span>
                        <svg
                          className="w-5 h-5 text-teal-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 p-6 rounded-xl bg-gradient-to-br from-teal-50 to-orange-50 border border-teal-100"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-teal-800">À propos des tests</h3>
            <p className="text-teal-600 text-sm max-w-2xl mx-auto">
              Ces tests permettent de valider le bon fonctionnement des différentes fonctionnalités 
              de COBI dans différents environnements et navigateurs. Ils sont essentiels pour 
              garantir une expérience utilisateur optimale.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 