import { logger, schedules } from "@trigger.dev/sdk/v3";
import { supabaseAdmin } from '../lib/supabase/admin';

export const cleanupcanceledSubscriptions = schedules.task({
  id: "cleanup-canceled-subscriptions",
  // Roda diariamente às 00h (meia-noite)
  cron: "0 0 * * *",
  // Timeout de 5 minutos para a operação
  maxDuration: 300,
  run: async (payload, { ctx }) => {
    logger.log("Iniciando limpeza de assinaturas inativas", {
      timestamp: payload.timestamp,
      timezone: payload.timezone
    });

    try {
      // Obter a data atual no formato YYYY-MM-DD
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      logger.log("Data de hoje para comparação", { todayString });

      // Buscar registros que atendem aos critérios:
      // 1. status = 'canceled'
      // 2. current_period_end = data atual (comparando apenas a data, não o horário)
      const { data: subscriptionsToDelete, error: selectError } = await supabaseAdmin
        .from('subscriptions')
        .select('id, user_id, status, current_period_end')
        .eq('status', 'canceled')
        .filter('current_period_end', 'gte', `${todayString}T00:00:00.000Z`)
        .filter('current_period_end', 'lt', `${todayString}T23:59:59.999Z`);

      if (selectError) {
        logger.error("Erro ao buscar assinaturas para deletar", { error: selectError });
        throw selectError;
      }

      if (!subscriptionsToDelete || subscriptionsToDelete.length === 0) {
        logger.log("Nenhuma assinatura inativa encontrada para remoção hoje");
        return;
      }

      logger.log(`Encontradas ${subscriptionsToDelete.length} assinaturas para remoção`, {
        subscriptions: subscriptionsToDelete
      });

      // Deletar os registros
      const { error: deleteError } = await supabaseAdmin
        .from('subscriptions')
        .delete()
        .eq('status', 'canceled')
        .filter('current_period_end', 'gte', `${todayString}T00:00:00.000Z`)
        .filter('current_period_end', 'lt', `${todayString}T23:59:59.999Z`);

      if (deleteError) {
        logger.error("Erro ao deletar assinaturas", { error: deleteError });
        throw deleteError;
      }

      logger.log(`Limpeza concluída com sucesso! ${subscriptionsToDelete.length} assinaturas removidas`, {
        removedSubscriptions: subscriptionsToDelete.map(sub => ({
          id: sub.id,
          user_id: sub.user_id,
          current_period_end: sub.current_period_end
        }))
      });

    } catch (error) {
      logger.error("Erro durante a limpeza de assinaturas", { error });
      throw error;
    }
  },
});