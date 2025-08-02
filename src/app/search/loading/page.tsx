'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

export default function SearchLoadingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Analyzing your product...');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analysisStartedRef = useRef(false);
  const analysisInProgressRef = useRef(false);

  const messages = [
    'Analyzing your product...',
    'Searching creator database...',
    'Matching with target niches...',
    'Calculating compatibility scores...',
    'Finding your perfect creators...'
  ];

  // Função para analisar o produto com OpenAI
  const analyzeProduct = async () => {
    // Verificar se já foi iniciada ou está em progresso
    if (!user?.id || analysisComplete || error || analysisStartedRef.current || analysisInProgressRef.current) {
      return;
    }

    // Marcar como iniciada e em progresso
    analysisStartedRef.current = true;
    analysisInProgressRef.current = true;

    try {
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
          const result = await response.json();
          
          // Update localStorage with analysis results
          try {
            const existingData = localStorage.getItem('onboardingData');
            if (existingData) {
              const onboardingData = JSON.parse(existingData);
              onboardingData.selectedNiches = result.analysis?.categories || [];
              onboardingData.keywords = result.analysis?.categories || [];
              localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
            }
          } catch (localStorageError) {
            // Silent error handling
          }
          
          setAnalysisComplete(true);
        } else {
          setError('Analysis failed');
        }
      } catch (err) {
        setError('Analysis error');
      } finally {
        // Marcar como não mais em progresso
        analysisInProgressRef.current = false;
      }
  };

  // useEffect para iniciar a análise do produto uma única vez
  useEffect(() => {
    if (user?.id && !analysisStartedRef.current) {
      // Pequeno delay para garantir que o componente está montado
      const timer = setTimeout(() => {
        analyzeProduct();
      }, 1000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [user?.id]);

  // useEffect para o progresso e navegação
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
        
        // Só redirecionar quando a análise estiver completa ou houver erro
        if (newProgress >= 100 && !hasNavigated && (analysisComplete || error)) {
          hasNavigated = true;
          clearInterval(interval);
          setTimeout(() => {
            router.push('/search/results');
          }, 500);
          return 100;
        }
        
        // Se chegou a 100% mas a análise ainda não terminou, manter em 99%
        if (newProgress >= 100 && !analysisComplete && !error) {
          return 99;
        }
        
        return newProgress;
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [router, analysisComplete, error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.1),transparent_50%)] pointer-events-none"></div>
      <div className="relative z-10 max-w-md w-full text-center">
        {/* Loading Animation */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-orange-500/25">
            <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Finding Your Perfect Creators
          </h1>
          
          <p className="text-white/70 mb-8">
            {currentMessage}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800/50 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300 ease-out shadow-lg shadow-orange-500/25"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-white/60 text-sm">
          {progress}% complete
        </p>

        {/* Features being analyzed */}
        <div className="mt-12 space-y-3">
          <div className="flex items-center justify-center space-x-2 text-white/60">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Audience compatibility</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-white/60">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <span className="text-sm">Engagement metrics</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-white/60">
            <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <span className="text-sm">Content relevance</span>
          </div>
        </div>
      </div>
    </div>
  );
}