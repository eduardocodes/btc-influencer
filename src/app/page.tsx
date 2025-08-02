'use client';

// pages/index.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Head from 'next/head';
import Script from 'next/script';

import PlansModal from '@/src/components/PlansModal';

export default function MainPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();

  const faqs = [
    {
      q: 'What I get access to exactly?',
      a: '1) An AI curated list of creators whose audience matches your product\n\n2) Vetted creator database\n\n3) Fresh creator metrics',
    },
    {
      q: 'How many influencers are included?',
      a: 'Currently hundreds of Bitcoin-only and crypto creators — and we add fresh profiles every week.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. Your subscription is month-to-month and you can cancel in one click inside your dashboard.',
    },
  ];

  const handleLogin = () => {
    router.push('/login');
  };
  
  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const handleAccountClick = () => {
    router.push('/account');
  };

  const handleDatabaseClick = () => {
    router.push('/database');
  };

  const handleHomeClick = () => {
    router.push('/home');
  };

  const handleFindCreators = () => {
    if (user) {
      router.push('/home');
    } else {
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Meta + Tailwind CDN */}
      <Head>
        <title>Bitcoin Influencer – Curated Bitcoin & Crypto Creators</title>
        <meta
          name="description"
          content="Save hours finding Bitcoin influencers. Curated list with fresh metrics and quick CSV export."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Script
        src="https://cdn.tailwindcss.com"
        strategy="beforeInteractive"
      />

      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-600/50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <img 
                  src="/btc-influencer-icon.svg" 
                  alt="Bitcoin Influencer" 
                  className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={handleHomeClick}
                />
              </div>
              
              <nav className="flex space-x-6">
                {user ? (
                  <>
                    <a href="#" onClick={handleHomeClick} className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium cursor-pointer">Matches</a>
                    <a href="#" onClick={handleDatabaseClick} className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium cursor-pointer">Database</a>
                  </>
                ) : (
                  <>
                    <a href="#features" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">Features</a>
                    <button onClick={() => setIsPlansModalOpen(true)} className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium cursor-pointer">Pricing</button>
                  </>
                )}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button
                    onClick={handleAccountClick}
                    className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors flex items-center justify-center cursor-pointer"
                    title="Account"
                    aria-label="Account"
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
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
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
                </>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition duration-200 cursor-pointer"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center text-center py-70 px-6">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mt-6">
          Find <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Bitcoin Influencers</span> in
          Seconds
        </h1>
        <p className="mt-6 max-w-2xl text-lg md:text-xl text-gray-300">
          Bitcoin&nbsp;Influencer gives you a hand-picked list of Bitcoin-only
          and crypto creators — shaving hours off your research.
        </p>
        <button
          onClick={handleFindCreators}
          className="mt-10 inline-block rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 px-8 py-4 text-lg font-semibold text-white hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/25 cursor-pointer"
        >
          🔍 Find Creators
        </button>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Why Bitcoin&nbsp;Influencer?</span>
          </h2>
          <div className="mt-16 grid gap-12 grid-cols-1 md:grid-cols-2">
            <Feature
                icon="🤖"
                title="AI That Picks Winning Creators"
                desc="Our intelligent algorithm scan your product and instantly match you with influencers who sell."
              />
            <Feature
              icon="⏱️"
              title="Save Hours of Research"
              desc="Instantly access a vetted database of Bitcoin-only and crypto creators ready for collaboration."
            />
            <Feature
              icon="📈"
              title="Updated Metrics"
              desc="Follower counts, average views and engagement rates consistently refreshed — always fresh data."
            />
            <Feature
              icon="📥"
              title="Easy Export"
              desc="Download the full list in one click — clear, organized, and ready to explore."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Frequently Asked Questions</span>
          </h2>
          <ul className="space-y-4">
            {faqs.map((item, idx) => (
              <li key={item.q} className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl border border-gray-600/50 shadow-lg shadow-black/50 hover:border-orange-500/50 transition-all duration-300">
                <button
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-800/50 rounded-xl transition-all duration-300 cursor-pointer"
                  onClick={() =>
                    setOpenIndex(idx === openIndex ? null : idx)
                  }
                >
                  <span className="font-medium text-white">{item.q}</span>
                  <span className="text-orange-500 text-xl font-bold cursor-pointer">{idx === openIndex ? '−' : '+'}</span>
                </button>
                {idx === openIndex && (
                  <p className="px-6 pb-6 text-gray-300 whitespace-pre-line border-t border-gray-700/50 pt-4">{item.a}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-gray-400 py-12 mt-auto border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p>
            © {new Date().getFullYear()} Bitcoin Influencer. All rights
            reserved.
          </p>
          <a
            href="mailto:empreendimentoscommaestria@gmail.com"
            className="hover:text-white transition"
          >
            Contact us
          </a>
        </div>
      </footer>
      
      {/* Plans Modal */}
      <PlansModal 
        isOpen={isPlansModalOpen} 
        onClose={() => setIsPlansModalOpen(false)} 
      />
    </div>
  );
}

/* ---------- Helper Components ---------- */

function Feature({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center px-6 bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 rounded-xl p-8 border border-gray-600/30 shadow-lg shadow-black/50 hover:border-orange-500/50 hover:scale-105 transition-all duration-300">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-4 text-gray-300">{desc}</p>
    </div>
  );
}

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
      className={`w-full md:w-96 rounded-2xl p-8 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border shadow-2xl shadow-black/50 hover:scale-105 transition-all duration-300 ${
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
      <ul className="space-y-3 mb-8">
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
        {loading ? 'Loading...' : highlighted ? 'Get Lifetime' : 'Subscribe now'}
      </button>
    </div>
  );
}
