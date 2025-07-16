'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/shared/DashboardLayout';
import ContactForm from '@/components/ContactForm';

export default function FeedbackPage() {
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (formData: {
    subject: string;
    message: string;
    needCallback: boolean;
    userEmail: string;
    restaurantName: string;
  }) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'
      });

      // Reset form après succès
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);

    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Une erreur s\'est produite lors de l\'envoi de votre message. Veuillez réessayer.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      userRole="restaurateur"
      userName={user?.name}
      restaurantName={user?.name || 'Mon Restaurant'}
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900">Nous contacter</h1>
          <p className="text-gray-600 mt-2">
            Une question, un problème ou une suggestion ? Nous sommes là pour vous aider !
          </p>
        </motion.div>

        {/* Status Message */}
        {submitStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center">
              {submitStatus.type === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {submitStatus.message}
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Envoyer un message</h2>
                <p className="text-gray-600 mt-1">
                  Décrivez votre demande et nous vous répondrons rapidement.
                </p>
              </div>
              
              <div className="p-6">
                <ContactForm
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  userEmail={user?.email || ''}
                  restaurantName={user?.name || 'Mon Restaurant'}
                />
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Contact Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Nos coordonnées
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-teal-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">cobi.need@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-teal-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Temps de réponse</p>
                    <p className="text-sm text-gray-600">24-48 heures</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Questions fréquentes
              </h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Comment ajouter un nouveau modèle 3D ?</p>
                  <p className="text-gray-600">Utilisez la section "Upload" dans votre dashboard</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Problème d'affichage AR ?</p>
                  <p className="text-gray-600">Vérifiez que votre appareil supporte WebXR</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Modifier les informations du restaurant ?</p>
                  <p className="text-gray-600">Rendez-vous dans la section "Paramètres"</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
} 