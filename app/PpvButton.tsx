'use client';

import styles from './page.module.css';

export default function PpvButton() {
  return (
    <button
      className={styles.ppvBtn}
      onClick={() => alert('This feature is coming soon. Just like your pizza skills.')}
    >
      Unlock for €1.99
    </button>
  );
}
