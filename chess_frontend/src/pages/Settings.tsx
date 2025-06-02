import React, { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../hooks/useAuth';
import { getUserStudies, saveUserStudies, type UserStudies } from '../lib/auth/onboardingUtils';
import { extractStudyId } from '../lib/lichess/studyValidation';
import styles from './Settings.module.css';

const Settings: React.FC = () => {
  usePageTitle('Settings');
  const { session } = useAuth();
  const [whiteStudy, setWhiteStudy] = useState('');
  const [blackStudy, setBlackStudy] = useState('');
  const [originalStudies, setOriginalStudies] = useState<UserStudies | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [timeControls, setTimeControls] = useState({
    bullet: true,
    blitz: true,
    rapid: true,
    classical: true,
  });
  const [gameTypes, setGameTypes] = useState({
    rated: true,
    casual: false,
    human: true,
    bot: false,
  });
  const [notificationFrequency, setNotificationFrequency] = useState('every');
  const [celebrateSuccess, setCelebrateSuccess] = useState(false);

  // Load user's studies on component mount
  useEffect(() => {
    if (session?.user?.id) {
      const userStudies = getUserStudies(session.user.id);
      if (userStudies) {
        setOriginalStudies(userStudies);
        // Convert study IDs back to URLs for display
        setWhiteStudy(userStudies.whiteStudyId ? `https://lichess.org/study/${userStudies.whiteStudyId}` : '');
        setBlackStudy(userStudies.blackStudyId ? `https://lichess.org/study/${userStudies.blackStudyId}` : '');
      }
    }
  }, [session?.user?.id]);

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const handleTimeControlChange = (control: keyof typeof timeControls) => {
    setTimeControls(prev => ({
      ...prev,
      [control]: !prev[control],
    }));
  };

  const handleGameTypeChange = (type: keyof typeof gameTypes) => {
    setGameTypes(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      setSaveMessage({ type: 'error', text: 'No user session found' });
      return;
    }

    setIsLoading(true);
    setSaveMessage(null);

    try {
      // Extract study IDs from URLs
      const whiteStudyId = whiteStudy ? extractStudyId(whiteStudy) : null;
      const blackStudyId = blackStudy ? extractStudyId(blackStudy) : null;

      // Validate that at least one study is provided
      if (!whiteStudyId && !blackStudyId) {
        setSaveMessage({ type: 'error', text: 'Please provide at least one study URL' });
        return;
      }

      // Save studies using the onboarding utility
      saveUserStudies(session.user.id, whiteStudyId, blackStudyId);

      // Update original studies for comparison
      const newStudies = getUserStudies(session.user.id);
      setOriginalStudies(newStudies);

      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });

      // TODO: Save other settings (time controls, notifications, etc.)
      console.log('Other settings to save:', {
        timeControls,
        gameTypes,
        notificationFrequency,
        celebrateSuccess,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (originalStudies) {
      setWhiteStudy(originalStudies.whiteStudyId ? `https://lichess.org/study/${originalStudies.whiteStudyId}` : '');
      setBlackStudy(originalStudies.blackStudyId ? `https://lichess.org/study/${originalStudies.blackStudyId}` : '');
    } else {
      setWhiteStudy('');
      setBlackStudy('');
    }
    setSaveMessage(null);
  };

  // Check if studies have been modified
  const hasStudyChanges = () => {
    if (!originalStudies) return whiteStudy || blackStudy;
    
    const currentWhiteId = whiteStudy ? extractStudyId(whiteStudy) : null;
    const currentBlackId = blackStudy ? extractStudyId(blackStudy) : null;
    
    return currentWhiteId !== originalStudies.whiteStudyId || 
           currentBlackId !== originalStudies.blackStudyId;
  };

  const formatStudyDisplay = (studyUrl: string) => {
    if (!studyUrl) return null;
    
    const studyId = extractStudyId(studyUrl);
    if (!studyId) return null;

    return (
      <div className={styles.studyInfo}>
        <span className={styles.studyId}>Study ID: {studyId}</span>
        <a 
          href={studyUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.studyLink}
        >
          View on Lichess →
        </a>
      </div>
    );
  };

  return (
    <div className={styles.settings}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Configure your repertoire studies and preferences</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Repertoire Studies</h2>
          {originalStudies && (
            <div className={styles.studyStatus}>
              <span className={styles.statusText}>
                ✅ Configured during onboarding on {new Date(originalStudies.completedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.formGroup}>
            <label htmlFor="white-study" className={styles.label}>
              White Repertoire:
            </label>
            <input
              type="text"
              id="white-study"
              className={styles.input}
              placeholder="https://lichess.org/study/abc123"
              value={whiteStudy}
              onChange={e => setWhiteStudy(e.target.value)}
            />
            {formatStudyDisplay(whiteStudy)}
            <div className={styles.helpText}>
              Enter the URL of your Lichess study containing your White opening repertoire
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="black-study" className={styles.label}>
              Black Repertoire:
            </label>
            <input
              type="text"
              id="black-study"
              className={styles.input}
              placeholder="https://lichess.org/study/xyz789"
              value={blackStudy}
              onChange={e => setBlackStudy(e.target.value)}
            />
            {formatStudyDisplay(blackStudy)}
            <div className={styles.helpText}>
              Enter the URL of your Lichess study containing your Black opening repertoire
            </div>
          </div>

          {saveMessage && (
            <div className={`${styles.saveMessage} ${styles[saveMessage.type]}`}>
              {saveMessage.text}
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Game Filters</h2>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Time Controls</label>
            <div className={styles.checkboxGroup}>
              {Object.entries(timeControls).map(([control, checked]) => (
                <div key={control} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    id={`time-${control}`}
                    className={styles.checkbox}
                    checked={checked}
                    onChange={() => handleTimeControlChange(control as keyof typeof timeControls)}
                  />
                  <label htmlFor={`time-${control}`} className={styles.checkboxLabel}>
                    {control.charAt(0).toUpperCase() + control.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Game Types</label>
            <div className={styles.checkboxGroup}>
              {Object.entries(gameTypes).map(([type, checked]) => (
                <div key={type} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    id={`game-${type}`}
                    className={styles.checkbox}
                    checked={checked}
                    onChange={() => handleGameTypeChange(type as keyof typeof gameTypes)}
                  />
                  <label htmlFor={`game-${type}`} className={styles.checkboxLabel}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Notifications</h2>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Notification Frequency</label>
            <div className={styles.radioGroup}>
              {[
                { value: 'every', label: 'Every game' },
                { value: 'daily', label: 'Daily digest' },
                { value: 'weekly', label: 'Weekly summary' },
              ].map(({ value, label }) => (
                <div key={value} className={styles.radioItem}>
                  <input
                    type="radio"
                    id={`freq-${value}`}
                    name="frequency"
                    className={styles.radio}
                    value={value}
                    checked={notificationFrequency === value}
                    onChange={e => setNotificationFrequency(e.target.value)}
                  />
                  <label htmlFor={`freq-${value}`} className={styles.radioLabel}>
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                id="celebrate-success"
                className={styles.checkbox}
                checked={celebrateSuccess}
                onChange={e => setCelebrateSuccess(e.target.checked)}
              />
              <label htmlFor="celebrate-success" className={styles.checkboxLabel}>
                Celebrate when prep is followed perfectly
              </label>
            </div>
            <div className={styles.helpText}>Get positive notifications when you stick to your preparation</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.cancelButton} 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className={`${styles.saveButton} ${hasStudyChanges() ? styles.saveButtonActive : ''}`}
            onClick={handleSave}
            disabled={isLoading || !hasStudyChanges()}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
