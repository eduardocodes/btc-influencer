'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();

  const handleLogin = () => {
    router.push('/login');
  };
  
  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Bitfluencer</h1>
      
      {user ? (
        <div className="flex flex-col items-center">
          <div className="mb-6 p-6 bg-gray-100 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Bem-vindo!</h2>
            <p className="mb-2"><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
          </div>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => router.push('/profile')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Meu Perfil
            </button>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Sair
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleLogin}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Entrar
          </button>
          
          <button
            onClick={() => router.push('/register')}
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Registrar
          </button>
        </div>
      )}
    </div>
  );
}
