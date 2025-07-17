'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import CobiLogo from "@/components/shared/CobiLogo";

interface TestItem {
  name: string;
  description: string;
  href?: string;
  action?: () => Promise<void>;
  status: string;
}

interface TestCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  tests: TestItem[];
}

export default function TestMenuPage() {
  const [contactResult, setContactResult] = useState<any>(null);
  const [isTestingContact, setIsTestingContact] = useState(false);

  const testContact = async () => {
    setIsTestingContact(true);
    setContactResult(null);

    try {
      const response = await fetch('/api/contact/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setContactResult(data);
    } catch (error) {
      setContactResult({
        success: false,
        message: 'Erreur de connexion',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsTestingContact(false);
    }
  };

  const testCategories: TestCategory[] = [
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
        }
      ]
    },
    {
      title: "Système de Contact",
      description: "Test du système d'envoi d'emails de contact",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      tests: [
        {
          name: "Test Système Contact",
          description: "Test d'envoi d'email via le système de contact",
          action: testContact,
          status: "stable"
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return 'bg-green-100 text-green-800';
      case 'beta':
        return 'bg-yellow-100 text-yellow-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'debug':
        return 'bg-purple-100 text-purple-800';
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
      case 'new':
        return '🆕';
      case 'debug':
        return '🔍';
      default:
        return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <CobiLogo className="w-16 h-16 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Tests & Diagnostics</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Centre de test pour valider les fonctionnalités de la plateforme COBI
          </p>
        </motion.div>

        {/* Test Categories */}
        <div className="grid gap-8 max-w-6xl mx-auto">
          {testCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600 mr-4">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {category.title}
                    </h2>
                    <p className="text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                {category.tests.map((test, testIndex) => (
                  <motion.div
                    key={test.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (categoryIndex * 0.1) + (testIndex * 0.05) }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{test.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                        {getStatusIcon(test.status)} {test.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                    
                    {test.href ? (
                      <Link 
                        href={test.href}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Ouvrir le test
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    ) : test.action ? (
                      <button
                        onClick={test.action}
                        disabled={isTestingContact}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                      >
                        {isTestingContact ? 'Test en cours...' : 'Lancer le test'}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </button>
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Test Results */}
        {contactResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-4xl mx-auto"
          >
            <div className={`rounded-xl border-2 p-6 ${
              contactResult.success 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                {contactResult.success ? (
                  <>
                    <span className="text-green-600 mr-2">✅</span>
                    Test Contact Réussi
                  </>
                ) : (
                  <>
                    <span className="text-red-600 mr-2">❌</span>
                    Test Contact Échoué
                  </>
                )}
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-medium text-gray-900 mb-2">Résultat :</h4>
                  <p className="text-sm text-gray-700 mb-2">{contactResult.message}</p>
                  <pre className="text-xs text-gray-600 overflow-x-auto bg-gray-50 p-2 rounded">
                    {JSON.stringify(contactResult, null, 2)}
                  </pre>
                </div>
                
                {contactResult.success ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">✅ Succès !</h4>
                    <p className="text-sm text-green-700">
                      L'email a été envoyé avec succès ! Vérifiez votre boîte email (et les spams) à <strong>cobi.need@gmail.com</strong>
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">❌ Échec</h4>
                    <p className="text-sm text-red-700">
                      L'envoi de l'email a échoué. Vérifiez votre configuration Resend.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 pt-8 border-t border-gray-200"
        >
          <p className="text-gray-500 text-sm">
            Tests développés pour la plateforme COBI • Version {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </div>
  );
} 