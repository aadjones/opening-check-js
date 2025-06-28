import type { Session } from '@auth/core/types';

/**
 * Simplified sync for development
 * We'll skip the complex auth sync and let our database operations handle user identification
 */
export async function syncSupabaseSession(authSession: Session | null): Promise<void> {
  try {
    if (!authSession?.user?.id) {
      console.log('🔄 No Auth.js session - skipping Supabase sync');
      return;
    }

    console.log('✅ Auth.js session found for user:', authSession.user.id);
    console.log('📝 Skipping Supabase auth sync - using direct database operations');

    // For development, we'll rely on our database operations to handle user identification
    // This avoids the complexity of syncing two different auth systems
  } catch (error) {
    console.error('❌ Error in sync:', error);
  }
}
