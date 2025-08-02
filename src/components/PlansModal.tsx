'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlansModal({ isOpen, onClose }: PlansModalProps) {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const startCheckout = async (plan: 'monthly' | 'lifetime') => {
    if (!user?.id) {
      alert('You must be logged in.');
      return;
    }
    try {
      setLoadingPlan(plan);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout URL missing', data);
      }
    } catch (e) {
      console.error('Checkout error', e);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={handleOverlayClick}
    >
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl border border-gray-600/50 shadow-2xl shadow-black/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer z-10"
          aria-label="Fechar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Conteúdo do modal */}
        <div className="p-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Choose Your Plan</span>
          </h2>
          <p className="text-center max-w-xl mx-auto text-gray-300 mb-12">
            Unlimited access to the full database, updates and priority support.
          </p>

          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
            <Plan
              highlighted={false}
              name="Monthly Pass"
              price="$97"
              period="/month"
              perks={[
                'AI-picked influencers that fit your product',
                'Unlimited CSV export',
                'Priority access',
                'Frequent updates',
              ]}
              onClick={() => startCheckout('monthly')}
              loading={loadingPlan === 'monthly'}
            />
            <Plan
              highlighted
              name="Lifetime Access"
              price="$147"
              period="one-time"
              perks={[
                'One-time payment',
                'Instant access to the current version of our full dataset',
                'Does not include future updates or new creators',
              ]}
              onClick={() => startCheckout('lifetime')}
              loading={loadingPlan === 'lifetime'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Plan reutilizado da página principal
function Plan({
  highlighted,
  name,
  price,
  period,
  perks,
  onClick,
  loading,
}: {
  highlighted: boolean;
  name: string;
  price: string;
  period: string;
  perks: string[];
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <div
      className={`w-full md:w-96 rounded-2xl p-8 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border shadow-2xl shadow-black/50 hover:scale-105 transition-all duration-300 flex flex-col ${
        highlighted
          ? 'border-orange-500 shadow-orange-500/25'
          : 'border-gray-600/50 hover:border-orange-500/50'
      }`}
    >
      <h3 className="text-2xl font-semibold text-center mb-4 text-white">{name}</h3>
      <p className="text-center text-4xl font-bold mb-6 text-white">
        {price}{' '}
        <span className="text-lg font-normal text-gray-300">{period}</span>
      </p>
      <ul className="space-y-3 mb-8 flex-grow">
        {perks.map((p) => (
          <li key={p} className="text-gray-300">{p === 'Does not include future updates or new creators' ? '✖️' : '✔️'} {p}</li>
        ))}
      </ul>
      <button
        onClick={onClick}
        disabled={loading}
        className={`block w-full text-center rounded-xl py-3 font-semibold transition-all duration-300 cursor-pointer ${
          highlighted
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/25'
            : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white shadow-lg shadow-gray-500/25'
        } ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : highlighted ? 'Get Lifetime' : 'Subscribe now'}
      </button>
    </div>
  );
}