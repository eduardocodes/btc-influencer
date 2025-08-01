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

// Mock creators para exibir na Home
const mockCreators: Creator[] = [
  {
    id: 'mock-1',
    full_name: 'Alex Bitcoin',
    username: 'alexbitcoin',
    categories: ['Bitcoin', 'Cryptocurrency', 'Finance'],
    youtube_followers: 245000,
    total_followers: 245000,
    youtube_engagement_rate: 4.2,
    youtube_average_views: 18500,
    location: 'Estados Unidos',
    youtube_url: 'https://youtube.com/@alexbitcoin',
    bio: 'Bitcoin educator and crypto analyst. Helping people understand the future of money 🚀'
  },
  {
    id: 'mock-2',
    full_name: 'Crypto Sarah',
    username: 'cryptosarah',
    categories: ['Cryptocurrency', 'Trading', 'DeFi'],
    youtube_followers: 156000,
    total_followers: 156000,
    youtube_engagement_rate: 5.8,
    youtube_average_views: 12300,
    tiktok_followers: 89000,
    tiktok_engagement_rate: 7.2,
    tiktok_average_views: 25000,
    location: 'Canadá',
    youtube_url: 'https://youtube.com/@cryptosarah',
    tiktok_url: 'https://tiktok.com/@cryptosarah',
    bio: 'Making crypto simple for everyone. Daily market updates and trading tips 📈'
  },
  {
    id: 'mock-3',
    full_name: 'Bitcoin Brasil',
    username: 'bitcoinbrasil',
    categories: ['Bitcoin', 'Blockchain', 'Technology'],
    youtube_followers: 98000,
    total_followers: 98000,
    youtube_engagement_rate: 6.1,
    youtube_average_views: 8900,
    location: 'Brasil',
    youtube_url: 'https://youtube.com/@bitcoinbrasil',
    bio: 'O maior canal de Bitcoin do Brasil. Educação financeira e tecnologia blockchain 🇧🇷'
  },
  {
    id: 'mock-4',
    full_name: 'Tech Crypto',
    username: 'techcrypto',
    categories: ['Technology', 'Blockchain', 'Innovation'],
    youtube_followers: 187000,
    total_followers: 187000,
    youtube_engagement_rate: 3.9,
    youtube_average_views: 15600,
    tiktok_followers: 124000,
    tiktok_engagement_rate: 8.4,
    tiktok_average_views: 32000,
    location: 'Reino Unido',
    youtube_url: 'https://youtube.com/@techcrypto',
    tiktok_url: 'https://tiktok.com/@techcrypto',
    bio: 'Exploring the intersection of technology and finance. Blockchain developer and educator 💻'
  },
  {
    id: 'mock-5',
    full_name: 'Crypto Insights',
    username: 'cryptoinsights',
    categories: ['Finance', 'Investment', 'Market Analysis'],
    youtube_followers: 312000,
    total_followers: 312000,
    youtube_engagement_rate: 4.7,
    youtube_average_views: 22100,
    location: 'Austrália',
    youtube_url: 'https://youtube.com/@cryptoinsights',
    bio: 'Professional crypto analyst with 10+ years in traditional finance. Weekly market reports 📊'
  },
  {
    id: 'mock-6',
    full_name: 'Digital Money',
    username: 'digitalmoney',
    categories: ['Digital Currency', 'Economics', 'Future Tech'],
    youtube_followers: 134000,
    total_followers: 134000,
    youtube_engagement_rate: 5.3,
    youtube_average_views: 9800,
    tiktok_followers: 67000,
    tiktok_engagement_rate: 9.1,
    tiktok_average_views: 18500,
    location: 'Alemanha',
    youtube_url: 'https://youtube.com/@digitalmoney',
    tiktok_url: 'https://tiktok.com/@digitalmoney',
    bio: 'Exploring the future of digital currencies and their impact on society 🌍'
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

  const handleDatabaseClick = () => {
    router.push('/database')
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
        <p>Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-600/50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <span className="text-xl font-bold">⊕</span>
                <span className="ml-2 text-sm text-gray-300">Bitcoin Influencer</span>
              </div>
              
              <nav className="flex space-x-6">
                <a href="#" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">Matches</a>
                <a href="/database" onClick={handleDatabaseClick} className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium cursor-pointer">Database</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-orange-500 text-sm">⚡ Full Access</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Logout
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
            <p className="text-gray-400">Loading your matches...</p>
          </div>
        </div>
      ) : matchedCreators.length > 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span>🔥</span> <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Your Creator Matches</span>
            </h1>
            <p className="text-gray-400">Creators that match your product</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const combinedCreators = [...matchedCreators, ...mockCreators];
              const selectedNiches = onboardingData?.productCategory && Array.isArray(onboardingData.productCategory)
                ? onboardingData.productCategory
                : typeof onboardingData?.productCategory === 'string'
                  ? onboardingData.productCategory.split(',').map((niche: string) => niche.trim()).filter(Boolean)
                  : [];
              
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
              
              const mockNiches = ['Bitcoin', 'Cryptocurrency'];
              
              return combinedCreators.slice(0, 6).map((creator) => {
                const isRealMatch = matchedCreators.some(mc => mc.id === creator.id);
                const matchingNiches = isRealMatch 
                  ? getMatchingNiches(creator.categories, searchCriteria)
                  : getMatchingNiches(creator.categories, mockNiches);
                
                return (
                  <div key={creator.id} className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 border border-gray-600/50 shadow-2xl shadow-black/50 backdrop-blur-sm hover:border-orange-500 hover:scale-110 hover:-translate-y-2 hover:shadow-3xl hover:z-10 transition-all duration-300 cursor-pointer">
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
              });
            })()}
            
            {/* Mock Blurred Results */}
            {[...Array(6)].map((_, index) => (
              <div key={`mock-blurred-${index}`} className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 border border-gray-600/50 shadow-2xl shadow-black/50 backdrop-blur-sm relative overflow-hidden">
                {/* Blur overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/5 z-10"></div>
                
                {/* Mock content */}
                <div className="relative">
                  {/* Creator Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-6 bg-white/20 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-white/15 rounded mb-2 w-1/2"></div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-5 bg-gray-700 rounded w-20"></div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    <div className="h-3 bg-white/15 rounded mb-1 w-full"></div>
                    <div className="h-3 bg-white/15 rounded w-3/4"></div>
                  </div>

                  {/* Categories */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      <div className="h-6 bg-orange-500/30 rounded w-16"></div>
                      <div className="h-6 bg-gray-700 rounded w-20"></div>
                      <div className="h-6 bg-gray-700 rounded w-14"></div>
                    </div>
                  </div>

                  {/* Platform Stats */}
                  <div className="space-y-3 mb-4">
                    {/* YouTube Stats */}
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-red-500/50 rounded"></div>
                        <div className="h-4 bg-white/20 rounded w-16"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-white/20 rounded w-12 mb-1"></div>
                        <div className="h-3 bg-white/15 rounded w-10"></div>
                      </div>
                    </div>

                    {/* TikTok Stats */}
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-pink-500/50 rounded"></div>
                        <div className="h-4 bg-white/20 rounded w-14"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-white/20 rounded w-12 mb-1"></div>
                        <div className="h-3 bg-white/15 rounded w-10"></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 rounded shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 transform transition-all duration-300 cursor-pointer"></div>
                    <div className="flex-1 h-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 rounded shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-105 transform transition-all duration-300 cursor-pointer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA Section */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/30">
              <div className="mb-4">
                <span className="text-4xl mb-4 block">🔒</span>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Preview Only - Subscribe to Unlock More
                </h3>
                <p className="text-white/70 mb-6">
                   Get access to hundreds of high-quality content creators that match your product.
                 </p>
              </div>
              
              <div className="flex justify-center items-center">
                <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105">
                  Upgrade to Pro
                </button>
              </div>
              
              <div className="mt-6 flex justify-center items-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Unlimited searches</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Contact information</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Advanced filters</span>
                </div>
              </div>
            </div>
          </div>


        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <div className="max-w-2xl w-full">
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl p-12 border border-gray-600/50 shadow-2xl shadow-black/50 backdrop-blur-sm">
                <div className="flex justify-center mb-6">
                  <div className="flex space-x-4 text-4xl">
                    <span>👥</span>
                    <span>📊</span>
                    <span>🎯</span>
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold mb-6">
                  <span>🔥</span> <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Find Your Perfect Crypto Influencers</span>
                </h1>
                <p className="text-gray-400 text-lg mb-8">
                  Get matched with the most relevant crypto content creators for your brand in seconds.
                </p>
                
                <button
                  onClick={handleGetMatches}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 transform transition-all duration-300 mb-8"
                >
                  Get My Matches
                </button>
                
                <div className="text-sm text-gray-500">
                  <p>✓ 100+ verified crypto influencers</p>
                  <p>✓ Real-time engagement metrics</p>
                  <p>✓ Instant matching algorithm</p>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={testLoadMatches}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:from-gray-500 hover:to-gray-600 transition-all duration-300"
                  >
                    🧪 Test Load Matches
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mock Creators Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCreators.slice(0, 6).map((creator) => (
              <div key={creator.id} className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 border border-gray-600/50 shadow-2xl shadow-black/50 backdrop-blur-sm relative overflow-hidden hover:scale-110 hover:-translate-y-2 hover:shadow-3xl hover:z-10 transition-all duration-300 cursor-pointer">
                {/* Blur overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/5 z-10"></div>
                
                {/* Mock content */}
                <div className="relative">
                  {/* Creator Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-6 bg-white/20 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-white/15 rounded mb-2 w-1/2"></div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-5 bg-gray-700 rounded w-20"></div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    <div className="h-3 bg-white/15 rounded mb-1 w-full"></div>
                    <div className="h-3 bg-white/15 rounded w-3/4"></div>
                  </div>

                  {/* Categories */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      <div className="h-6 bg-orange-500/50 rounded w-16"></div>
                      <div className="h-6 bg-gray-700 rounded w-20"></div>
                      <div className="h-6 bg-gray-700 rounded w-12"></div>
                    </div>
                  </div>

                  {/* Platform Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-red-500/50 rounded"></div>
                        <div className="h-4 bg-white/20 rounded w-16"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-white/20 rounded w-12 mb-1"></div>
                        <div className="h-3 bg-white/15 rounded w-10"></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-red-600/50 rounded"></div>
                    <div className="flex-1 h-8 bg-gray-700/50 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
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
