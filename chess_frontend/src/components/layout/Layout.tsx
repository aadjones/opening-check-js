import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../';
import styles from './Layout.module.css';
import { SHOW_ANALYSIS_PAGE } from '../../featureFlags';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className="container">
          <nav className={styles.nav}>
            <Link to="/" className={styles.logo}>
              OutOfBook
            </Link>

            <div className={styles.navRight}>
              <ul className={styles.navLinks}>
                <li>
                  <Link
                    to="/dashboard"
                    className={`${styles.navLink} ${location.pathname === '/dashboard' ? styles.active : ''}`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/review-queue"
                    className={`${styles.navLink} ${location.pathname === '/review-queue' ? styles.active : ''}`}
                  >
                    Review Queue
                  </Link>
                </li>
                {SHOW_ANALYSIS_PAGE && (
                  <li>
                    <Link
                      to="/analysis"
                      className={`${styles.navLink} ${location.pathname === '/analysis' ? styles.active : ''}`}
                    >
                      Analysis
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    to="/settings"
                    className={`${styles.navLink} ${location.pathname === '/settings' ? styles.active : ''}`}
                  >
                    Settings
                  </Link>
                </li>
              </ul>

              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <p>&copy; 2025 OutOfBook. Track your chess prep.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
