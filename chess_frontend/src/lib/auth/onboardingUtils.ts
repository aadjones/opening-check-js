/**
 * Utility functions for managing user onboarding status
 * These are temporary helpers until we implement proper Supabase integration
 */

export interface UserStudies {
  whiteStudyId: string | null;
  blackStudyId: string | null;
  completedAt: string;
  userId: string;
}

/**
 * Get user's saved studies
 */
export function getUserStudies(userId: string): UserStudies | null {
  // userId must always be a UUID
  try {
    const savedStudies = localStorage.getItem(`user_studies_${userId}`);
    if (!savedStudies) return null;

    return JSON.parse(savedStudies);
  } catch (error) {
    console.error('Error getting user studies:', error);
    return null;
  }
}

/**
 * Clear user's onboarding status (useful for testing)
 */
export function clearOnboardingStatus(userId: string): void {
  // userId must always be a UUID
  try {
    localStorage.removeItem(`user_studies_${userId}`);
    console.log('Onboarding status cleared for user:', userId);
  } catch (error) {
    console.error('Error clearing onboarding status:', error);
  }
}

/**
 * Save user studies (used by onboarding page)
 */
export function saveUserStudies(userId: string, whiteStudyId: string | null, blackStudyId: string | null): void {
  // userId must always be a UUID
  try {
    const studyData: UserStudies = {
      whiteStudyId,
      blackStudyId,
      completedAt: new Date().toISOString(),
      userId,
    };

    localStorage.setItem(`user_studies_${userId}`, JSON.stringify(studyData));
    console.log('User studies saved:', studyData);
  } catch (error) {
    console.error('Error saving user studies:', error);
    throw error;
  }
}

declare global {
  interface Window {
    onboardingUtils?: {
      getUserStudies: typeof getUserStudies;
      clearOnboardingStatus: typeof clearOnboardingStatus;
      saveUserStudies: typeof saveUserStudies;
    };
  }
}

// Development helper - expose to window for easy testing
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.onboardingUtils = {
    getUserStudies,
    clearOnboardingStatus,
    saveUserStudies,
  };
}
