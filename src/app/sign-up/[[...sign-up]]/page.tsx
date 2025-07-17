import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbfaf5 0%, #f8f7f2 50%, #e9ecf1 100%)' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Inscription sur invitation</h2>
          <p className="text-gray-600 text-sm mb-4">
            L'inscription à COBI se fait uniquement sur invitation d'un administrateur. 
            Si vous avez reçu une invitation, utilisez le lien fourni dans l'email.
          </p>
          <div className="flex items-center justify-center">
            <a 
              href="/sign-in" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Retour à la connexion
            </a>
          </div>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: {
                backgroundColor: '#0a5b48',
                '&:hover': {
                  backgroundColor: '#0a5b48',
                  opacity: 0.9
                }
              },
              card: {
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }
            }
          }}
        />
      </div>
    </div>
  );
} 