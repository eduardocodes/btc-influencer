import { logger, schedules } from "@trigger.dev/sdk/v3";
import { supabaseAdmin } from '../lib/supabase/admin';

export const cleanupcanceledSubscriptions = schedules.task({
  id: "cleanup-canceled-subscriptions",
  // Runs daily at 00h (midnight)
  cron: "0 0 * * *",
  // 5 minute timeout for the operation
  maxDuration: 300,
  run: async (payload, { ctx }) => {
    logger.log("Starting cleanup of inactive subscriptions", {
      timestamp: payload.timestamp,
      timezone: payload.timezone
    });

    try {
      // Get current date in YYYY-MM-DD format
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      logger.log("Today's date for comparison", { todayString });

      // Search for records that meet the criteria:
      // 1. status = 'canceled'
      // 2. current_period_end = current date (comparing only date, not time)
      const { data: subscriptionsToDelete, error: selectError } = await supabaseAdmin
        .from('subscriptions')
        .select('id, user_id, status, current_period_end')
        .eq('status', 'canceled')
        .filter('current_period_end', 'gte', `${todayString}T00:00:00.000Z`)
        .filter('current_period_end', 'lt', `${todayString}T23:59:59.999Z`);

      if (selectError) {
        logger.error("Error searching for subscriptions to delete", { error: selectError });
        throw selectError;
      }

      if (!subscriptionsToDelete || subscriptionsToDelete.length === 0) {
        logger.log("No inactive subscriptions found for removal today");
        return;
      }

      logger.log(`Found ${subscriptionsToDelete.length} subscriptions for removal`, {
        subscriptions: subscriptionsToDelete
      });

      // Delete the records
      const { error: deleteError } = await supabaseAdmin
        .from('subscriptions')
        .delete()
        .eq('status', 'canceled')
        .filter('current_period_end', 'gte', `${todayString}T00:00:00.000Z`)
        .filter('current_period_end', 'lt', `${todayString}T23:59:59.999Z`);

      if (deleteError) {
        logger.error("Error deleting subscriptions", { error: deleteError });
        throw deleteError;
      }

      logger.log(`Cleanup completed successfully! ${subscriptionsToDelete.length} subscriptions removed`, {
        removedSubscriptions: subscriptionsToDelete.map(sub => ({
          id: sub.id,
          user_id: sub.user_id,
          current_period_end: sub.current_period_end
        }))
      });

    } catch (error) {
      logger.error("Error during subscription cleanup", { error });
      throw error;
    }
  },
});