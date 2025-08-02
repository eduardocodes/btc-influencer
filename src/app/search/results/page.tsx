'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

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
    // Prioriza YouTube, usa TikTok como fallback
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
          console.error('❌ [DEBUG] Erro ao carregar dados de onboarding:', error);
          setError('Failed to load search criteria');
        return;
      }


      setOnboardingData(data);
      
    } catch (err) {
        console.error('❌ [DEBUG] Erro inesperado em loadOnboardingData:', err);
        setError('An unexpected error occurred');
    }
  };

  const saveUserMatches = async (creators: Creator[], categories: string[], onboardingAnswerId: string) => {


    if (!user?.id) {
        console.error('❌ [DEBUG] User ID não encontrado');
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
          console.error('❌ [DEBUG] Erro da API ao salvar:', {
            status: response.status,
            error: errorData
          });
          return;
      }

      const result = await response.json();

    } catch (err) {
        console.error('❌ [DEBUG] Erro inesperado ao salvar:', err);
      }
  };

  const searchCreators = async (categories: string[]) => {
    try {
      setSearchingCreators(true);

      
      const response = await fetch('/api/creators/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories }),
      });

      if (!response.ok) {
        throw new Error('Failed to search creators');
      }

      const data = await response.json();
      
      const foundCreators = data.creators || [];
      setCreators(foundCreators);
      

      
      // Salvar os resultados na tabela user_matches
      // onboardingData should be available now since this runs in a separate useEffect
      if (foundCreators.length > 0 && onboardingData && onboardingData.id) {
        await saveUserMatches(foundCreators, categories, onboardingData.id);
      }
      
    } catch (err) {
        console.error('❌ [DEBUG] Erro na busca de creators:', err);
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
    }
  }, [user]);

  // Separate useEffect to search creators when onboardingData is available
  useEffect(() => {
    const performSearch = async () => {
      if (onboardingData && searchExecutedRef.current !== onboardingData.id) {

        
        // Mark this onboarding data as processed
        searchExecutedRef.current = onboardingData.id;
        
        // Parse categories from the onboarding data
        const categories = onboardingData.product_category ? onboardingData.product_category.split(', ').map((cat: string) => cat.trim()) : [];
        
        // Search for creators using the new API
        await searchCreators(categories);
      }
    };

    performSearch();
  }, [onboardingData]); // This will run when onboardingData changes

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to view search results</h1>
          <Link href="/auth" className="text-blue-400 hover:text-blue-300">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

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
          {onboardingData && (
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
                const matchScore = Math.round((matchingNiches.length / (selectedNiches.length || 1)) * 100);
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

                    {/* Action Button */}
                    <div className="flex">
                      {platformData ? (
                        <a
                          href={platformData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full text-center py-2 px-4 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 ${
                            platformData.platform === 'youtube' 
                              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white shadow-lg shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/40'
                          }`}
                        >
                          View {platformData.name}
                        </a>
                      ) : (
                        <div className="w-full bg-gray-600/50 text-gray-300 text-center py-2 px-4 rounded-lg text-sm cursor-not-allowed">
                          No Social Media
                        </div>
                      )}
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
                  <button className="cursor-pointer px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-400 hover:to-orange-500 transition-all transform hover:scale-105 shadow-lg shadow-orange-500/25">
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