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

interface Creator {
  id: string;
  full_name: string;
  username: string;
  categories: string[];
  youtube_followers: number;
  total_followers: number;
  youtube_engagement_rate: number;
  youtube_average_views: number;
  tiktok_followers?: number;
  tiktok_engagement_rate?: number;
  tiktok_average_views?: number;
  location: string;
  youtube_url: string;
  tiktok_url?: string;
  bio: string;
}

interface UserMatch {
  id: string;
  user_id: string;
  onboarding_answer_id: string;
  search_criteria: string[];
  creator_ids: string[];
  created_at: string;
}

interface OnboardingData {
  id: string;
  user_id: string;
  company_name: string;
  product_name: string;
  product_url: string;
  product_description: string;
  product_category: string;
  is_bitcoin_suitable: boolean;
  created_at: string;
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
  const [userMatches, setUserMatches] = useState<UserMatch[]>([])
  const [matchedCreators, setMatchedCreators] = useState<Creator[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const influencersPerPage = 6

  // Utility functions from search results page
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const getCountryFlag = (location: string) => {
    if (!location) return '🌍';
    
    const normalizedLocation = location.toLowerCase().trim();
    
    const countryFlags: { [key: string]: string } = {
      'austrália': '🇦🇺', 'australia': '🇦🇺', 'au': '🇦🇺',
      'bangladesh': '🇧🇩', 'bd': '🇧🇩',
      'bélgica': '🇧🇪', 'belgium': '🇧🇪', 'be': '🇧🇪',
      'brasil': '🇧🇷', 'brazil': '🇧🇷', 'br': '🇧🇷',
      'canada': '🇨🇦', 'canadá': '🇨🇦', 'ca': '🇨🇦',
      'alemanha': '🇩🇪', 'germany': '🇩🇪', 'de': '🇩🇪',
      'espanha': '🇪🇸', 'spain': '🇪🇸', 'es': '🇪🇸',
      'reino unido': '🇬🇧', 'united kingdom': '🇬🇧', 'uk': '🇬🇧', 'gb': '🇬🇧', 'england': '🇬🇧', 'inglaterra': '🇬🇧',
      'hong kong': '🇭🇰', 'hk': '🇭🇰',
      'indonésia': '🇮🇩', 'indonesia': '🇮🇩', 'id': '🇮🇩',
      'índia': '🇮🇳', 'india': '🇮🇳', 'in': '🇮🇳',
      'lituânia': '🇱🇹', 'lithuania': '🇱🇹', 'lt': '🇱🇹',
      'nigéria': '🇳🇬', 'nigeria': '🇳🇬', 'ng': '🇳🇬',
      'holanda': '🇳🇱', 'netherlands': '🇳🇱', 'nl': '🇳🇱',
      'peru': '🇵🇪', 'pe': '🇵🇪',
      'filipinas': '🇵🇭', 'philippines': '🇵🇭', 'ph': '🇵🇭',
      'suécia': '🇸🇪', 'sweden': '🇸🇪', 'se': '🇸🇪',
      'eslovênia': '🇸🇮', 'slovenia': '🇸🇮', 'si': '🇸🇮',
      'estados unidos': '🇺🇸', 'united states': '🇺🇸', 'usa': '🇺🇸', 'us': '🇺🇸', 'america': '🇺🇸',
      'uruguai': '🇺🇾', 'uruguay': '🇺🇾', 'uy': '🇺🇾'
    };
    
    return countryFlags[normalizedLocation] || '🌍';
  };

  const getPlatformData = (platform: string) => {
    const platforms = {
      youtube: {
        icon: <span className="text-red-500">▶️</span>,
        color: 'red'
      },
      tiktok: {
        icon: <span className="text-pink-500">🎵</span>,
        color: 'pink'
      }
    };
    return platforms[platform as keyof typeof platforms] || platforms.youtube;
  };

  const getMatchingNiches = (creatorCategories: string[], selectedNiches: string[]) => {
    return creatorCategories.filter(category => 
      selectedNiches.some(niche => 
        category.toLowerCase().includes(niche.toLowerCase()) ||
        niche.toLowerCase().includes(category.toLowerCase())
      )
    );
  };

  // Load user matches from database
  const loadUserMatches = async (forceUserId?: string) => {
    const userId = forceUserId || user?.id;
    
    if (!userId) {
      console.log('❌ [DEBUG] Usuário não está logado e nenhum ID foi fornecido');
      return;
    }
    
    try {
      setLoadingMatches(true);
      console.log('🔍 [DEBUG] Carregando matches do usuário:', userId);
      
      const { data, error } = await supabase
        .from('user_matches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ [DEBUG] Erro ao carregar matches:', error);
        return;
      }

      console.log('✅ [DEBUG] Matches carregados - Raw data:', data);
      console.log('✅ [DEBUG] Matches carregados - Length:', data?.length);
      console.log('✅ [DEBUG] Matches carregados - First item:', data?.[0]);
      
      setUserMatches(data || []);
      
      // Load creators if we have matches
      if (data && data.length > 0 && data[0].creator_ids) {
        console.log('👥 [DEBUG] Creator IDs encontrados:', data[0].creator_ids);
        await loadMatchedCreators(data[0].creator_ids);
      } else {
        console.log('❌ [DEBUG] Nenhum creator_ids encontrado ou data vazio');
      }
      
    } catch (err) {
      console.error('❌ [DEBUG] Erro inesperado ao carregar matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Test function to load matches for specific user
  const testLoadMatches = () => {
    console.log('🧪 [TEST] Forçando carregamento de matches para usuário de teste');
    loadUserMatches('4bb65f1f-b724-47b2-b5b2-136a56acdb16');
  };

  // Load creators data based on IDs
  const loadMatchedCreators = async (creatorIds: string[]) => {
    try {
      console.log('👥 [DEBUG] Carregando dados dos criadores:', creatorIds);
      
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .in('id', creatorIds);

      if (error) {
        console.error('❌ [DEBUG] Erro ao carregar criadores:', error);
        return;
      }

      console.log('✅ [DEBUG] Criadores carregados:', data);
      setMatchedCreators(data || []);
      
    } catch (err) {
      console.error('❌ [DEBUG] Erro inesperado ao carregar criadores:', err);
    }
  };

  useEffect(() => {
    const loadOnboardingData = async () => {
      console.log('🔄 [DEBUG] useEffect executado - user:', user);
      console.log('🔄 [DEBUG] user?.id:', user?.id);
      
      const hasVisited = localStorage.getItem('hasVisitedBefore')
      const savedOnboardingData = localStorage.getItem('onboardingData')
      
      // Try to load from Supabase if user is authenticated
      if (user) {
        console.log('✅ [DEBUG] Usuário está logado, carregando dados...');
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
              productCategory: data.product_category, // garantir que product_category seja salvo
              completedAt: data.created_at
            }
            setOnboardingData(supabaseData)
            localStorage.setItem('onboardingData', JSON.stringify(supabaseData))
            localStorage.setItem('hasVisitedBefore', 'true')
            setIsFirstVisit(false)
            
            // Load user matches after onboarding data is loaded
            await loadUserMatches()
            return
          }
        } catch (error) {
          console.log('Could not load from Supabase:', error)
        }
        
        // If no onboarding data but user is logged in, still check for matches
        await loadUserMatches()
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
      {loadingMatches ? (
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando seus matches...</p>
          </div>
        </div>
      ) : matchedCreators.length > 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Seus Creator Matches</h1>
            <p className="text-gray-400">Criadores que deram match com seu produto</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedCreators.map((creator) => {
              const selectedNiches = onboardingData?.productCategory && Array.isArray(onboardingData.productCategory)
                ? onboardingData.productCategory
                : typeof onboardingData?.productCategory === 'string'
                  ? onboardingData.productCategory.split(',').map((niche: string) => niche.trim()).filter(Boolean)
                  : [];
              console.log('[DEBUG] onboardingData.productCategory:', onboardingData?.productCategory, 'selectedNiches:', selectedNiches, 'typeof:', typeof selectedNiches);
              
              // Parse search_criteria se for string JSON, senão use selectedNiches
              let searchCriteria = selectedNiches;
              if (userMatches[0]?.search_criteria) {
                try {
                  searchCriteria = typeof userMatches[0].search_criteria === 'string' 
                    ? JSON.parse(userMatches[0].search_criteria)
                    : userMatches[0].search_criteria;
                } catch (e) {
                  console.error('Erro ao fazer parse de search_criteria:', e);
                  searchCriteria = selectedNiches;
                }
              }
              
              console.log('[DEBUG] searchCriteria final:', searchCriteria, 'typeof:', typeof searchCriteria);
              const matchingNiches = getMatchingNiches(creator.categories, searchCriteria);
              
              return (
                <div key={creator.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-orange-500 transition-colors">
                  {/* Creator Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{creator.full_name}</h3>
                      <p className="text-gray-400 text-sm mb-2">@{creator.username}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                          {getCountryFlag(creator.location)} {creator.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{creator.bio}</p>

                  {/* Categories */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {creator.categories.slice(0, 3).map((category, index) => (
                        <span 
                          key={index} 
                          className={`text-xs px-2 py-1 rounded ${
                            matchingNiches.includes(category)
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {category}
                        </span>
                      ))}
                      {creator.categories.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                          +{creator.categories.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Platform Stats */}
                  <div className="space-y-3 mb-4">
                    {/* YouTube Stats */}
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                      <div className="flex items-center gap-2">
                        {getPlatformData('youtube').icon}
                        <span className="text-sm font-medium">YouTube</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatNumber(creator.youtube_followers)}</div>
                        <div className="text-xs text-gray-400">{creator.youtube_engagement_rate}% eng</div>
                      </div>
                    </div>

                    {/* TikTok Stats (if available) */}
                    {creator.tiktok_followers && (
                      <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                        <div className="flex items-center gap-2">
                          {getPlatformData('tiktok').icon}
                          <span className="text-sm font-medium">TikTok</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{formatNumber(creator.tiktok_followers)}</div>
                          <div className="text-xs text-gray-400">{creator.tiktok_engagement_rate}% eng</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <a
                      href={creator.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded text-center transition-colors"
                    >
                      YouTube
                    </a>
                    {creator.tiktok_url && (
                      <a
                        href={creator.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded text-center transition-colors"
                      >
                        TikTok
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleGetMatches}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Refazer Busca
            </button>
            <Link
              href="/search/results"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver Todos os Resultados
            </Link>
          </div>
        </div>
      ) : (
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
              
              <div className="flex gap-4">
                <button
                  onClick={handleGetMatches}
                  className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Get Creator Matches
                </button>
                
                <button
                  onClick={testLoadMatches}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  🧪 Test Load Matches
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Remover completamente o trecho abaixo do final do arquivo:
// const selectedNiches = onboardingData?.productCategory && Array.isArray(onboardingData.productCategory)
//   ? onboardingData.productCategory
//   : typeof onboardingData?.productCategory === 'string'
//     ? onboardingData.productCategory.split(',').map((niche: string) => niche.trim()).filter(Boolean)
//     : [];
