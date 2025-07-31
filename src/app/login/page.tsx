'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Verificar se o usuário acabou de se registrar
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setSuccessMessage('Registro realizado com sucesso! Verifique seu email para confirmar sua conta.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      // Login bem-sucedido, redirecionar para a página inicial
      router.push('/');
    } catch (err) {
      setError('Ocorreu um erro durante o login. Tente novamente.');
      console.error('Erro de login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Login Bitcoin Influencer</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-6 py-3 bg-blue-600 text-white rounded-md transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        
        <div className="mt-4 text-center">
          <p>
            Não tem uma conta?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Registre-se
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}