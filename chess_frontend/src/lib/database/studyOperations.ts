import { supabase } from '../supabase';

/**
 * Study Database Operations
 *
 * This module runs in the browser and handles database operations for chess studies.
 * It uses the Supabase client (configured with anon key) to interact with the database.
 *
 * 📝 Database Operations:
 * - getOrCreateUserProfile: Creates/finds user profiles in the database
 * - hasCompletedOnboarding: Checks if user has active studies
 *
 * 🔐 Security:
 * - Uses RLS (Row Level Security) policies in Supabase
 * - For development, RLS may be disabled (see comments in code)
 * - In production, proper authentication will be required
 *
 * 🏗️ Architecture:
 * Browser -> Supabase Client -> Database (with RLS)
 */

export interface StudySelection {
  whiteStudyId: string | null;
  blackStudyId: string | null;
}

export interface LichessStudy {
  id: string;
  user_id: string;
  lichess_study_id: string;
  study_name: string;
  study_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get or create a user profile based on Lichess username
 * Returns the UUID for the user profile
 *
 * Note: For development, we're bypassing RLS by using the anon key directly
 * In production, this would use proper authentication
 */
async function getOrCreateUserProfile(lichessUsername: string): Promise<string> {
  try {
    console.log('🔍 Looking for profile with username:', lichessUsername);

    // First, try to find existing profile by lichess_username
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('lichess_username', lichessUsername)
      .single();

    if (existingProfile && !selectError) {
      console.log('✅ Found existing profile:', existingProfile.id);
      return existingProfile.id;
    }

    console.log('👤 Profile not found, creating new one...');

    // Generate a UUID for the new profile
    // Since we're not using Supabase auth, we need to create our own UUID
    const newUserId = crypto.randomUUID();

    // If no profile exists, create one
    // Note: In a real app, this would be handled by the auth system
    // For now, we'll create a temporary profile for testing
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: newUserId, // Explicitly provide the UUID
        lichess_username: lichessUsername,
        onboarding_completed: false, // Set to false by default for new users
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('❌ Error creating profile:', insertError);

      // If RLS is blocking us, provide helpful error message
      if (insertError.message?.includes('RLS') || insertError.message?.includes('policy')) {
        console.error('🚨 RLS Policy Error: You may need to disable RLS for development');
        console.error(
          '💡 In Supabase dashboard, go to Authentication > Policies and temporarily disable RLS on the profiles table'
        );
      }

      throw new Error('Failed to create user profile');
    }

    console.log('✅ Created new profile:', newProfile.id);
    return newProfile.id;
  } catch (error) {
    console.error('❌ Error in getOrCreateUserProfile:', error);
    throw error;
  }
}

/**
 * Save user's study selections to the database
 * This replaces the localStorage-based approach in onboardingUtils
 */
export async function saveUserStudySelections(
  userIdentifier: string, // This could be a UUID or Lichess username
  whiteStudyId: string | null,
  blackStudyId: string | null
): Promise<void> {
  try {
    // Determine if userIdentifier is a UUID or username
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdentifier);

    let userId: string;
    if (isUUID) {
      userId = userIdentifier;
    } else {
      // It's a Lichess username, get or create profile
      userId = await getOrCreateUserProfile(userIdentifier);
    }

    // First, deactivate any existing studies for this user
    const { error: deactivateError } = await supabase
      .from('lichess_studies')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (deactivateError) {
      console.error('Error deactivating existing studies:', deactivateError);
      throw new Error('Failed to update existing studies');
    }

    // Prepare studies to insert
    const studiesToInsert: Omit<LichessStudy, 'id' | 'created_at' | 'updated_at'>[] = [];

    if (whiteStudyId) {
      studiesToInsert.push({
        user_id: userId,
        lichess_study_id: whiteStudyId,
        study_name: 'White Repertoire', // We'll improve this later to fetch actual names
        study_url: `https://lichess.org/study/${whiteStudyId}`,
        is_active: true,
      });
    }

    if (blackStudyId) {
      studiesToInsert.push({
        user_id: userId,
        lichess_study_id: blackStudyId,
        study_name: 'Black Repertoire', // We'll improve this later to fetch actual names
        study_url: `https://lichess.org/study/${blackStudyId}`,
        is_active: true,
      });
    }

    // Insert new studies if any
    if (studiesToInsert.length > 0) {
      const { error: insertError } = await supabase.from('lichess_studies').insert(studiesToInsert);

      if (insertError) {
        console.error('Error inserting studies:', insertError);
        throw new Error('Failed to save study selections');
      }
    }

    console.log('Successfully saved study selections:', {
      userIdentifier,
      userId,
      whiteStudyId,
      blackStudyId,
      studiesCount: studiesToInsert.length,
    });
  } catch (error) {
    console.error('Error in saveUserStudySelections:', error);
    throw error;
  }
}

/**
 * Get user's active study selections
 */
export async function getUserStudySelections(userIdentifier: string): Promise<StudySelection> {
  try {
    // Determine if userIdentifier is a UUID or username
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdentifier);

    let userId: string;
    if (isUUID) {
      userId = userIdentifier;
    } else {
      // It's a Lichess username, get profile
      userId = await getOrCreateUserProfile(userIdentifier);
    }

    const { data: studies, error } = await supabase
      .from('lichess_studies')
      .select('lichess_study_id, study_name')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching user studies:', error);
      throw new Error('Failed to fetch study selections');
    }

    // Determine which studies are white vs black based on name
    // This is a simple heuristic - we'll improve this later
    let whiteStudyId: string | null = null;
    let blackStudyId: string | null = null;

    studies?.forEach(study => {
      if (study.study_name.toLowerCase().includes('white')) {
        whiteStudyId = study.lichess_study_id;
      } else if (study.study_name.toLowerCase().includes('black')) {
        blackStudyId = study.lichess_study_id;
      } else {
        // If we can't determine, assign to the first available slot
        if (!whiteStudyId) {
          whiteStudyId = study.lichess_study_id;
        } else if (!blackStudyId) {
          blackStudyId = study.lichess_study_id;
        }
      }
    });

    return { whiteStudyId, blackStudyId };
  } catch (error) {
    console.error('Error in getUserStudySelections:', error);
    throw error;
  }
}

/**
 * Check if user has completed onboarding (has active studies)
 */
export async function hasCompletedOnboarding(userIdentifier: string): Promise<boolean> {
  try {
    // Determine if userIdentifier is a UUID or username
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdentifier);

    let userId: string;
    if (isUUID) {
      userId = userIdentifier;
    } else {
      // It's a Lichess username, get profile
      userId = await getOrCreateUserProfile(userIdentifier);
    }

    const { data: studies, error } = await supabase
      .from('lichess_studies')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }

    return (studies?.length || 0) > 0;
  } catch (error) {
    console.error('Error in hasCompletedOnboarding:', error);
    return false;
  }
}

export { getOrCreateUserProfile };
