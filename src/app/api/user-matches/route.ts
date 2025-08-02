import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { supabase } from '@/src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { creator_ids, search_criteria, onboarding_answer_id, user_id } = await request.json();



    // Validar dados obrigatórios
    if (!creator_ids || !Array.isArray(creator_ids) || creator_ids.length === 0) {
      return NextResponse.json(
        { error: 'creator_ids é obrigatório e deve ser um array não vazio' },
        { status: 400 }
      );
    }

    if (!search_criteria || !Array.isArray(search_criteria)) {
      return NextResponse.json(
        { error: 'search_criteria é obrigatório e deve ser um array' },
        { status: 400 }
      );
    }

    if (!onboarding_answer_id || !user_id) {
      return NextResponse.json(
        { error: 'onboarding_answer_id e user_id são obrigatórios' },
        { status: 400 }
      );
    }

    // Preparar dados para inserção
    const matchData = {
      user_id,
      creator_ids,
      search_criteria,
      onboarding_answer_id,
      created_at: new Date().toISOString()
    };



    // Usar cliente administrativo para contornar RLS
    const { data, error } = await supabaseAdmin
      .from('user_matches')
      .insert(matchData)
      .select();

    if (error) {
      console.error('Supabase error saving user_matches:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar no banco de dados', details: error.message },
        { status: 500 }
      );
    }


    return NextResponse.json({ success: true, data });

  } catch (err) {
    console.error('Unexpected error saving user_matches:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}