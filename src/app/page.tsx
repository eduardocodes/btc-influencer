'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="text-6xl">₿</div>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
              Bitcoin Influencer
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Conecte sua marca com os melhores criadores de conteúdo Bitcoin e crypto
          </p>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl p-8 border border-gray-600/50 shadow-2xl shadow-black/50 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-gray-400">
                Faça login ou crie sua conta para continuar
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/login"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 transform shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 flex items-center justify-center"
              >
                Fazer Login
              </Link>

              <Link
                href="/register"
                className="w-full bg-transparent border-2 border-gray-600 hover:border-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 transform flex items-center justify-center"
              >
                Criar Conta
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="text-center text-sm text-gray-400">
                <p className="mb-2">Descubra criadores de conteúdo que combinam com sua marca</p>
                <div className="flex justify-center items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">✓</span>
                    <span>Matches personalizados</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">✓</span>
                    <span>Análise de engajamento</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">✓</span>
                    <span>Contatos diretos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2024 Bitcoin Influencer. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}