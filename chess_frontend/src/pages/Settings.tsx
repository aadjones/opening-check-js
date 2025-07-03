import React, { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../hooks/useAuth';
import { extractStudyId } from '../lib/lichess/studyValidation';
import styles from './Settings.module.css';
import { fetchSupabaseJWT } from '../lib/auth/fetchSupabaseJWT';
import { createClient } from '@supabase/supabase-js';
import { saveUserStudySelections, getUserStudySelections } from '../lib/database/studyOperations';
import { useTriggerStudyUpdate } from '../contexts/useStudyUpdate';

interface SyncPreferences {
  sync_frequency_minutes: number;
  is_auto_sync_enabled: boolean;
  updated_at: string | null;
}

const Settings: React.FC = () => {
  usePageTitle('Settings');
  const { session } = useAuth();
  const [whiteStudy, setWhiteStudy] = useState('');
  const [blackStudy, setBlackStudy] = useState('');
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

  const [syncPreferences, setSyncPreferences] = useState<SyncPreferences>({
    sync_frequency_minutes: 60,
    is_auto_sync_enabled: true,
    updated_at: null,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isSavingStudies, setIsSavingStudies] = useState(false);

  const triggerStudyUpdate = useTriggerStudyUpdate();

  // Load user's studies on component mount
  useEffect(() => {
    if (session?.user?.id) {
      (async () => {
        try {
          const studies = await getUserStudySelections(session.user.id as string);
          console.log('[Settings] Loaded studies from DB:', studies);
          setWhiteStudy(studies.whiteStudyId ? `https://lichess.org/study/${studies.whiteStudyId}` : '');
          setBlackStudy(studies.blackStudyId ? `https://lichess.org/study/${studies.blackStudyId}` : '');
        } catch (err) {
          console.error('[Settings] Failed to load studies from DB:', err);
        }
      })();
    }
  }, [session?.user?.id]);

  // Load sync preferences on mount
  useEffect(() => {
    if (session?.user?.id) {
      const loadSyncPreferences = async () => {
        const supabaseJwt = await fetchSupabaseJWT({
          sub: session.user.id!,
          email: session.user.email || undefined,
          lichess_username: session.user.lichessUsername || undefined,
        });
        const supabaseWithAuth = createClient(
          import.meta.env.VITE_SUPABASE_URL!,
          import.meta.env.VITE_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${supabaseJwt}`,
              },
            },
          }
        );
        const { data, error } = await supabaseWithAuth
          .from('sync_preferences')
          .select('sync_frequency_minutes, is_auto_sync_enabled, updated_at')
          .eq('user_id', session.user.id)
          .single();
        if (error) {
          console.error('Error loading sync preferences:', error);
          return;
        }
        if (data) {
          setSyncPreferences(prev => ({
            ...prev,
            sync_frequency_minutes: data.sync_frequency_minutes,
            is_auto_sync_enabled: data.is_auto_sync_enabled,
            updated_at: data.updated_at,
          }));
        }
      };
      loadSyncPreferences();
    }
  }, [session?.user?.id, session?.user?.email, session?.user?.lichessUsername]);

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  // Clear sync message after 3 seconds
  useEffect(() => {
    if (syncMessage) {
      const timer = setTimeout(() => setSyncMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [syncMessage]);

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

  const formatStudyDisplay = (studyUrl: string) => {
    if (!studyUrl) return null;

    const studyId = extractStudyId(studyUrl);
    if (!studyId) return null;

    return (
      <div className={styles.studyInfo}>
        <span className={styles.studyId}>Study ID: {studyId}</span>
        <a href={studyUrl} target="_blank" rel="noopener noreferrer" className={styles.studyLink}>
          View on Lichess →
        </a>
      </div>
    );
  };

  const handleSyncNow = async () => {
    if (!session?.user?.id) {
      setSyncMessage({ type: 'error', text: 'You must be logged in to sync games.' });
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const supabaseJwt = await fetchSupabaseJWT({
        sub: session.user.id!,
        email: session.user.email || undefined,
        lichess_username: session.user.lichessUsername || undefined,
      });

      // Get user studies for the API call
      if (!whiteStudy && !blackStudy) {
        throw new Error('No studies configured. Please add study URLs first.');
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analyze_games`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseJwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: session.user.lichessUsername,
          study_url_white: whiteStudy,
          study_url_black: blackStudy,
          max_games: 10,
          scope: 'recent',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setSyncMessage({ type: 'success', text: data.message || 'Games synced successfully!' });

      // Update last sync time
      setSyncPreferences(prev => ({
        ...prev,
        updated_at: new Date().toISOString(),
      }));
    } catch (err: unknown) {
      let message = 'Sync failed';
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'string') message = err;
      setSyncMessage({ type: 'error', text: message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncPreferenceChange = async (updates: Partial<SyncPreferences>) => {
    if (!session?.user?.id) return;
    try {
      const supabaseJwt = await fetchSupabaseJWT({
        sub: session.user.id!,
        email: session.user.email || undefined,
        lichess_username: session.user.lichessUsername || undefined,
      });
      const supabaseWithAuth = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${supabaseJwt}`,
            },
          },
        }
      );
      // Determine whether auto-sync will be enabled after this update
      const updateObj = { ...updates };
      const willBeAuto =
        updateObj.is_auto_sync_enabled !== undefined
          ? updateObj.is_auto_sync_enabled
          : syncPreferences.is_auto_sync_enabled;

      // Ensure frequency is 5 whenever auto-sync is (or remains) enabled
      if (willBeAuto) {
        updateObj.sync_frequency_minutes = 5;
      }
      const { error } = await supabaseWithAuth
        .from('sync_preferences')
        .update(updateObj)
        .eq('user_id', session.user.id);
      if (error) throw error;
      setSyncPreferences(prev => ({ ...prev, ...updateObj }));
      setSaveMessage({ type: 'success', text: 'Sync preferences updated!' });
    } catch (error) {
      console.error('Error updating sync preferences:', error);
      setSaveMessage({ type: 'error', text: 'Failed to update sync preferences.' });
    }
  };

  const handleSaveStudies = async () => {
    if (!session?.user?.id) {
      setSaveMessage({ type: 'error', text: 'You must be logged in to save studies.' });
      return;
    }
    setIsSavingStudies(true);
    setSaveMessage(null);
    try {
      // Extract study IDs from URLs
      const whiteId = extractStudyId(whiteStudy);
      const blackId = extractStudyId(blackStudy);
      console.log('[Settings] Saving studies:', { whiteStudy, blackStudy, whiteId, blackId });
      if (!whiteId && !blackId) {
        throw new Error('Please enter at least one valid study URL.');
      }
      const supabaseJwt = await fetchSupabaseJWT({
        sub: session.user.id!,
        email: session.user.email || undefined,
        lichess_username: session.user.lichessUsername || undefined,
      });
      const supabaseWithAuth = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${supabaseJwt}`,
            },
          },
        }
      );
      // Save studies (activates new, deactivates old)
      await saveUserStudySelections(session.user.id, whiteId, blackId, supabaseWithAuth);
      // Trigger deviation analysis for last 10 games
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analyze_games`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseJwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: session.user.lichessUsername,
          study_url_white: whiteStudy,
          study_url_black: blackStudy,
          max_games: 10,
          scope: 'recent',
        }),
      });
      const data = await res.json();
      console.log('[Settings] Deviation analysis response:', data);
      if (!res.ok) throw new Error(data.error || 'Deviation analysis failed');
      setSaveMessage({ type: 'success', text: data.message || 'Studies updated and deviations recomputed!' });
      console.log('[Settings] About to call triggerStudyUpdate, function exists:', !!triggerStudyUpdate);
      triggerStudyUpdate();
      console.log('[Settings] triggerStudyUpdate called');
      // Optionally, update originalStudies state here if you want to reflect changes
    } catch (err: unknown) {
      let message = 'Failed to update studies';
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'string') message = err;
      setSaveMessage({ type: 'error', text: message });
    } finally {
      setIsSavingStudies(false);
    }
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
              placeholder="https://lichess.org/study/abc123"
              value={whiteStudy}
              onChange={e => setWhiteStudy(e.target.value)}
              disabled={isSavingStudies}
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
              disabled={isSavingStudies}
            />
            {formatStudyDisplay(blackStudy)}
            <div className={styles.helpText}>
              Enter the URL of your Lichess study containing your Black opening repertoire
            </div>
          </div>

          <button
            className={isSavingStudies ? styles.saveButton : `${styles.saveButton} ${styles.saveButtonActive}`}
            onClick={handleSaveStudies}
            disabled={isSavingStudies}
            style={{ marginTop: '1rem', minWidth: 120 }}
          >
            {isSavingStudies ? 'Saving…' : 'Save'}
          </button>

          {saveMessage && <div className={`${styles.saveMessage} ${styles[saveMessage.type]}`}>{saveMessage.text}</div>}
        </div>
      </section>

      <section className={`${styles.section} dev`}>
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
          <h2 className={styles.sectionTitle}>Sync Settings</h2>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.formGroup}>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                id="auto-sync"
                className={styles.checkbox}
                checked={syncPreferences.is_auto_sync_enabled}
                onChange={e => handleSyncPreferenceChange({ is_auto_sync_enabled: e.target.checked })}
              />
              <label htmlFor="auto-sync" className={styles.checkboxLabel}>
                Enable automatic game sync
              </label>
            </div>
            <div className={styles.helpText}>Automatically sync your games from Lichess every 5 minutes</div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.syncStatus}>
              <div className={styles.syncStatusText}>
                {syncPreferences.updated_at
                  ? `Last synced ${new Date(syncPreferences.updated_at).toLocaleString()}`
                  : 'Never synced'}
              </div>
              <button
                className={`${styles.syncButton} ${isSyncing ? styles.syncing : ''}`}
                onClick={handleSyncNow}
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
            {syncMessage && (
              <div className={`${styles.syncMessage} ${styles[syncMessage.type]}`}>{syncMessage.text}</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
