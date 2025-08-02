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
  
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Buscar as respostas do onboarding do usuário
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_answers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (onboardingError) {
      console.error('Database error fetching onboarding data:', onboardingError);
      return NextResponse.json(
        { error: 'Onboarding answers not found' },
        { status: 404 }
      );
    }

    if (!onboardingData) {
      console.error('No onboarding data found for user:', userId);
      return NextResponse.json(
        { error: 'Onboarding answers not found' },
        { status: 404 }
      );
    }



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

Based on the product information above, please:
1. Select the most appropriate categories from the available list (you can select multiple categories)
2. Determine if this product is suitable for Bitcoin-only influencers
3. Provide a brief explanation for your categorization

Respond in the following JSON format:
{
  "categories": ["category1", "category2"],
  "is_bitcoin_suitable": true/false,
  "explanation": "Brief explanation of the categorization"
}
`;

    // Fazer a requisição para a OpenAI
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
    
    if (!responseContent) {
      console.error('No response from OpenAI');
      throw new Error('No response from OpenAI');
    }

    // Parse da resposta da OpenAI
    let analysisResult;
    try {
      analysisResult = JSON.parse(responseContent);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    // Validar as categorias retornadas
    const validCategories = analysisResult.categories.filter((cat: string) => 
      AVAILABLE_CATEGORIES.includes(cat)
    );

    // Atualizar o registro de onboarding com a análise da IA
    const { error: updateError } = await supabase
      .from('onboarding_answers')
      .update({
        product_category: validCategories.join(', '),
        is_bitcoin_suitable: analysisResult.is_bitcoin_suitable
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update onboarding data:', updateError);
      return NextResponse.json(
        { error: 'Failed to update analysis results' },
        { status: 500 }
      );
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    return NextResponse.json({
      success: true,
      analysis: {
        categories: validCategories,
        is_bitcoin_suitable: analysisResult.is_bitcoin_suitable,
        explanation: analysisResult.explanation
      }
    });

  } catch (error: any) {
    console.error('Error in product analysis:', error);
    const endTime = Date.now();
    const duration = endTime - startTime;
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}