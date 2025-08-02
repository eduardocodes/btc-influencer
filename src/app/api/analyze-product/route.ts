import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AVAILABLE_CATEGORIES = [
  "BTC-only",
  "accounting",
  "altcoins",
  "beginner",
  "btc-only",
  "content-creation",
  "courses",
  "crypto",
  "custody",
  "education",
  "environment",
  "general-crypto",
  "interviews",
  "investing",
  "libertarian",
  "lifestyle",
  "macro",
  "macro-research",
  "market-analysis",
  "mining",
  "news",
  "podcast",
  "privacy",
  "security",
  "storytelling",
  "survivalism",
  "taxation",
  "tech",
  "technical-analysis",
  "trading",
  "trading-education",
  "travel",
  "tutorials",
  "vlog"
];

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[analyze-product] Iniciando análise de produto', { timestamp: new Date().toISOString() });
  
  try {
    const { userId } = await request.json();
    console.log('[analyze-product] Request recebido', { userId, timestamp: new Date().toISOString() });

    if (!userId) {
      console.warn('[analyze-product] User ID não fornecido');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Buscar as respostas do onboarding do usuário
    console.log('[analyze-product] Buscando dados de onboarding', { userId });
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_answers')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (onboardingError) {
      console.error('[analyze-product] Erro ao buscar onboarding:', onboardingError);
      return NextResponse.json(
        { error: 'Onboarding answers not found' },
        { status: 404 }
      );
    }

    if (!onboardingData) {
      console.error('[analyze-product] Nenhum dado de onboarding encontrado para user:', userId);
      return NextResponse.json(
        { error: 'Onboarding answers not found' },
        { status: 404 }
      );
    }

    console.log('[analyze-product] Dados de onboarding encontrados', {
      userId,
      hasCompanyName: !!onboardingData.company_name,
      hasProductName: !!onboardingData.product_name,
      hasProductDescription: !!onboardingData.product_description,
      currentCategory: onboardingData.product_category,
      isBitcoinSuitable: onboardingData.is_bitcoin_suitable
    });

    // Preparar o prompt para a OpenAI
    const prompt = `
Analyze the following product information and categorize it based on the available categories for Bitcoin/crypto influencers.

Product Information:
- Company: ${onboardingData.company_name || 'Not provided'}
- Product Name: ${onboardingData.product_name || 'Not provided'}
- Product URL: ${onboardingData.product_url || 'Not provided'}
- Description: ${onboardingData.product_description || 'Not provided'}
- Current Category: ${onboardingData.product_category || 'Not provided'}
- Bitcoin Suitable: ${onboardingData.is_bitcoin_suitable ? 'Yes' : 'No'}

Available Categories:
${AVAILABLE_CATEGORIES.join(', ')}

**CRITICAL INSTRUCTIONS FOR BITCOIN-ONLY DETECTION:**

You MUST set is_bitcoin_suitable to true if ANY of these conditions are met:
1. Product name/description contains: "bitcoin-only", "bitcoinheiro", "bitcoiner", "BTC-only", "bitcoin maximalist", "bitcoin maximalism", "only bitcoin", "exclusively bitcoin"
2. Product explicitly states it excludes altcoins or focuses only on Bitcoin
3. Product targets Bitcoin maximalists or Bitcoin-only community
4. Product is Bitcoin-specific (wallets, nodes, education that mentions Bitcoin-only)

**DECISION RULE:**
- If product mentions Bitcoin and excludes other cryptocurrencies → is_bitcoin_suitable = true
- If product is Bitcoin-specific and not multi-crypto → is_bitcoin_suitable = true
- If product description mentions "bitcoin-only" or similar → is_bitcoin_suitable = true

Please:
1. Select the most appropriate categories from the available list (you can select multiple categories)
2. Evaluate Bitcoin-only suitability using the CRITICAL INSTRUCTIONS above - be generous with Bitcoin-only products
3. Provide a brief explanation for your categorization and Bitcoin-only suitability decision

Respond in the following JSON format:
{
  "categories": ["category1", "category2"],
  "is_bitcoin_suitable": true,
  "explanation": "Brief explanation of why this is suitable for Bitcoin-only audience"
}
`;


    // Fazer a requisição para a OpenAI
    console.log('[analyze-product] Enviando prompt para OpenAI', {
      userId,
      model: 'gpt-4o-mini',
      promptLength: prompt.length
    });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in Bitcoin and cryptocurrency marketing. Your task is to categorize products and determine their suitability for different types of crypto influencers.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const responseContent = completion.choices[0]?.message?.content;
    console.log('[analyze-product] Resposta recebida da OpenAI', {
      userId,
      hasResponse: !!responseContent,
      responseLength: responseContent?.length || 0,
      tokensUsed: completion.usage?.total_tokens || 0
    });
    
    if (!responseContent) {
      console.error('[analyze-product] Nenhuma resposta da OpenAI');
      throw new Error('No response from OpenAI');
    }

    // Parse da resposta da OpenAI
    let analysisResult;
    try {
      // Remove blocos de código markdown se presentes
      let cleanResponse = responseContent.trim();
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
      }
      console.log('[analyze-product] Fazendo parse da resposta da IA', {
        userId,
        originalLength: responseContent.length,
        cleanedLength: cleanResponse.length
      });
      analysisResult = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('[analyze-product] Erro ao fazer parse da resposta da IA:', {
        userId,
        error: parseError,
        responseContent: responseContent?.substring(0, 500) + '...'
      });
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    // Validar as categorias retornadas
    const validCategories = analysisResult.categories.filter((cat: string) => 
      AVAILABLE_CATEGORIES.includes(cat)
    );
    console.log('[analyze-product] Categorias analisadas', {
      userId,
      originalCategories: analysisResult.categories,
      validCategories,
      isBitcoinSuitable: analysisResult.is_bitcoin_suitable,
      invalidCategories: analysisResult.categories.filter((cat: string) => !AVAILABLE_CATEGORIES.includes(cat))
    });

    // Atualizar o registro de onboarding com a análise da IA
    console.log('[analyze-product] Atualizando dados no banco', {
      userId,
      categoriesString: validCategories.join(', '),
      isBitcoinSuitable: analysisResult.is_bitcoin_suitable
    });
    const { error: updateError } = await supabase
      .from('onboarding_answers')
      .update({
        product_category: validCategories.join(', '),
        is_bitcoin_suitable: analysisResult.is_bitcoin_suitable
      })
      .eq('user_id', userId);
    if (updateError) {
      console.error('[analyze-product] Falha ao atualizar onboarding:', { userId, error: updateError });
      return NextResponse.json(
        { error: 'Failed to update analysis results' },
        { status: 500 }
      );
    }

    console.log('[analyze-product] Dados atualizados com sucesso no banco', { userId });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('[analyze-product] Análise concluída com sucesso', {
      userId,
      duration: `${duration}ms`,
      categoriesCount: validCategories.length,
      isBitcoinSuitable: analysisResult.is_bitcoin_suitable
    });

    return NextResponse.json({
      success: true,
      analysis: {
        categories: validCategories,
        is_bitcoin_suitable: analysisResult.is_bitcoin_suitable,
        explanation: analysisResult.explanation
      }
    });

  } catch (error: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error('[analyze-product] Erro interno na análise:', {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}