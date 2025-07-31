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
    const timestamp = new Date().toISOString();
    console.log(`🕐 [${timestamp}] analyzeProduct called with:`, {
      hasUser: !!user?.id,
      userId: user?.id,
      analysisComplete,
      error,
      progress,
      analysisStarted: analysisStartedRef.current,
      analysisInProgress: analysisInProgressRef.current
    });

    // Verificar se já foi iniciada ou está em progresso
    if (!user?.id || analysisComplete || error || analysisStartedRef.current || analysisInProgressRef.current) {
      console.log(`🚫 [${timestamp}] Skipping analysis:`, { 
        hasUser: !!user?.id, 
        analysisComplete, 
        error,
        analysisStarted: analysisStartedRef.current,
        analysisInProgress: analysisInProgressRef.current
      });
      return;
    }

    // Marcar como iniciada e em progresso
    analysisStartedRef.current = true;
    analysisInProgressRef.current = true;
    console.log(`🔍 [${timestamp}] Starting product analysis for user:`, user.id);

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
          console.log(`✅ [${timestamp}] Product analysis completed:`, result);
          
          // Update localStorage with analysis results
          try {
            const existingData = localStorage.getItem('onboardingData');
            if (existingData) {
              const onboardingData = JSON.parse(existingData);
              onboardingData.selectedNiches = result.analysis?.categories || [];
              onboardingData.keywords = result.analysis?.categories || []; // Using categories as keywords for now
              localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
              console.log(`💾 [${timestamp}] Updated localStorage with analysis results:`, {
                selectedNiches: onboardingData.selectedNiches,
                keywords: onboardingData.keywords
              });
            } else {
              console.warn(`⚠️ [${timestamp}] No existing onboarding data in localStorage to update`);
            }
          } catch (localStorageError) {
            console.error(`❌ [${timestamp}] Error updating localStorage:`, localStorageError);
          }
          
          setAnalysisComplete(true);
        } else {
          console.error(`❌ [${timestamp}] Product analysis failed:`, response.status);
          setError('Analysis failed');
        }
      } catch (err) {
        console.error(`❌ [${timestamp}] Error during product analysis:`, err);
        setError('Analysis error');
      } finally {
        // Marcar como não mais em progresso
        analysisInProgressRef.current = false;
        console.log(`🏁 [${timestamp}] Analysis process finished`);
      }
  };

  // useEffect para iniciar a análise do produto uma única vez
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`🎯 [${timestamp}] Analysis useEffect triggered:`, {
      hasUser: !!user?.id,
      userId: user?.id,
      analysisStarted: analysisStartedRef.current,
      userObject: user
    });
    
    // Log adicional para debug
    if (!user) {
      console.log(`⚠️ [${timestamp}] User is null/undefined`);
    } else if (!user.id) {
      console.log(`⚠️ [${timestamp}] User exists but no ID:`, user);
    }
    
    if (user?.id && !analysisStartedRef.current) {
      console.log(`🎯 [${timestamp}] Scheduling product analysis...`);
      // Pequeno delay para garantir que o componente está montado
      const timer = setTimeout(() => {
        analyzeProduct();
      }, 1000);
      
      return () => {
        console.log(`🧹 [${timestamp}] Cleaning up analysis timer`);
        clearTimeout(timer);
      };
    }
  }, [user?.id]); // Só executa quando user.id muda

  // useEffect para o progresso e navegação
  useEffect(() => {
    const timestamp = new Date().toISOString();
    let hasNavigated = false;
    
    console.log(`📊 [${timestamp}] Progress useEffect triggered:`, {
      progress,
      analysisComplete,
      error
    });
    
    console.log(`📊 [${timestamp}] Starting progress interval`);
    
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
          console.log(`🎯 [${timestamp}] Redirecting to results. Analysis complete:`, analysisComplete, 'Error:', error);
          setTimeout(() => {
            if (error) {
              console.warn(`⚠️ [${timestamp}] Proceeding despite analysis error:`, error);
            }
            router.push('/search/results');
          }, 500);
          return 100;
        }
        
        // Se chegou a 100% mas a análise ainda não terminou, manter em 99%
        if (newProgress >= 100 && !analysisComplete && !error) {
          console.log(`⏳ [${timestamp}] Waiting for analysis to complete...`);
          return 99;
        }
        
        return newProgress;
      });
    }, 100);

    return () => {
      console.log(`🛑 [${timestamp}] Cleaning up progress interval`);
      clearInterval(interval);
    };
  }, [router, analysisComplete, error]); // Removido user e messages das dependências

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