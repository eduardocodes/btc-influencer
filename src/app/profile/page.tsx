'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  
  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-4xl font-bold mb-8">Perfil do Usuário</h1>
        
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Suas Informações</h2>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-600 hover:underline"
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">ID</p>
              <p className="font-medium">{user?.id}</p>
            </div>
            
            {isEditing && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Funcionalidade de edição de perfil será implementada em breve.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Voltar para Home
          </button>
          
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}