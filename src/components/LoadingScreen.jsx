import React, { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ onFinish }) {
  const [showSwipe, setShowSwipe] = useState(false);

  useEffect(() => {
    // Simulate loading for 1.6s, then trigger swipe
    const timer = setTimeout(() => {
      setShowSwipe(true);
      // Swipe animation lasts 1s, then call onFinish
      setTimeout(() => {
        onFinish();
      }, 1000);
    }, 1600);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={styles.loadingRoot}>
      <div className={styles.centeredLogo}>
        <img
          src="/logo.png"
          alt="Logo"
          className={styles.logoImg}
        />
      </div>
      {showSwipe && <div className={styles.swipeReveal} />}
    </div>
  );
}
