'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import PlansModal from '@/src/components/PlansModal';
import { trackSearch, trackInfluencerView, trackPageView } from '@/src/lib/analytics';

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
  x_url?: string;
  insta_url?: string;
  bio: string;
  isFallback?: boolean;
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

export default function SearchResultsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchingCreators, setSearchingCreators] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchExecutedRef = useRef<string | null>(null); // Track if search was executed for current onboarding data
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);

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
      // Austrália
      'austrália': '🇦🇺',
      'australia': '🇦🇺',
      'au': '🇦🇺',
      // Bangladesh
      'bangladesh': '🇧🇩',
      'bd': '🇧🇩',
      // Bélgica
      'bélgica': '🇧🇪',
      'belgium': '🇧🇪',
      'be': '🇧🇪',
      // Brasil
      'brasil': '🇧🇷',
      'brazil': '🇧🇷',
      'br': '🇧🇷',
      // Canadá
      'canada': '🇨🇦',
      'canadá': '🇨🇦',
      'ca': '🇨🇦',
      // Alemanha
      'alemanha': '🇩🇪',
      'germany': '🇩🇪',
      'de': '🇩🇪',
      // Espanha
      'espanha': '🇪🇸',
      'spain': '🇪🇸',
      'es': '🇪🇸',
      // Reino Unido
      'reino unido': '🇬🇧',
      'united kingdom': '🇬🇧',
      'uk': '🇬🇧',
      'gb': '🇬🇧',
      'england': '🇬🇧',
      'inglaterra': '🇬🇧',
      // Hong Kong
      'hong kong': '🇭🇰',
      'hk': '🇭🇰',
      // Indonésia
      'indonésia': '🇮🇩',
      'indonesia': '🇮🇩',
      'id': '🇮🇩',
      // Índia
      'índia': '🇮🇳',
      'india': '🇮🇳',
      'in': '🇮🇳',
      // Lituânia
      'lituânia': '🇱🇹',
      'lithuania': '🇱🇹',
      'lt': '🇱🇹',
      // Nigéria
      'nigéria': '🇳🇬',
      'nigeria': '🇳🇬',
      'ng': '🇳🇬',
      // Holanda
      'holanda': '🇳🇱',
      'netherlands': '🇳🇱',
      'nl': '🇳🇱',
      // Peru
      'peru': '🇵🇪',
      'pe': '🇵🇪',
      // Filipinas
      'filipinas': '🇵🇭',
      'philippines': '🇵🇭',
      'ph': '🇵🇭',
      // Suécia
      'suécia': '🇸🇪',
      'sweden': '🇸🇪',
      'se': '🇸🇪',
      // Eslovênia
      'eslovênia': '🇸🇮',
      'slovenia': '🇸🇮',
      'si': '🇸🇮',
      // Estados Unidos
      'estados unidos': '🇺🇸',
      'united states': '🇺🇸',
      'usa': '🇺🇸',
      'us': '🇺🇸',
      'america': '🇺🇸',
      // Uruguai
      'uruguai': '🇺🇾',
      'uruguay': '🇺🇾',
      'uy': '🇺🇾'
    };
    
    return countryFlags[normalizedLocation] || '🌍';
  };

  const getMatchingNiches = (creatorCategories: string[], selectedNiches: string[]) => {
    return creatorCategories.filter(category => 
      selectedNiches.some(niche => 
        category.toLowerCase().includes(niche.toLowerCase()) ||
        niche.toLowerCase().includes(category.toLowerCase())
      )
    );
  };

  const getPlatformData = (creator: Creator) => {
    // Prioriza YouTube se tiver URL, usa TikTok como fallback se tiver URL
    if (creator.youtube_url && creator.youtube_followers) {
      return {
        platform: 'youtube',
        url: creator.youtube_url,
        followers: creator.youtube_followers,
        engagement_rate: creator.youtube_engagement_rate,
        average_views: creator.youtube_average_views,
        color: 'red',
        name: 'YouTube'
      };
    } else if (creator.tiktok_url && creator.tiktok_followers) {
      return {
        platform: 'tiktok',
        url: creator.tiktok_url,
        followers: creator.tiktok_followers,
        engagement_rate: creator.tiktok_engagement_rate,
        average_views: creator.tiktok_average_views,
        color: 'pink',
        name: 'TikTok'
      };
    }
    return null;
  };

  const getSocialMediaPlatforms = (creator: Creator) => {
    const platforms = [];
    
    if (creator.youtube_url) {
      platforms.push({
        platform: 'youtube',
        url: creator.youtube_url,
        name: 'YouTube',
        color: 'from-red-500 to-red-600 hover:from-red-400 hover:to-red-500',
        shadowColor: 'shadow-red-500/25 hover:shadow-red-500/40'
      });
    }
    
    if (creator.tiktok_url) {
      platforms.push({
        platform: 'tiktok',
        url: creator.tiktok_url,
        name: 'TikTok',
        color: 'from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500',
        shadowColor: 'shadow-gray-500/25 hover:shadow-gray-500/40'
      });
    }
    
    if (creator.x_url) {
      platforms.push({
        platform: 'twitter',
        url: creator.x_url,
        name: 'Twitter',
        color: 'from-gray-800 to-black hover:from-gray-700 hover:to-gray-900',
        shadowColor: 'shadow-gray-500/25 hover:shadow-gray-500/40'
      });
    }
    
    if (creator.insta_url) {
      platforms.push({
        platform: 'instagram',
        url: creator.insta_url,
        name: 'Instagram',
        color: 'from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400',
        shadowColor: 'shadow-purple-500/25 hover:shadow-purple-500/40'
      });
    }
    
    return platforms;
  };

  const loadOnboardingData = async () => {
    if (!user) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('onboarding_answers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao carregar dados de onboarding:', error);
        setError('Failed to load search criteria');
        return;
      }

      setOnboardingData(data);
      
    } catch (err) {
        console.error('Erro inesperado em loadOnboardingData:', err);
        setError('An unexpected error occurred');
    }
  };

  const saveUserMatches = async (creators: Creator[], categories: string[], onboardingAnswerId: string) => {
    if (!user?.id) {
      console.error('User ID não encontrado');
      return;
    }

    try {
      // Preparar dados para envio à API
      const matchData = {
        user_id: user.id,
        creator_ids: creators.map(c => c.id),
        search_criteria: categories,
        onboarding_answer_id: onboardingAnswerId
      };

      // Fazer requisição para a API route
      const response = await fetch('/api/user-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro da API ao salvar:', {
          status: response.status,
          error: errorData
        });
        return;
      }

      const result = await response.json();
    } catch (err) {
      console.error('Erro inesperado ao salvar:', err);
    }
  };

  const searchCreators = async (categories: string[], isBitcoinSuitable: boolean) => {
    console.log('[DEBUG searchCreators] Iniciando busca - categorias:', categories, 'isBitcoinSuitable:', isBitcoinSuitable);
    try {
      setSearchingCreators(true);
      let foundCreators: Creator[] = [];

      try {
        const response = await fetch('/api/creators/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ categories, is_bitcoin_suitable: isBitcoinSuitable }),
        });

        if (!response.ok) {
          throw new Error('Failed to search creators');
        }

        const data = await response.json();
        foundCreators = data.creators || [];
        console.log('[DEBUG searchCreators] Busca principal bem-sucedida, encontrados:', foundCreators.length, 'criadores');
      } catch (searchError) {
        console.error('[DEBUG searchCreators] Erro na busca principal, tentando fallback Bitcoin-only:', searchError);
        // Se a busca principal falhar, tentar diretamente o fallback Bitcoin-only
        try {
          const fallbackResponse = await fetch('/api/creators/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ categories: [], is_bitcoin_suitable: true }),
          });
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            foundCreators = (fallbackData.creators || []).map((creator: Creator) => ({ ...creator, isFallback: true }));
            console.log('[DEBUG searchCreators] Fallback interno bem-sucedido, encontrados:', foundCreators.length, 'criadores Bitcoin-only');
          } else {
            console.error('[DEBUG searchCreators] Fallback interno falhou com status:', fallbackResponse.status);
          }
        } catch (fallbackError) {
          console.error('[searchCreators] Erro no fallback Bitcoin-only:', fallbackError);
          foundCreators = [];
        }
      }

      // Fallback logic: if less than 6 creators, fetch Bitcoin-only creators
      console.log('[DEBUG searchCreators] Verificando se precisa de fallback adicional. Criadores encontrados:', foundCreators.length);
      if (foundCreators.length < 6) {
        try {
          console.log('[DEBUG searchCreators] Poucos criadores encontrados, buscando fallback adicional is_btc_only');
          const fallbackRes = await fetch('/api/creators/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ categories: [], is_bitcoin_suitable: true }),
          });
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            const fallbackCreators = (fallbackData.creators || []).filter((fallback: Creator) => !foundCreators.some((c: Creator) => c.id === fallback.id)).map((creator: Creator) => ({ ...creator, isFallback: true }));
            foundCreators = [...foundCreators, ...fallbackCreators.slice(0, 6 - foundCreators.length)];
          } else {
            console.error('Fallback fetch failed with status:', fallbackRes.status);
          }
        } catch (fallbackErr) {
          console.error('Error fetching fallback creators:', fallbackErr);
        }
      }

      console.log('[DEBUG searchCreators] Busca finalizada. Total de criadores encontrados:', foundCreators.length);
      console.log('[DEBUG searchCreators] Criadores finais:', foundCreators.map(c => ({ name: c.full_name, isFallback: c.isFallback })));
      setCreators(foundCreators);

      // Salvar os resultados na tabela user_matches
      if (foundCreators.length > 0 && onboardingData && onboardingData.id) {
        await saveUserMatches(foundCreators, categories, onboardingData.id);
      }
    } catch (err) {
      console.error('[DEBUG searchCreators] Erro geral na função searchCreators:', err);
      setError('Failed to search creators');
    } finally {
      setSearchingCreators(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      // Reset search execution flag when user changes
      searchExecutedRef.current = null;
      // Only load if we don't already have onboarding data for this user
      if (!onboardingData || onboardingData.user_id !== user?.id) {
        await loadOnboardingData();
      }
      setLoading(false);
    };

    if (user) {
      initializeData();
      // Track page view
      trackPageView('Search Results');
    }
  }, [user]);

  // Separate useEffect to search creators when onboardingData is available
  useEffect(() => {
    const performSearch = async () => {
      if (onboardingData && searchExecutedRef.current !== onboardingData.id) {
        console.log('[DEBUG] Iniciando busca com onboardingData:', onboardingData);
        
        // Parse categories from the onboarding data
        const categories = onboardingData.product_category ? onboardingData.product_category.split(', ').map((cat: string) => cat.trim()).filter(Boolean) : [];
        console.log('[DEBUG] Categorias parseadas:', categories);
        
        // Se não há categorias válidas, usar fallback Bitcoin-only diretamente
        if (categories.length === 0) {
          console.log('[DEBUG] Nenhuma categoria válida encontrada, usando fallback Bitcoin-only');
          // Mark this onboarding data as processed
          searchExecutedRef.current = onboardingData.id;
          // Search for Bitcoin-only creators directly
          await searchCreators([], true); // Força is_bitcoin_suitable = true
          // Track search event
          trackSearch('fallback-bitcoin-only');
          return;
        }
        
        console.log('[DEBUG] Categorias válidas encontradas, prosseguindo com busca normal');
        // Mark this onboarding data as processed
        searchExecutedRef.current = onboardingData.id;
        // Search for creators using the new API
        await searchCreators(categories, onboardingData.is_bitcoin_suitable);
        // Track search event
        trackSearch(categories.join(', '));
      }
    };

    performSearch();
  }, [onboardingData]); // This will run when onboardingData changes

  if (loading || searchingCreators) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.1),transparent_50%)] pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white">{loading ? 'Loading your personalized results...' : 'Searching for creators...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-white/80 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.1),transparent_50%)] pointer-events-none"></div>
      <div className="relative z-10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Creator Matches
          </h1>
          <p className="text-xl text-white/80 mb-6">
            We found hundreds of creators for {onboardingData?.product_name || 'your product'}
          </p>
          {onboardingData && onboardingData.product_category && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {onboardingData.product_category.split(', ').map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-500/30 text-orange-200 rounded-full text-sm"
                >
                  {category.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results Grid */}
        {creators.length === 0 && !loading && !searchingCreators ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              No creators found
            </h3>
            <p className="text-white/80 mb-6">
              We couldn't find any creators matching your specific criteria. Try adjusting your search parameters.
            </p>
            <button 
              onClick={() => window.location.href = '/onboarding'}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-orange-500/25"
            >
              Adjust Search Criteria
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Real Results - First 6 */}
              {creators.slice(0, 6).map((creator) => {
                const creatorCategories = creator.categories || [];
                const selectedNiches = onboardingData?.product_category ? onboardingData.product_category.split(', ').map((niche: string) => niche.trim()) : [];
                const matchingNiches = getMatchingNiches(creatorCategories, selectedNiches);
                // Calculate match score
                let matchScore = 0;
                if (creator.isFallback) {
                  matchScore = 33;
                } else if (selectedNiches.length > 0) {
                  matchScore = Math.round((matchingNiches.length / selectedNiches.length) * 100);
                }

                const platformData = getPlatformData(creator);
                
                return (
                  <div key={creator.id} className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 backdrop-blur-sm rounded-xl p-6 border border-gray-600/50 shadow-2xl shadow-black/50 hover:border-orange-500 hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                    {/* Creator Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">
                          {creator.full_name}
                        </h3>
                        <p className="text-white/60 text-sm mb-2">
                          {creator.username}
                        </p>
                        {creator.location && (
                          <p className="text-white/50 text-xs">
                            {getCountryFlag(creator.location)} {creator.location}
                          </p>
                        )}
                        {platformData && (
                          <p className="text-white/50 text-xs mt-1">
                            📱 {platformData.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                          {matchScore}% match
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    {platformData ? (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-white font-semibold">
                            {formatNumber(platformData.followers)}
                          </div>
                          <div className="text-white/60 text-xs">{platformData.name} Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">
                            {formatNumber(platformData.average_views || 0)}
                          </div>
                          <div className="text-white/60 text-xs">Avg Views</div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-white/40 font-semibold">N/A</div>
                          <div className="text-white/60 text-xs">Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white/40 font-semibold">N/A</div>
                          <div className="text-white/60 text-xs">Avg Views</div>
                        </div>
                      </div>
                    )}

                    {/* Engagement */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Engagement Rate</span>
                        <span className="text-white">
                          {platformData ? (platformData.engagement_rate || 0).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-orange-400"
                          style={{ width: `${Math.min(platformData?.engagement_rate || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Matching Categories */}
                    <div className="mb-4">
                      <p className="text-white/60 text-xs mb-2">Matching niches:</p>
                      <div className="flex flex-wrap gap-1">
                        {matchingNiches.map((niche) => (
                          <span
                            key={niche}
                            className="px-2 py-1 bg-orange-500/30 text-orange-200 rounded text-xs"
                          >
                            {niche}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bio */}
                    {creator.bio && (
                      <div className="mb-4">
                        <p className="text-white/70 text-sm line-clamp-2">
                          {creator.bio}
                        </p>
                      </div>
                    )}

                    {/* Social Media Buttons */}
                    <div className="space-y-2">
                      {(() => {
                        const socialPlatforms = getSocialMediaPlatforms(creator);
                        
                        if (socialPlatforms.length === 0) {
                          return (
                            <div className="w-full bg-gray-600/50 text-gray-300 text-center py-2 px-4 rounded-lg text-sm cursor-not-allowed">
                              No Social Media
                            </div>
                          );
                        }
                        
                        if (socialPlatforms.length === 1) {
                          const platform = socialPlatforms[0];
                          return (
                             <a
                               href={platform.url}
                               target="_blank"
                               rel="noopener noreferrer"
                               onClick={() => trackInfluencerView(creator.full_name, platform.platform)}
                               className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${platform.color} text-white shadow-lg ${platform.shadowColor} hover:shadow-xl`}
                             >
                               <span>View {platform.name}</span>
                             </a>
                           );
                        }
                        
                        return (
                          <div className="grid grid-cols-2 gap-2">
                            {socialPlatforms.map((platform) => (
                               <a
                                 key={platform.platform}
                                 href={platform.url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 onClick={() => trackInfluencerView(creator.full_name, platform.platform)}
                                 className={`flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs transition-all duration-300 transform hover:scale-105 bg-gradient-to-r ${platform.color} text-white shadow-lg ${platform.shadowColor} hover:shadow-xl`}
                               >
                                 <span>{platform.name}</span>
                               </a>
                             ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
              
              {/* Mock Blurred Results */}
               {[...Array(6)].map((_, index) => (
                <div key={`mock-${index}`} className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 backdrop-blur-sm rounded-xl p-6 border border-gray-600/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                  {/* Blur overlay */}
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/5 z-10"></div>
                  
                  {/* Mock content */}
                  <div className="relative">
                    {/* Creator Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-5 bg-white/20 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-white/15 rounded mb-2 w-1/2"></div>
                        <div className="h-3 bg-white/10 rounded w-1/3"></div>
                      </div>
                      <div className="text-right">
                        <div className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                          90% match
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="h-5 bg-white/20 rounded mb-1"></div>
                        <div className="text-white/60 text-xs">YouTube Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="h-5 bg-white/20 rounded mb-1"></div>
                        <div className="text-white/60 text-xs">Avg Views</div>
                      </div>
                    </div>

                    {/* Engagement */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Engagement Rate</span>
                        <div className="h-4 bg-white/20 rounded w-12"></div>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-orange-400 h-2 rounded-full"
                          style={{ width: '45%' }}
                        ></div>
                      </div>
                    </div>

                    {/* Matching Categories */}
                    <div className="mb-4">
                      <p className="text-white/60 text-xs mb-2">Matching niches:</p>
                      <div className="flex flex-wrap gap-1">
                        <div className="h-6 bg-orange-500/30 rounded w-18"></div>
                        <div className="h-6 bg-orange-500/30 rounded w-18"></div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="mb-4">
                      <div className="h-3 bg-white/15 rounded mb-1 w-full"></div>
                      <div className="h-3 bg-white/15 rounded w-3/4"></div>
                    </div>

                    {/* Action Button */}
                    <div className="flex">
                      <div className="w-full h-8 rounded-lg bg-gray-600/50"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* CTA Section */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 backdrop-blur-sm rounded-2xl p-8 border border-gray-600/50 shadow-2xl shadow-black/50">
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
                  <button className="cursor-pointer px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-400 hover:to-orange-500 transition-all transform hover:scale-105 shadow-lg shadow-orange-500/25" onClick={() => setIsPlansModalOpen(true)}>
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
                    <span>Download full list</span>
                  </div>
                </div>
              </div>
            </div>
            <PlansModal isOpen={isPlansModalOpen} onClose={() => setIsPlansModalOpen(false)} />
          </>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => router.push('/home')}
            className="cursor-pointer px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-orange-500/25"
          >
            New Search
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}