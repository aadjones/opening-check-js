import React, { useState, useCallback } from 'react';
import styles from './StudySelector.module.css';

interface StudySelectorProps {
  onStudyChange: (whiteStudyId: string | null, blackStudyId: string | null) => void;
  isLoading?: boolean;
}

interface StudyValidation {
  isValid: boolean;
  error?: string;
}

const LICHESS_STUDY_PATTERN = /^https?:\/\/lichess\.org\/study\/([a-zA-Z0-9]+)(?:\/[a-zA-Z0-9]+)?$/;

const StudySelector: React.FC<StudySelectorProps> = ({ onStudyChange, isLoading = false }) => {
  const [whiteStudyUrl, setWhiteStudyUrl] = useState('');
  const [blackStudyUrl, setBlackStudyUrl] = useState('');
  const [whiteValidation, setWhiteValidation] = useState<StudyValidation>({ isValid: true });
  const [blackValidation, setBlackValidation] = useState<StudyValidation>({ isValid: true });

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

  const handleWhiteStudyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setWhiteStudyUrl(url);
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
    const validation = validateStudyUrl(url);
    setBlackValidation(validation);
    
    if (validation.isValid) {
      const match = url.match(LICHESS_STUDY_PATTERN);
      onStudyChange(null, match ? match[1] : null);
    }
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
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.validateButton}
                disabled={isLoading || !whiteStudyUrl}
                onClick={() => {/* TODO: Implement validation */}}
              >
                Validate
              </button>
            </div>
            {!whiteValidation.isValid && (
              <div className={styles.errorMessage}>{whiteValidation.error}</div>
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
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.validateButton}
                disabled={isLoading || !blackStudyUrl}
                onClick={() => {/* TODO: Implement validation */}}
              >
                Validate
              </button>
            </div>
            {!blackValidation.isValid && (
              <div className={styles.errorMessage}>{blackValidation.error}</div>
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