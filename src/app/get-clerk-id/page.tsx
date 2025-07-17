'use client';

import { useUser } from '@clerk/nextjs';

export default function GetClerkIdPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Vous devez être connecté pour voir votre ID Clerk
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Votre ID Clerk</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID Clerk :
          </label>
          <div className="bg-white border border-gray-300 rounded px-3 py-2 font-mono text-sm">
            {user.id}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email :
          </label>
          <div className="bg-white border border-gray-300 rounded px-3 py-2 text-sm">
            {user.emailAddresses[0]?.emailAddress}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom :
          </label>
          <div className="bg-white border border-gray-300 rounded px-3 py-2 text-sm">
            {user.firstName} {user.lastName}
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">Instructions :</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
          <li>Copiez votre ID Clerk ci-dessus</li>
          <li>Allez dans Supabase Dashboard → SQL Editor</li>
          <li>Ouvrez le script <code>reset-auth-system.sql</code></li>
          <li>Remplacez <code>'your_clerk_admin_id'</code> par votre ID Clerk</li>
          <li>Exécutez le script</li>
          <li>Revenez sur cette page et rechargez</li>
        </ol>
      </div>
    </div>
  );
} 