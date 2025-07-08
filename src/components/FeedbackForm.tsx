'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Model3D, ModelRating } from '@/types/model';
import { supabase } from '@/lib/supabase';

interface FeedbackFormProps {
  model: Model3D;
  onClose: () => void;
  onSubmit: (rating: ModelRating) => void;
}

export default function FeedbackForm({ model, onClose, onSubmit }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [isPositive, setIsPositive] = useState<boolean | undefined>(undefined);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const getUserSession = () => {
    if (typeof window !== 'undefined') {
      let session = localStorage.getItem('userSession');
      if (!session) {
        session = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userSession', session);
      }
      return session;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0 && isPositive === undefined) {
      setSubmitError('Veuillez donner une note ou un avis');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const userSession = getUserSession();
      
      const newRating: Omit<ModelRating, 'id' | 'createdAt' | 'updatedAt'> = {
        modelId: model.id,
        userSession,
        rating: rating || 3, // Default à 3 si pas de rating
        isPositive,
        feedbackText: feedbackText.trim() || undefined
      };

      // Envoyer à Supabase
      const { data, error } = await supabase
        .from('model_ratings')
        .upsert({
          model_id: newRating.modelId,
          user_session: newRating.userSession,
          rating: newRating.rating,
          is_positive: newRating.isPositive,
          feedback_text: newRating.feedbackText,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'model_id,user_session'
        })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour la moyenne du modèle
      const { error: updateError } = await supabase.rpc('update_model_rating', {
        model_id: model.id
      });

      if (updateError) {
        console.error('Erreur mise à jour moyenne:', updateError);
      }

      const submittedRating: ModelRating = {
        id: data.id,
        modelId: data.model_id,
        userSession: data.user_session,
        rating: data.rating,
        isPositive: data.is_positive,
        feedbackText: data.feedback_text,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      onSubmit(submittedRating);
      onClose();
    } catch (error) {
      console.error('Erreur soumission feedback:', error);
      setSubmitError('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Noter "{model.name}"
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating par étoiles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (optionnel)
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400`}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Thumbs up/down */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avis rapide
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setIsPositive(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  isPositive === true
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">👍</span>
                <span className="text-sm">J'aime</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPositive(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  isPositive === false
                    ? 'bg-red-100 border-red-500 text-red-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">👎</span>
                <span className="text-sm">J'aime pas</span>
              </button>
                             {isPositive !== undefined && (
                 <button
                   type="button"
                   onClick={() => setIsPositive(undefined)}
                   className="text-sm text-gray-500 hover:text-gray-700"
                 >
                   Effacer
                 </button>
               )}
            </div>
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Partagez votre avis..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {feedbackText.length}/500
            </div>
          </div>

          {/* Erreur */}
          {submitError && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (rating === 0 && isPositive === undefined)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
} 