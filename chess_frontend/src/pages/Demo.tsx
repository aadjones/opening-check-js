import React from 'react';
import { UnderConstruction } from '../components';
import styles from './Demo.module.css';

const Demo: React.FC = () => {
  return (
    <div className={`dev ${styles.demo}`}>
      <UnderConstruction
        title="Demo Page Under Construction"
        message="We're rebuilding this page. Check back soon for a new interactive demo!"
        variant="banner"
      />
    </div>
  );
};

export default Demo;
