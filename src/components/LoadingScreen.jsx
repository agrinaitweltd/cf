import React, { useEffect, useState, useRef } from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ onFinish, logoSrc = '/logo.png', logoAlt = 'CF HUB UK' }) {
  const [phase, setPhase] = useState('spin'); // spin → swipe → done
  const calledRef = useRef(false);

  useEffect(() => {
    calledRef.current = false;
    let swipeTimer;
    let finishTimer;

    swipeTimer = setTimeout(() => {
      setPhase('swipe');

      finishTimer = setTimeout(() => {
        if (!calledRef.current) {
          calledRef.current = true;
          onFinish();
        }
      }, 900);
    }, 1500);

    return () => {
      clearTimeout(swipeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={styles.loadingRoot} aria-live="polite">
      <div className={styles.centeredLogo}>
        <img
          src={logoSrc}
          alt={logoAlt}
          className={styles.logoImg}
          draggable="false"
        />
      </div>
      {phase === 'swipe' && <div className={styles.swipeReveal} />}
    </div>
  );
}
