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
  const { user } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const getMatchingNiches = (creatorCategories: string[], selectedNiches: string[]) => {
    return creatorCategories.filter(category => 
      selectedNiches.some(niche => 
        category.toLowerCase().includes(niche.toLowerCase()) ||
        niche.toLowerCase().includes(category.toLowerCase())
      )
    );
  };

  const loadOnboardingData = async () => {
    if (!user) return;

    try {
      console.log('Loading onboarding data for user:', user.id);
      
      const { data, error } = await supabase
        .from('onboarding_answers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading onboarding data:', error);
        setError('Failed to load search criteria');
        return;
      }

      console.log('Onboarding data loaded:', data);
      setOnboardingData(data);
      
      // Parse categories from the onboarding data
      const categories = data.product_category ? data.product_category.split(', ').map((cat: string) => cat.trim()) : [];
      console.log('Parsed categories for search:', categories);
      
      // Search for creators using the new API
      await searchCreators(categories);
      
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    }
  };

  const searchCreators = async (categories: string[]) => {
    try {
      console.log('Searching creators with categories:', categories);
      
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
      console.log('API response:', data);
      
      setCreators(data.creators || []);
      
    } catch (err) {
      console.error('Error searching creators:', err);
      setError('Failed to search creators');
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await loadOnboardingData();
      setLoading(false);
    };

    if (user) {
      initializeData();
    }
  }, [user]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading your personalized results...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Search Results
          </h1>
          {onboardingData && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-white mb-2">
                Results for: {onboardingData.product_name}
              </h2>
              <p className="text-white/80 mb-4">
                {onboardingData.product_description}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {onboardingData.product_category.split(', ').map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-sm"
                  >
                    {category.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-white/80 text-center">
            Found {creators.length} creators matching your criteria
          </p>
        </div>

        {/* Results Grid */}
        {creators.length === 0 ? (
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
              className="px-6 py-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
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
              
              {/* Mock Blurred Results */}
               {[...Array(6)].map((_, index) => (
                <div key={`mock-${index}`} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 relative overflow-hidden">
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
                          {85 + Math.floor(Math.random() * 15)}% match
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
                          className="bg-blue-400 h-2 rounded-full"
                          style={{ width: `${30 + Math.random() * 50}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Matching Categories */}
                    <div className="mb-4">
                      <p className="text-white/60 text-xs mb-2">Matching niches:</p>
                      <div className="flex flex-wrap gap-1">
                        <div className="h-6 bg-blue-500/30 rounded w-16"></div>
                        <div className="h-6 bg-blue-500/30 rounded w-20"></div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="mb-4">
                      <div className="h-3 bg-white/15 rounded mb-1 w-full"></div>
                      <div className="h-3 bg-white/15 rounded w-3/4"></div>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-red-600/50 rounded-lg"></div>
                      <div className="flex-1 h-8 bg-white/20 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* CTA Section */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="mb-4">
                  <span className="text-4xl mb-4 block">🔒</span>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Preview Only - Subscribe to Unlock More
                  </h3>
                  <p className="text-white/70 mb-6">
                     Get access to {creators.length > 6 ? creators.length - 6 + 6 : 6}+ additional high-quality creators matching your product
                   </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105">
                    Upgrade to Pro
                  </button>
                  <button className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                    Learn More
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
          </>
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