// src/AnalysisForm.tsx
import React from 'react';

interface AnalysisFormProps {
  username: string;
  setUsername: (value: string) => void;
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
  username,
  setUsername,
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
    <form className="analysis-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="username">Enter your Lichess username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="maxGames">Enter number of games to analyze</label>
        <input
          type="number"
          id="maxGames"
          value={maxGames}
          onChange={(e) => setMaxGames(e.target.value)}
          required
          min="1"
        />
      </div>
      <div className="form-group">
        <label htmlFor="studyUrlWhite">Enter the URL of your White Lichess study</label>
        <input
          type="url"
          id="studyUrlWhite"
          value={studyUrlWhite}
          onChange={(e) => setStudyUrlWhite(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="studyUrlBlack">Enter the URL of your Black Lichess study</label>
        <input
          type="url"
          id="studyUrlBlack"
          value={studyUrlBlack}
          onChange={(e) => setStudyUrlBlack(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Analyzing...' : 'Submit'}
      </button>
    </form>
  );
};

export default AnalysisForm;