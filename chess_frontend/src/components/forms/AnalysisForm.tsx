// src/AnalysisForm.tsx
import React from 'react';
import styles from './AnalysisForm.module.css';

interface AnalysisFormProps {
  lichessUsername: string;
  setLichessUsername: (value: string) => void;
  maxGames: string;
  setMaxGames: (value: string) => void;
  studyUrlWhite: string;
  setStudyUrlWhite: (value: string) => void;
  studyUrlBlack: string;
  setStudyUrlBlack: (value: string) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({
  lichessUsername,
  setLichessUsername,
  maxGames,
  setMaxGames,
  studyUrlWhite,
  setStudyUrlWhite,
  studyUrlBlack,
  setStudyUrlBlack,
  handleSubmit,
  isLoading,
}) => {
  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="lichessUsername" className={styles.label}>
          Enter your Lichess username
        </label>
        <input
          type="text"
          id="lichessUsername"
          className={styles.input}
          value={lichessUsername}
          onChange={e => setLichessUsername(e.target.value)}
          placeholder="e.g., Magnus_Carlsen"
          required
          disabled={isLoading}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="maxGames" className={styles.label}>
          Enter number of games to analyze
        </label>
        <input
          type="number"
          id="maxGames"
          className={styles.input}
          value={maxGames}
          onChange={e => setMaxGames(e.target.value)}
          placeholder="1"
          required
          min="1"
          max="50"
          disabled={isLoading}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="studyUrlWhite" className={styles.label}>
          Enter the URL of your White Lichess study
        </label>
        <input
          type="url"
          id="studyUrlWhite"
          className={`${styles.input} ${styles.urlInput}`}
          value={studyUrlWhite}
          onChange={e => setStudyUrlWhite(e.target.value)}
          placeholder="https://lichess.org/study/abc123/def456"
          required
          disabled={isLoading}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="studyUrlBlack" className={styles.label}>
          Enter the URL of your Black Lichess study
        </label>
        <input
          type="url"
          id="studyUrlBlack"
          className={`${styles.input} ${styles.urlInput}`}
          value={studyUrlBlack}
          onChange={e => setStudyUrlBlack(e.target.value)}
          placeholder="https://lichess.org/study/xyz789/uvw012"
          required
          disabled={isLoading}
        />
      </div>

      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? '⏳ Analyzing...' : 'Submit'}
      </button>
    </form>
  );
};

export default AnalysisForm;
