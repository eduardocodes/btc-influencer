import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { categories } = await request.json();
    
    console.log('🔍 [API] Searching creators for categories:', categories);
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ error: 'Categories array is required' }, { status: 400 });
    }

    // First try: overlaps query
    let { data: creators, error } = await supabaseAdmin
      .from('creators')
      .select('*')
      .overlaps('categories', categories)
      .order('total_followers', { ascending: false })
      .limit(50);

    console.log('🔍 [API] Overlaps query result:', { error, count: creators?.length || 0 });

    // If no results with overlaps, try contains query
    if (!creators || creators.length === 0) {
      console.log('🔍 [API] Trying contains query...');
      
      const { data: containsData, error: containsError } = await supabaseAdmin
        .from('creators')
        .select('*')
        .contains('categories', categories)
        .order('total_followers', { ascending: false })
        .limit(50);
        
      creators = containsData;
      error = containsError;
      
      console.log('🔍 [API] Contains query result:', { error, count: creators?.length || 0 });
    }

    // If still no results, try individual category matches
    if (!creators || creators.length === 0) {
      console.log('🔍 [API] Trying individual category matches...');
      
      const queries = categories.map(category => 
        supabaseAdmin
          .from('creators')
          .select('*')
          .contains('categories', [category])
      );
      
      const results = await Promise.all(queries);
      const allCreators = results.flatMap((result: any) => result.data || []);
      
      // Remove duplicates and sort by followers
      const uniqueCreators = Array.from(
        new Map(allCreators.map((creator: any) => [creator.id, creator])).values()
      ).sort((a: any, b: any) => (b.total_followers || 0) - (a.total_followers || 0));
      
      creators = uniqueCreators.slice(0, 50);
      
      console.log('🔍 [API] Individual matches result:', { count: creators?.length || 0 });
    }

    if (error) {
      console.error('🚨 [API] Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    console.log('✅ [API] Final result:', { count: creators?.length || 0 });
    
    return NextResponse.json({ creators: creators || [] });
    
  } catch (error) {
    console.error('🚨 [API] Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}