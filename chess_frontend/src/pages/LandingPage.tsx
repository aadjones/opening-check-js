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
            <button 
              onClick={handleLichessLogin}
              disabled={loading}
              className="btn btn-primary btn-lg"
            >
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
              <div className={styles.featureIcon}>🎯</div>
              <h3 className={styles.featureTitle}>Automatic Detection</h3>
              <p className={styles.featureDescription}>
                We automatically detect when you deviate from your prepared lines during real games.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>Instant Feedback</h3>
              <p className={styles.featureDescription}>
                Get notified right after you make a mistake, while the position is still fresh in your mind.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📈</div>
              <h3 className={styles.featureTitle}>Stay Consistent</h3>
              <p className={styles.featureDescription}>
                Keep your actual play aligned with your study preparation for better results.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
