import React, { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from './Settings.module.css';

const Settings: React.FC = () => {
  usePageTitle('Settings');
  const [whiteStudy, setWhiteStudy] = useState('');
  const [blackStudy, setBlackStudy] = useState('');
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

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings...', {
      whiteStudy,
      blackStudy,
      timeControls,
      gameTypes,
      notificationFrequency,
      celebrateSuccess,
    });
  };

  const handleCancel = () => {
    // TODO: Reset to original values or navigate away
    console.log('Cancelling changes...');
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
              placeholder="Lichess study URL for White"
              value={whiteStudy}
              onChange={e => setWhiteStudy(e.target.value)}
            />
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
              placeholder="Lichess study URL for Black"
              value={blackStudy}
              onChange={e => setBlackStudy(e.target.value)}
            />
            <div className={styles.helpText}>
              Enter the URL of your Lichess study containing your Black opening repertoire
            </div>
          </div>
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
          <button className={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
