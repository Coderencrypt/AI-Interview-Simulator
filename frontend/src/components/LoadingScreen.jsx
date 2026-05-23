import React from 'react'
import styles from './LoadingScreen.module.css'

export default function LoadingScreen({ message = 'Processing...' }) {
  return (
    <div className={styles.screen}>
      <div className={styles.spinner}>
        <div className={styles.ring1} />
        <div className={styles.ring2} />
        <div className={styles.core} />
      </div>
      <p className={styles.message}>{message}</p>
      <p className={styles.sub}>Powered by Claude AI</p>
    </div>
  )
}
