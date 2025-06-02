import React, { useState, useCallback } from 'react';
import styles from './StudySelector.module.css';
import { validateStudyAccess, type StudyValidationResult } from '../lib/lichess/studyValidation';
import { useAuth } from '../hooks/useAuth';

interface StudySelectorProps {
  onStudyChange: (whiteStudyId: string | null, blackStudyId: string | null) => void;
  isLoading?: boolean;
}

// Enhanced validation interface that includes API validation results
interface StudyValidation {
  isValid: boolean;
  error?: string;
  studyName?: string;
  isPublic?: boolean;
  chapterCount?: number;
  isValidating?: boolean;
}

const LICHESS_STUDY_PATTERN = /^https?:\/\/lichess\.org\/study\/([a-zA-Z0-9]+)(?:\/[a-zA-Z0-9]+)?$/;

const StudySelector: React.FC<StudySelectorProps> = ({ onStudyChange, isLoading = false }) => {
  const { session } = useAuth();
  const [whiteStudyUrl, setWhiteStudyUrl] = useState('');
  const [blackStudyUrl, setBlackStudyUrl] = useState('');
  const [whiteValidation, setWhiteValidation] = useState<StudyValidation>({ isValid: true });
  const [blackValidation, setBlackValidation] = useState<StudyValidation>({ isValid: true });

  // Basic URL format validation (client-side)
  const validateStudyUrl = useCallback((url: string): StudyValidation => {
    if (!url) {
      return { isValid: true }; // Empty is valid (not required yet)
    }
    
    if (!LICHESS_STUDY_PATTERN.test(url)) {
      return {
        isValid: false,
        error: 'Please enter a valid Lichess study URL (e.g., https://lichess.org/study/abc123)'
      };
    }

    return { isValid: true };
  }, []);

  // API validation function
  const performApiValidation = useCallback(async (
    url: string, 
    setValidation: (validation: StudyValidation | ((prev: StudyValidation) => StudyValidation)) => void
  ): Promise<void> => {
    if (!url) return;

    // Set loading state
    setValidation((prev: StudyValidation) => ({ ...prev, isValidating: true }));

    try {
      // Get user's Lichess access token if available
      const accessToken = session?.accessToken;
      
      // Call our validation API
      const result: StudyValidationResult = await validateStudyAccess(url, accessToken);
      
      if (result.isValid) {
        setValidation({
          isValid: true,
          studyName: result.studyName,
          isPublic: result.isPublic,
          chapterCount: result.chapterCount,
          isValidating: false
        });
      } else {
        setValidation({
          isValid: false,
          error: result.error,
          isValidating: false
        });
      }
    } catch (error) {
      console.error('Study validation error:', error);
      setValidation({
        isValid: false,
        error: 'An unexpected error occurred while validating the study. Please try again.',
        isValidating: false
      });
    }
  }, [session?.accessToken]);

  const handleWhiteStudyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setWhiteStudyUrl(url);
    
    // Reset to basic validation when URL changes
    const validation = validateStudyUrl(url);
    setWhiteValidation(validation);
    
    if (validation.isValid) {
      const match = url.match(LICHESS_STUDY_PATTERN);
      onStudyChange(match ? match[1] : null, null);
    }
  };

  const handleBlackStudyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setBlackStudyUrl(url);
    
    // Reset to basic validation when URL changes
    const validation = validateStudyUrl(url);
    setBlackValidation(validation);
    
    if (validation.isValid) {
      const match = url.match(LICHESS_STUDY_PATTERN);
      onStudyChange(null, match ? match[1] : null);
    }
  };

  const handleWhiteValidation = () => {
    performApiValidation(whiteStudyUrl, setWhiteValidation);
  };

  const handleBlackValidation = () => {
    performApiValidation(blackStudyUrl, setBlackValidation);
  };

  return (
    <div className={styles.studySelector}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>White Repertoire</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGroup}>
            <label htmlFor="white-study" className={styles.label}>
              White Repertoire Study URL
            </label>
            <div className={styles.inputGroup}>
              <input
                type="url"
                id="white-study"
                className={`${styles.input} ${!whiteValidation.isValid ? styles.inputError : ''}`}
                value={whiteStudyUrl}
                onChange={handleWhiteStudyChange}
                placeholder="https://lichess.org/study/abc123"
                disabled={isLoading || whiteValidation.isValidating}
              />
              <button
                type="button"
                className={styles.validateButton}
                disabled={isLoading || !whiteStudyUrl || whiteValidation.isValidating || !validateStudyUrl(whiteStudyUrl).isValid}
                onClick={handleWhiteValidation}
              >
                {whiteValidation.isValidating ? 'Validating...' : 'Validate'}
              </button>
            </div>
            {!whiteValidation.isValid && (
              <div className={styles.errorMessage}>{whiteValidation.error}</div>
            )}
            {whiteValidation.isValid && whiteValidation.studyName && (
              <div className={styles.successMessage}>
                ✓ Study found: "{whiteValidation.studyName}" 
                {whiteValidation.chapterCount && ` (${whiteValidation.chapterCount} chapters)`}
                {whiteValidation.isPublic !== undefined && (
                  <span className={styles.visibilityBadge}>
                    {whiteValidation.isPublic ? 'Public' : 'Private'}
                  </span>
                )}
              </div>
            )}
            <div className={styles.helpText}>
              <a href="https://lichess.org/study" target="_blank" rel="noopener noreferrer">
                How to find your study URL? →
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Black Repertoire</h3>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGroup}>
            <label htmlFor="black-study" className={styles.label}>
              Black Repertoire Study URL
            </label>
            <div className={styles.inputGroup}>
              <input
                type="url"
                id="black-study"
                className={`${styles.input} ${!blackValidation.isValid ? styles.inputError : ''}`}
                value={blackStudyUrl}
                onChange={handleBlackStudyChange}
                placeholder="https://lichess.org/study/xyz789"
                disabled={isLoading || blackValidation.isValidating}
              />
              <button
                type="button"
                className={styles.validateButton}
                disabled={isLoading || !blackStudyUrl || blackValidation.isValidating || !validateStudyUrl(blackStudyUrl).isValid}
                onClick={handleBlackValidation}
              >
                {blackValidation.isValidating ? 'Validating...' : 'Validate'}
              </button>
            </div>
            {!blackValidation.isValid && (
              <div className={styles.errorMessage}>{blackValidation.error}</div>
            )}
            {blackValidation.isValid && blackValidation.studyName && (
              <div className={styles.successMessage}>
                ✓ Study found: "{blackValidation.studyName}" 
                {blackValidation.chapterCount && ` (${blackValidation.chapterCount} chapters)`}
                {blackValidation.isPublic !== undefined && (
                  <span className={styles.visibilityBadge}>
                    {blackValidation.isPublic ? 'Public' : 'Private'}
                  </span>
                )}
              </div>
            )}
            <div className={styles.helpText}>
              <a href="https://lichess.org/study" target="_blank" rel="noopener noreferrer">
                How to find your study URL? →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySelector; 