'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface Influencer {
  id: string;
  name: string;
  username: string;
  followers: string;
  views: string;
  engagementRate: string;
  profileImage: string;
  tags: string[];
  description: string;
  verified?: boolean;
}

const mockInfluencers: Influencer[] = [
  {
    id: '1',
    name: 'bitcoinbros',
    username: '@bitcoinbros',
    followers: '24.8K',
    views: '1.3K',
    engagementRate: '5.0%',
    profileImage: '🪙',
    tags: ['Crypto'],
    description: 'Crypto Enthusiasts bringing you content DAILY get our Beginner Crypto Guide! 🔥',
    verified: true
  },
  {
    id: '2',
    name: 'cryptomegbzk',
    username: '@cryptomegbzk',
    followers: '17.8K',
    views: '17.8K',
    engagementRate: '9.0%',
    profileImage: '👩',
    tags: ['Crypto'],
    description: 'Crypto | Trading | Money 💰 Inner Circle, Social, Collab, etc. 📧',
    verified: false
  },
  {
    id: '3',
    name: 'cryptorobies',
    username: '@cryptorobies',
    followers: '886.3K',
    views: '85.8K',
    engagementRate: '2.0%',
    profileImage: '👨',
    tags: ['Crypto'],
    description: 'Memecoins & Crypto Sm1 Investors 💎 Miami 🌴 Jesus! LIVE daily ✅ #robiesbackup',
    verified: true
  },
  {
    id: '4',
    name: 'xlmcrypto',
    username: '@xlmcrypto',
    followers: '45.2K',
    views: '12.1K',
    engagementRate: '4.8%',
    profileImage: '⭐',
    tags: ['Crypto'],
    description: 'Stellar Lumens enthusiast and crypto educator',
    verified: false
  },
  {
    id: '5',
    name: 'joshtalkscrypto',
    username: '@joshtalkscrypto',
    followers: '128.5K',
    views: '45.2K',
    engagementRate: '4.7%',
    profileImage: '🎯',
    tags: ['Crypto'],
    description: 'Daily crypto insights and market analysis',
    verified: true
  }
];

export default function Home() {
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [savedInfluencers, setSavedInfluencers] = useState<string[]>([]);

  const handleLogin = () => {
    router.push('/login');
  };
  
  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const toggleSave = (influencerId: string) => {
    setSavedInfluencers(prev => 
      prev.includes(influencerId) 
        ? prev.filter(id => id !== influencerId)
        : [...prev, influencerId]
    );
  };

  const saveAll = () => {
    const allIds = mockInfluencers.map(inf => inf.id);
    setSavedInfluencers(allIds);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white">
        <h1 className="text-4xl font-bold mb-8">Bitcoin Influencer</h1>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <span className="text-xl font-bold">⊕</span>
                <span className="ml-2 text-sm text-gray-300">Bitcoin Influencer</span>
              </div>
              
              <nav className="flex space-x-6">
                <a href="#" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">Matches</a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">Database</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-orange-500 text-sm">⚡ Full Access</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
       <div className="bg-black border-b border-gray-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
           <div className="flex items-center space-x-4">
             <div className="bg-gray-900 rounded-lg px-6 py-4 border border-gray-800">
               <span className="text-gray-400 text-sm">Total Creators</span>
               <div className="text-2xl font-bold">123</div>
             </div>
             <div className="bg-gray-900 rounded-lg px-6 py-4 border border-gray-800">
               <span className="text-gray-400 text-sm">Total Views</span>
               <div className="text-2xl font-bold">2.1M</div>
             </div>
           </div>
         </div>
       </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters and Actions */}
         <div className="flex items-center justify-between mb-6">
           <div className="flex items-center space-x-4">
             <span className="text-2xl font-bold">BTC</span>
           </div>
           
           <div className="flex items-center space-x-4">
             <button
               onClick={saveAll}
               className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors flex items-center space-x-2"
             >
               <span>💾</span>
               <span>Save All</span>
             </button>
             <div className="text-sm text-gray-400">
               Showing 1-21 of 123 creators
             </div>
           </div>
         </div>

        {/* Influencers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockInfluencers.map((influencer) => (
            <div key={influencer.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                    {influencer.profileImage}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <h3 className="font-semibold">{influencer.name}</h3>
                      {influencer.verified && <span className="text-blue-400">✓</span>}
                    </div>
                    <p className="text-gray-400 text-sm">{influencer.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(influencer.id)}
                  className={`text-xl ${savedInfluencers.includes(influencer.id) ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'} transition-colors`}
                >
                  {savedInfluencers.includes(influencer.id) ? '⭐' : '☆'}
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">{influencer.followers}</div>
                  <div className="text-xs text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{influencer.views}</div>
                  <div className="text-xs text-gray-400">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-400">{influencer.engagementRate}</div>
                  <div className="text-xs text-gray-400">Engagement</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-4 line-clamp-2">{influencer.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {influencer.tags.map((tag, index) => (
                    <span key={index} className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600 transition-colors">←</button>
            <span className="text-sm text-gray-400">Page 1 of 1</span>
            <button className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600 transition-colors">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
