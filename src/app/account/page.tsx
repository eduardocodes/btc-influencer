'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

interface Subscription {
  id: string;
  status: string;
  created_at: string;
  plan_name?: string;
}

export default function Account() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load user profile
      setUserProfile({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at || new Date().toISOString()
      });

      // Load subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (subscriptionsError) {
        console.error('Error loading subscriptions:', subscriptionsError);
      } else {
        setSubscriptions(subscriptionsData || []);
        const activeSubscription = subscriptionsData?.find(sub => sub.status === 'active');
        setHasActiveSubscription(!!activeSubscription);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando dados da conta...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-600/50 shadow-lg shadow-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <img src="/btc-influencer-icon.svg" alt="Bitcoin Influencer" className="h-10 w-auto" />
                <h1 className="ml-4 text-xl font-bold">Minha Conta</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/home')}
                  className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors flex items-center justify-center cursor-pointer"
                  title="Voltar para Home"
                  aria-label="Voltar para Home"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors flex items-center justify-center cursor-pointer"
                  title="Logout"
                  aria-label="Logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information */}
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 border border-gray-600/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-orange-500 rounded-full p-3 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Informações da Conta</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Email</p>
                  <p className="text-white font-medium">{userProfile?.email}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-1">ID da Conta</p>
                  <p className="text-white font-mono text-sm break-all">{userProfile?.id}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-1">Membro desde</p>
                  <p className="text-white font-medium">
                    {userProfile?.created_at ? formatDate(userProfile.created_at) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 border border-gray-600/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className={`rounded-full p-3 mr-4 ${
                  hasActiveSubscription ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Status da Assinatura</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    hasActiveSubscription 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {hasActiveSubscription ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                {subscriptions.length > 0 ? (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Histórico de Assinaturas:</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {subscriptions.map((subscription) => (
                        <div key={subscription.id} className="bg-gray-700/50 rounded p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-white">
                              {subscription.plan_name || 'Plano Pro'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              subscription.status === 'active' 
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {subscription.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(subscription.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">Nenhuma assinatura encontrada</p>
                    <button
                      onClick={() => router.push('/home')}
                      className="mt-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-sm transition-colors cursor-pointer"
                    >
                      Explorar Planos
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 border border-gray-600/50 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/home')}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
                <span>Ir para Home</span>
              </button>
              
              <button
                onClick={() => router.push('/database')}
                className={`px-6 py-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  hasActiveSubscription
                    ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                    : 'bg-gray-600 hover:bg-gray-700 cursor-not-allowed'
                }`}
                disabled={!hasActiveSubscription}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                  />
                </svg>
                <span>{hasActiveSubscription ? 'Acessar Database' : 'Database (Pro)'}</span>
              </button>
              
              <button
                onClick={() => router.push('/profile')}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-4 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Configurações</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}