'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingCanceled() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-8">
          <svg 
            className="mx-auto h-20 w-20 text-red-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
          <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Pagamento Cancelado</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Seu pagamento foi cancelado. Você pode tentar novamente a qualquer momento.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/home')}
            className="w-full inline-block rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 px-8 py-4 text-lg font-semibold text-white hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/25 cursor-pointer"
          >
            🏠 Voltar ao Início
          </button>
          
          <button
            onClick={() => router.push('/account')}
            className="w-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 hover:from-gray-700 hover:via-gray-800 hover:to-gray-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-orange-500/50 shadow-lg shadow-black/50 cursor-pointer"
          >
            💳 Ver Planos
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-8">
          Redirecionando automaticamente em <span className="font-bold text-white">{countdown}</span> segundo{countdown !== 1 ? 's' : ''}...
        </p>
      </div>
    </div>
  );
}