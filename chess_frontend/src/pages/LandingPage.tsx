import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  const { signInWithOAuth, loading } = useAuth();

  const handleLichessLogin = async () => {
    try {
      await signInWithOAuth('lichess');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className={styles.landingPage}>
      <div className="container">
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>🧠 OutOfBook</h1>
          <p className={styles.heroSubtitle}>Track your real chess games against your real prep.</p>

          <div className={styles.heroActions}>
            <button onClick={handleLichessLogin} disabled={loading} className="btn btn-primary btn-lg">
              {loading ? 'Connecting...' : 'Connect with Lichess'}
            </button>
            <Link to="/demo" className="btn btn-secondary btn-lg">
              Try a demo
            </Link>
          </div>
        </section>
      </div>

      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.featuresTitle}>Why OutOfBook?</h2>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🧠</div>
              <h3 className={styles.featureTitle}>Remembers for You</h3>
              <p className={styles.featureDescription}>Forget your prep? OutOfBook never does.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔁</div>
              <h3 className={styles.featureTitle}>Catches Every Slip</h3>
              <p className={styles.featureDescription}>Drift off-book? We spot it instantly.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📍</div>
              <h3 className={styles.featureTitle}>Turns Mistakes Into Wins</h3>
              <p className={styles.featureDescription}>See patterns. Fix habits. Win more games.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
