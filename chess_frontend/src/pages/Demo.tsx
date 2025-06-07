import React, { useState } from 'react';
import { AnalysisForm, DeviationDisplay, UnderConstruction } from '../components';
import { usePageTitle } from '../hooks/usePageTitle';
import type { ApiDeviationResult } from '../types';
import styles from './Demo.module.css';

const Demo: React.FC = () => {
  usePageTitle('Demo');
  // State for form inputs
  const [username, setUsername] = useState<string>('Jrjrjr4');
  const [maxGames, setMaxGames] = useState<string>('1');
  const [studyUrlWhite, setStudyUrlWhite] = useState<string>('https://lichess.org/study/14RZiFdX/fvGLXd1D');
  const [studyUrlBlack, setStudyUrlBlack] = useState<string>('https://lichess.org/study/bve0Qw48/7ZVSY8Po');

  // State for API response and loading/error messages
  const [analysisResults, setAnalysisResults] = useState<Array<ApiDeviationResult | null>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setAnalysisResults([]);

    // Demo mode - simulate loading and show a friendly message
    setTimeout(() => {
      setIsLoading(false);
      setAnalysisResults([]);
      // Instead of an error, we'll show a message in the empty state
    }, 1500);
  };

  return (
    <div className={styles.demo}>
      <UnderConstruction
        title="Interactive Demo Coming Soon"
        message="You can explore the UI and see how the form works! The submit button will simulate loading but won't call the actual backend API."
        variant="banner"
      />

      <header className={styles.header}>
        <h1 className={styles.title}>🧪 Demo Analysis Tool</h1>
        <p className={styles.subtitle}>Test the analysis functionality with any Lichess username and studies</p>
      </header>

      <div className={styles.formCard}>
        <AnalysisForm
          username={username}
          setUsername={setUsername}
          maxGames={maxGames}
          setMaxGames={setMaxGames}
          studyUrlWhite={studyUrlWhite}
          setStudyUrlWhite={setStudyUrlWhite}
          studyUrlBlack={studyUrlBlack}
          setStudyUrlBlack={setStudyUrlBlack}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {errorMessage && (
        <div className={styles.errorMessage}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <section className={styles.resultsSection}>
        <div className={styles.resultsSectionHeader}>
          <h2 className={styles.resultsSectionTitle}>Analysis Results</h2>
        </div>
        <div className={styles.resultsSectionContent}>
          {isLoading && <div className={styles.loadingMessage}>⏳ Loading analysis...</div>}

          {!isLoading && analysisResults.length === 0 && !errorMessage && (
            <div className={styles.emptyMessage}>
              🎭 Demo mode active! The analysis functionality is working behind the scenes.
              <br />
              In the full version, your game analysis results would appear here.
            </div>
          )}

          {!isLoading && analysisResults.length > 0 && (
            <div className={styles.resultsGrid}>
              {analysisResults.map((result, index) => (
                <DeviationDisplay key={index} result={result} gameNumber={index + 1} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Demo;
