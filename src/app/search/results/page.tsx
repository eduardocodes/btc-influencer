'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../utils/supabase';
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
  location: string;
  youtube_url: string;
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
  const { user, isLoading } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log('User:', user?.id)
  if (!isLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="mb-8">Please log in to see your creator matches.</p>
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Go to Login
        </Link>
      </div>
    );
  }

  useEffect(() => {
    console.log('🔍 [DEBUG] Results page effect triggered. isLoading:', isLoading, 'user:', !!user);

    if (isLoading) {
      console.log('🔍 [DEBUG] Still loading authentication state, waiting...');
      return;
    }
    const loadOnboardingData = async () => {
      console.log('🔍 [DEBUG] loadOnboardingData called.');
      if (!user) {
        console.error('❌ [DEBUG] No user found');
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 [DEBUG] Loading onboarding data for user:', user.id);
        
        const { data, error } = await supabase
          .from('onboarding_answers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('❌ [DEBUG] Error loading onboarding data from Supabase:', error);
          setError('Failed to load onboarding data');
          setLoading(false);
          return;
        }

        if (!data) {
          console.error('❌ [DEBUG] No onboarding data found for user in Supabase');
          setError('No onboarding data found');
          setLoading(false);
          return;
        }

        console.log('✅ [DEBUG] Successfully loaded onboarding data:', data);
        console.log('🔍 [DEBUG] Raw product_category from data:', data.product_category);
        
        setOnboardingData(data);
        
        // Convert product_category string to array (robust split)
        let selectedNiches: string[] = [];
        if (data.product_category) {
          selectedNiches = data.product_category.includes(', ')
            ? data.product_category.split(',').map((niche: string) => niche.trim())
            : [data.product_category.trim()];
        }
        console.log('✅ [DEBUG] Parsed niches to search:', selectedNiches);
        
        if (selectedNiches.length > 0) {
          searchCreators(selectedNiches);
        } else {
          console.warn('⚠️ [DEBUG] No niches to search. searchCreators will not be called.');
          setCreators([]);
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ [DEBUG] Catch block error:', err);
        setError('An error occurred while loading data');
        setLoading(false);
      }
    };

    loadOnboardingData();
  }, [user, isLoading]);

  const searchCreators = async (selectedNiches: string[]) => {
    console.log('🔍 [DEBUG] searchCreators called with:', selectedNiches);
    console.log('🔍 [DEBUG] selectedNiches is array:', Array.isArray(selectedNiches));
    
    if (!selectedNiches || selectedNiches.length === 0) {
      console.log('🔍 [DEBUG] No niches selected, setting empty creators');
      setCreators([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 [DEBUG] Calling API to search creators for categories:', selectedNiches);
      
      const response = await fetch('/api/creators/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories: selectedNiches }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('🔍 [DEBUG] API response:');
      console.log('🔍 [DEBUG] - Creators count:', result.creators?.length || 0);
      console.log('🔍 [DEBUG] - First 3 results:', result.creators?.slice(0, 3) || []);

      if (result.error) {
        console.error('🚨 [DEBUG] API error:', result.error);
        setError('Failed to fetch creators');
        return;
      }

      const processedData = result.creators?.map((creator: any) => ({
        ...creator,
        categories: creator.categories || []
      })) || [];
      
      console.log('🔍 [DEBUG] Processed data length:', processedData.length);
      console.log('🔍 [DEBUG] Sample processed creator:', processedData[0]);
      
      setCreators(processedData);
    } catch (err) {
      console.error('🚨 [DEBUG] Exception in searchCreators:', err);
      setError('An error occurred while searching for creators');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | null | undefined) => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getMatchingNiches = (creatorCategories: string[] | null | undefined, selectedNiches: string[] | null | undefined) => {
    if (!creatorCategories || !selectedNiches) return [];
    return creatorCategories.filter(cat => selectedNiches.includes(cat));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading creators...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-red-300">{error}</p>
          <button 
            onClick={() => window.location.href = '/onboarding'}
            className="mt-4 px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            Back to Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Creator Matches
          </h1>
          <p className="text-white/70 mb-4">
            Found {creators.length} creators matching your product: <span className="font-semibold">{onboardingData?.product_name}</span>
          </p>
          
          {onboardingData?.product_category && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="text-white/60 text-sm">Target niches:</span>
              {onboardingData.product_category.split(', ').map((niche: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/20 rounded-full text-white text-sm"
                >
                  {niche.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {creators.length === 0 ? (
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No creators found</h3>
            <p className="text-white/70 mb-6">
              We couldn't find creators matching your selected niches. Try adjusting your target niches.
            </p>
            <button 
              onClick={() => window.location.href = '/onboarding'}
              className="px-6 py-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              Adjust Search Criteria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => {
              const creatorCategories = creator.categories || [];
              const selectedNiches = onboardingData?.product_category ? onboardingData.product_category.split(', ').map((niche: string) => niche.trim()) : [];
              const matchingNiches = getMatchingNiches(creatorCategories, selectedNiches);
              const matchScore = Math.round((matchingNiches.length / (selectedNiches.length || 1)) * 100);
              
              return (
                <div key={creator.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-colors">
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
                          📍 {creator.location}
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
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {formatNumber(creator.youtube_followers)}
                      </div>
                      <div className="text-white/60 text-xs">YouTube Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {formatNumber(creator.youtube_average_views)}
                      </div>
                      <div className="text-white/60 text-xs">Avg Views</div>
                    </div>
                  </div>

                  {/* Engagement */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">Engagement Rate</span>
                      <span className="text-white">{((creator.youtube_engagement_rate || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full"
                        style={{ width: `${Math.min((creator.youtube_engagement_rate || 0) * 100, 100)}%` }}
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
                          className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded text-xs"
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
                  <div className="flex gap-2">
                    {creator.youtube_url && (
                      <a
                        href={creator.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-2 px-4 rounded-lg text-sm transition-colors"
                      >
                        View YouTube
                      </a>
                    )}
                    <button className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                      Contact
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => window.location.href = '/onboarding'}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            New Search
          </button>
        </div>
      </div>
    </div>
  );
}