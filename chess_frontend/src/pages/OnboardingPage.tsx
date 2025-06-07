import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudySelector } from '../components';
import { useAuth } from '../hooks/useAuth';
import { saveUserStudySelections } from '../lib/database/studyOperations';
import { extractStudyId } from '../lib/lichess/studyValidation';
import styles from './OnboardingPage.module.css';
import { supabase } from '../lib/supabase';

// Demo study URLs
const DEMO_WHITE_STUDY = 'https://lichess.org/study/WyolAMxV/pkza6G22';
const DEMO_BLACK_STUDY = 'https://lichess.org/study/eF6yFQYv/ZW558bn5';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [whiteStudyId, setWhiteStudyId] = useState<string | null>(null);
  const [blackStudyId, setBlackStudyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStudyChange = (whiteId: string | null, blackId: string | null) => {
    if (whiteId !== null) {
      setWhiteStudyId(whiteId);
    }
    if (blackId !== null) {
      setBlackStudyId(blackId);
    }
    // Clear any previous errors when user makes changes
    if (error) {
      setError(null);
    }
  };

  const handleDemoModeToggle = (enabled: boolean) => {
    setIsDemoMode(enabled);

    if (enabled) {
      // Load demo studies
      const demoWhiteId = extractStudyId(DEMO_WHITE_STUDY);
      const demoBlackId = extractStudyId(DEMO_BLACK_STUDY);

      setWhiteStudyId(demoWhiteId);
      setBlackStudyId(demoBlackId);

      console.log('Demo mode enabled with studies:', {
        white: demoWhiteId,
        black: demoBlackId,
      });
    } else {
      // Clear studies when demo mode is disabled
      setWhiteStudyId(null);
      setBlackStudyId(null);
    }

    // Clear any previous errors when toggling demo mode
    if (error) {
      setError(null);
    }
  };

  const handleStartTracking = async () => {
    if (!whiteStudyId && !blackStudyId) {
      setError('Please select at least one study to continue.');
      return;
    }

    if (!session?.user?.id) {
      setError('No user session found. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Save study selections to Supabase database
      try {
        await saveUserStudySelections(session.user.id, whiteStudyId, blackStudyId);
        console.log('Study selections saved successfully:', { whiteStudyId, blackStudyId });
      } catch (saveError: unknown) {
        let message = '';
        if (saveError instanceof Error) {
          message = saveError.message;
        } else if (
          typeof saveError === 'object' &&
          saveError &&
          'message' in saveError &&
          typeof (saveError as { message?: unknown }).message === 'string'
        ) {
          message = (saveError as { message: string }).message;
        } else {
          message = String(saveError);
        }
        if (message.match(/duplicate|constraint|unique/i)) {
          console.warn('Duplicate/constraint error when saving studies, continuing onboarding:', message);
        } else {
          console.error('Error saving studies:', saveError);
          setError(message || 'Failed to save your study selections. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // Mark onboarding as completed regardless of study save result
      console.log('[Onboarding] Attempting to update onboarding_completed flag for user:', session.user.id);
      const {
        data: onboardingData,
        error: onboardingError,
        status,
        statusText,
      } = await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', session.user.id).select(); // Get updated rows for debugging
      console.log('[Onboarding] Supabase update result:', { onboardingData, onboardingError, status, statusText });
      if (onboardingError) {
        console.error('Error updating onboarding_completed flag:', onboardingError.message);
        setError('Failed to update onboarding status. Please try again.');
        setIsLoading(false);
        return;
      }

      if (isDemoMode) {
        console.log('Demo onboarding completed! Redirecting to dashboard...');
      } else {
        console.log('Onboarding completed! Redirecting to dashboard...');
      }

      // Navigate to dashboard after successful onboarding
      navigate('/dashboard');
    } catch (error) {
      console.error('Unexpected error in onboarding:', error);
      setError(error instanceof Error ? error.message : 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canStartTracking = (whiteStudyId || blackStudyId) && !isLoading;

  return (
    <div className={styles.onboardingPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🎯 Choose Your Repertoire</h1>
          <div className={styles.welcome}>
            <h2 className={styles.welcomeTitle}>🧠 Welcome to OutOfBook</h2>
            <p className={styles.welcomeSubtitle}>Track your games against your prep.</p>
          </div>
        </div>

        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div className={styles.progressStep}>
              <div className={`${styles.progressDot} ${styles.progressDotCompleted}`}>✓</div>
              <span className={styles.progressLabel}>Connect Lichess</span>
            </div>
            <div className={styles.progressLine}></div>
            <div className={styles.progressStep}>
              <div className={`${styles.progressDot} ${styles.progressDotActive}`}>2</div>
              <span className={styles.progressLabel}>Choose Studies</span>
            </div>
            <div className={styles.progressLine}></div>
            <div className={styles.progressStep}>
              <div className={styles.progressDot}>3</div>
              <span className={styles.progressLabel}>Start Tracking</span>
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.quickStart}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Quick Start</h3>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.demoOption}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isDemoMode}
                      onChange={e => handleDemoModeToggle(e.target.checked)}
                      disabled={isLoading}
                    />
                    Load Demo Repertoires
                  </label>
                  <p className={styles.demoDescription}>
                    Perfect for trying out the system with sample opening studies
                  </p>
                  {isDemoMode && (
                    <div className={styles.demoInfo}>
                      <div className={styles.demoStudy}>
                        <span className={styles.demoLabel}>White Demo:</span>
                        <a
                          href={DEMO_WHITE_STUDY}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.demoLink}
                        >
                          Sample White Repertoire →
                        </a>
                      </div>
                      <div className={styles.demoStudy}>
                        <span className={styles.demoLabel}>Black Demo:</span>
                        <a
                          href={DEMO_BLACK_STUDY}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.demoLink}
                        >
                          Sample Black Repertoire →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!isDemoMode && <StudySelector onStudyChange={handleStudyChange} isLoading={isLoading} />}

          <div className={styles.actions}>
            <button
              className={`${styles.primaryButton} ${!canStartTracking ? styles.buttonDisabled : ''}`}
              onClick={handleStartTracking}
              disabled={!canStartTracking}
            >
              {isLoading ? 'Setting up...' : isDemoMode ? "🚀 Let's go!" : '✅ Start Tracking Your Games'}
            </button>
          </div>

          <div className={styles.help}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Help & Privacy</h3>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.helpItems}>
                  <div className={styles.helpItem}>
                    <span className={styles.helpIcon}>📚</span>
                    <span>Need help? Check our guide on setting up studies</span>
                  </div>
                  <div className={styles.helpItem}>
                    <span className={styles.helpIcon}>🔒</span>
                    <span>Your studies stay private - we only read your opening lines</span>
                  </div>
                  <div className={styles.helpItem}>
                    <span className={styles.helpIcon}>📎</span>
                    <span>We'll access your studies through your Lichess account</span>
                  </div>
                  {isDemoMode && (
                    <div className={styles.helpItem}>
                      <span className={styles.helpIcon}>🎯</span>
                      <span>Demo mode uses sample studies - you can change these later in Settings</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
