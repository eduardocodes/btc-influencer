'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchLoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Analyzing your product...');

  const messages = [
    'Analyzing your product...',
    'Searching creator database...',
    'Matching with target niches...',
    'Calculating compatibility scores...',
    'Finding your perfect creators...'
  ];

  useEffect(() => {
    let hasNavigated = false;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        
        // Update message based on progress
        if (newProgress >= 20 && newProgress < 40) {
          setCurrentMessage(messages[1]);
        } else if (newProgress >= 40 && newProgress < 60) {
          setCurrentMessage(messages[2]);
        } else if (newProgress >= 60 && newProgress < 80) {
          setCurrentMessage(messages[3]);
        } else if (newProgress >= 80) {
          setCurrentMessage(messages[4]);
        }
        
        // Redirect when complete
        if (newProgress >= 100 && !hasNavigated) {
          hasNavigated = true;
          clearInterval(interval);
          setTimeout(() => {
            router.push('/search/results');
          }, 500);
          return 100;
        }
        
        return newProgress;
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [router, messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Loading Animation */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Finding Your Perfect Creators
          </h1>
          
          <p className="text-white/70 mb-8">
            {currentMessage}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-white/60 text-sm">
          {progress}% complete
        </p>

        {/* Features being analyzed */}
        <div className="mt-12 space-y-3">
          <div className="flex items-center justify-center space-x-2 text-white/60">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Audience compatibility</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-white/60">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <span className="text-sm">Engagement metrics</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-white/60">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <span className="text-sm">Content relevance</span>
          </div>
        </div>
      </div>
    </div>
  );
}