import React from 'react';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  return (
    <div className={styles.landingPage}>
      <div className={styles.maintenanceBanner}>
        <div className={styles.bannerContent}>
          <span className={styles.bannerIcon}>🚧</span>
          <span className={styles.bannerText}>
            This project is currently under reconstruction.
          </span>
          <a
            href="https://github.com/aadjones/opening-check-js"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bannerLink}
          >
            View on GitHub →
          </a>
        </div>
      </div>
      <div className="container">
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>🧠 OutOfBook</h1>
          <p className={styles.heroSubtitle}>Track your real chess games against your real prep.</p>

          <div className={styles.heroActions}>
            <button disabled className="btn btn-primary btn-lg" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              Connect with Lichess
            </button>
            <button disabled className="btn btn-secondary btn-lg" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              Try a demo
            </button>
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
