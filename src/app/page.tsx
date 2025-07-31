'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../utils/supabase';

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

// Onboarding Flow agora está em /onboarding/page.tsx
// Bloco do antigo OnboardingFlow e funções relacionadas removidos


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
  const [currentPage, setCurrentPage] = useState(1)
  const [savedInfluencers, setSavedInfluencers] = useState<Set<string>>(new Set())
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingData, setOnboardingData] = useState<any>(null)
  const influencersPerPage = 6

  useEffect(() => {
    const loadOnboardingData = async () => {
      const hasVisited = localStorage.getItem('hasVisitedBefore')
      const savedOnboardingData = localStorage.getItem('onboardingData')
      
      // Try to load from Supabase if user is authenticated
      if (user) {
        try {
          const { data, error } = await supabase
            .from('onboarding')
            .select('*')
            .eq('user_id', user.id)
            .single()
          
          if (data && !error) {
            const supabaseData = {
              companyName: data.company_name,
              productName: data.product_name,
              productUrl: data.product_url,
              productDescription: data.product_description,
              completedAt: data.created_at
            }
            setOnboardingData(supabaseData)
            localStorage.setItem('onboardingData', JSON.stringify(supabaseData))
            localStorage.setItem('hasVisitedBefore', 'true')
            setIsFirstVisit(false)
            return
          }
        } catch (error) {
          console.log('Could not load from Supabase:', error)
        }
      }
      
      // Fallback to localStorage
      if (hasVisited && savedOnboardingData) {
        setIsFirstVisit(false)
        setOnboardingData(JSON.parse(savedOnboardingData))
      } else {
        setIsFirstVisit(true)
      }
    }
    
    loadOnboardingData()
  }, [user])

  useEffect(() => {
    if (showOnboarding) {
      router.push("/onboarding");
    }
  }, [showOnboarding, router]);

  const menuItems = ['Matches', 'Database']

  const handleLogin = () => {
    router.push('/login');
  };
  
  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const logout = handleLogout;

  const handleSaveInfluencer = (id: string) => {
    setSavedInfluencers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleGetMatches = () => {
    setShowOnboarding(true)
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasVisitedBefore', 'true')
    setIsFirstVisit(false)
    setShowOnboarding(false)
    
    // Load the saved onboarding data
    const savedOnboardingData = localStorage.getItem('onboardingData')
    if (savedOnboardingData) {
      setOnboardingData(JSON.parse(savedOnboardingData))
    }
  }

  const handleEditOnboarding = () => {
    setShowOnboarding(true)
  }

  const toggleSave = (influencerId: string) => {
    setSavedInfluencers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(influencerId)) {
        newSet.delete(influencerId)
      } else {
        newSet.add(influencerId)
      }
      return newSet
    })
  };

  const saveAll = () => {
    setSavedInfluencers(new Set(mockInfluencers.map(inf => inf.id)));
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-8">Bitcoin Influencer</h1>
            <div className="space-y-4">
              <Link 
                href="/login" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 block text-center"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 block text-center"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-20">
        <div className="max-w-2xl w-full text-center">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-12">
            <div className="flex justify-center mb-6">
              <div className="flex space-x-4 text-4xl">
                <span>👥</span>
                <span>📊</span>
                <span>🎯</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Create Your AI List</h2>
            <p className="text-gray-400 mb-8">
              Your personalized creator matches are waiting. Let our AI find the perfect creators for your brand.
            </p>
            
            <button
              onClick={handleGetMatches}
              className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Get Creator Matches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
