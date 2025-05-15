// src/App.tsx
import { useState } from 'react';
import './App.css'; // Or your preferred styling

// Import the new components
import AnalysisForm from './AnalysisForm';
import DeviationDisplay from './DeviationDisplay';
import type { ApiDeviationResult } from './DeviationDisplay';

function App() {
  // State for form inputs
  const [username, setUsername] = useState<string>('Jrjrjr4');
  const [maxGames, setMaxGames] = useState<string>('1');
  const [studyUrlWhite, setStudyUrlWhite] = useState<string>(
    'https://lichess.org/study/14RZiFdX/fvGLXd1D'
  );
  const [studyUrlBlack, setStudyUrlBlack] = useState<string>(
    'https://lichess.org/study/bve0Qw48/7ZVSY8Po'
  );

  // State for API response and loading/error messages
  const [analysisResults, setAnalysisResults] = useState<Array<ApiDeviationResult | null>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setAnalysisResults([]);

    const requestBody = {
      username: username,
      study_url_white: studyUrlWhite,
      study_url_black: studyUrlBlack,
      max_games: parseInt(maxGames, 10),
    };

    try {
      const response = await fetch('http://localhost:8000/api/analyze_games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error from backend' }));
        throw new Error(
          `Network response was not ok: ${response.status} ${response.statusText}. Detail: ${errorData.detail || 'No additional detail'}`
        );
      }
      const data: Array<ApiDeviationResult | null> = await response.json();
      setAnalysisResults(data);
    } catch (error) {
      console.error('Failed to analyze games:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Chess Opening Repertoire Practice</h1>

      <div className="main-card">
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

      {errorMessage && <p className="error-message">Error: {errorMessage}</p>}

      <div className="analysis-section">
        <div className="analysis-title">Analysis Results:</div>
        {isLoading && <p>Loading analysis...</p>}
        {!isLoading && analysisResults.length === 0 && !errorMessage && (
          <p>No analysis performed yet, or no deviations found.</p>
        )}
        <div className="results-grid">
          {!isLoading && analysisResults.length > 0 &&
            analysisResults.map((result, index) => (
              <DeviationDisplay
                key={index}
                result={result}
                gameNumber={index + 1}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;