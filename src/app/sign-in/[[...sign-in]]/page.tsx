import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbfaf5 0%, #f8f7f2 50%, #e9ecf1 100%)' }}>
      <div className="w-full max-w-md">
        <SignIn 
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