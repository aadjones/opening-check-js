import React from 'react';
import styles from './UnderConstruction.module.css';

interface UnderConstructionProps {
  title?: string;
  message?: string;
  showIcon?: boolean;
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({
  title = 'Under Construction',
  message = 'This feature is currently being developed. Check back soon!',
  showIcon = true,
  variant = 'banner',
  className = '',
}) => {
  return (
    <div className={`${styles.underConstruction} ${styles[variant]} ${className}`}>
      {showIcon && <div className={styles.icon}>🚧</div>}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

export default UnderConstruction;
