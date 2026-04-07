import React, { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ onFinish }) {
  const [showSwipe, setShowSwipe] = useState(false);

  useEffect(() => {
    let finishTimer;

    const swipeTimer = setTimeout(() => {
      setShowSwipe(true);

      finishTimer = setTimeout(() => {
        onFinish();
      }, 1000);
    }, 1600);

    return () => {
      clearTimeout(swipeTimer);
      clearTimeout(finishTimer);
    };
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
