'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ContactFormProps {
  onSubmit: (formData: {
    subject: string;
    message: string;
    needCallback: boolean;
    userEmail: string;
    restaurantName: string;
  }) => void;
  isSubmitting: boolean;
  userEmail: string;
  restaurantName: string;
}

const CONTACT_SUBJECTS = [
  { value: 'technical-error', label: 'Erreur technique' },
  { value: 'functionality-question', label: 'Question de fonctionnement' },
  { value: 'feature-feedback', label: 'Retour sur une fonctionnalité' },
  { value: 'billing-question', label: 'Question de facturation' },
  { value: 'feature-request', label: 'Demande de fonctionnalité' },
  { value: 'other', label: 'Autre' }
];

export default function ContactForm({ 
  onSubmit, 
  isSubmitting, 
  userEmail, 
  restaurantName 
}: ContactFormProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [needCallback, setNeedCallback] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !message.trim()) {
      return;
    }

    onSubmit({
      subject,
      message: message.trim(),
      needCallback,
      userEmail,
      restaurantName
    });

    // Reset form after submission
    setSubject('');
    setMessage('');
    setNeedCallback(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Subject Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Objet de votre demande <span className="text-red-500">*</span>
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          required
        >
          <option value="">Sélectionnez un objet</option>
          {CONTACT_SUBJECTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Message Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Votre message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => {
            if (e.target.value.length <= 2000) {
              setMessage(e.target.value);
            }
          }}
          rows={6}
          maxLength={2000}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
          placeholder="Décrivez votre demande en détail..."
          required
        />
        <p className={`text-sm mt-1 ${message.length > 1800 ? 'text-orange-500' : 'text-gray-500'}`}>
          {message.length}/2000 caractères
          {message.length > 1800 && (
            <span className="ml-2 text-orange-600">⚠️ Limite bientôt atteinte</span>
          )}
        </p>
      </div>

      {/* Callback Checkbox */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="needCallback"
          checked={needCallback}
          onChange={(e) => setNeedCallback(e.target.checked)}
          className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 mt-1"
        />
        <label htmlFor="needCallback" className="text-sm text-gray-700">
          J'aimerais être rappelé(e) pour discuter de ma demande
        </label>
      </div>

      {/* User Info Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Informations de contact
        </h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p><span className="font-medium">Email :</span> {userEmail}</p>
          <p><span className="font-medium">Restaurant :</span> {restaurantName}</p>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting || !subject || !message.trim()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
          isSubmitting || !subject || !message.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Envoi en cours...</span>
          </div>
        ) : (
          'Envoyer le message'
        )}
      </motion.button>
    </form>
  );
} 