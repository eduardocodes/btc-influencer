import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories, is_bitcoin_suitable } = body;
    
    if (!categories || !Array.isArray(categories)) {
      console.error("Categories inválidas:", categories);
      return NextResponse.json({ error: 'Categories array is required' }, { status: 400 });
    }

    // Se o array de categorias estiver vazio, retorna criadores genéricos (fallback)
    if (categories.length === 0) {
      let query = supabaseAdmin
        .from('creators')
        .select('*');
      if (is_bitcoin_suitable === true) {
        const bitcoinCategories = ['Bitcoin', 'Cryptocurrency', 'Crypto', 'Blockchain', 'DeFi', 'Web3'];
        query = query.overlaps('categories', bitcoinCategories);
      }
      const { data: creators, error } = await query
        .order('total_followers', { ascending: false })
        .limit(50);
      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
      return NextResponse.json({ creators: creators || [] });
    }

    // First try: overlaps query
    let query = supabaseAdmin
      .from('creators')
      .select('*')
      .overlaps('categories', categories);
    
    // If is_bitcoin_suitable is true, filter for Bitcoin/crypto related creators
    if (is_bitcoin_suitable === true) {
      const bitcoinCategories = ['Bitcoin', 'Cryptocurrency', 'Crypto', 'Blockchain', 'DeFi', 'Web3'];
      query = query.overlaps('categories', bitcoinCategories);
    }
    
    let { data: creators, error } = await query
      .order('total_followers', { ascending: false })
      .limit(50);



    // If no results with overlaps, try contains query
    if (!creators || creators.length === 0) {
      let containsQuery = supabaseAdmin
        .from('creators')
        .select('*')
        .contains('categories', categories);
      
      // Apply Bitcoin filter if needed
      if (is_bitcoin_suitable === true) {
        const bitcoinCategories = ['Bitcoin', 'Cryptocurrency', 'Crypto', 'Blockchain', 'DeFi', 'Web3'];
        containsQuery = containsQuery.overlaps('categories', bitcoinCategories);
      }
      
      const { data: containsData, error: containsError } = await containsQuery
        .order('total_followers', { ascending: false })
        .limit(50);
        
      creators = containsData;
      error = containsError;
    }

    // If still no results, try individual category matches
    if (!creators || creators.length === 0) {
      const queries = categories.map(category => {
        let individualQuery = supabaseAdmin
          .from('creators')
          .select('*')
          .contains('categories', [category]);
        
        // Apply Bitcoin filter if needed
        if (is_bitcoin_suitable === true) {
          const bitcoinCategories = ['Bitcoin', 'Cryptocurrency', 'Crypto', 'Blockchain', 'DeFi', 'Web3'];
          individualQuery = individualQuery.overlaps('categories', bitcoinCategories);
        }
        
        return individualQuery;
      });
      
      const results = await Promise.all(queries);
      const allCreators = results.flatMap((result: any) => result.data || []);
      
      // Remove duplicates and sort by followers
      const uniqueCreators = Array.from(
        new Map(allCreators.map((creator: any) => [creator.id, creator])).values()
      ).sort((a: any, b: any) => (b.total_followers || 0) - (a.total_followers || 0));
      
      creators = uniqueCreators.slice(0, 50);
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Fallback: se nenhum criador encontrado, buscar até 6 criadores Bitcoin-only
    if (!creators || creators.length === 0) {
      const { data: btcOnlyCreators, error: btcOnlyError } = await supabaseAdmin
        .from('creators')
        .select('*')
        .eq('is_btc_only', true)
        .order('total_followers', { ascending: false })
        .limit(6);
      if (btcOnlyError) {
        console.error('Database error (btc_only fallback):', btcOnlyError);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
      return NextResponse.json({ creators: btcOnlyCreators || [] });
    }

    return NextResponse.json({ creators: creators || [] });
    
  } catch (error) {
    console.error('Error in creators search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}