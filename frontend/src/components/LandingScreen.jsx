import React from 'react'
import styles from './LandingScreen.module.css'

const FEATURES = [
  { icon: '🎙️', label: 'Voice Recognition' },
  { icon: '🧠', label: 'AI-Powered Questions' },
  { icon: '📹', label: 'Live Emotion Tracking' },
  { icon: '📊', label: 'Detailed Scoring' },
  { icon: '💬', label: 'Instant Feedback' },
  { icon: '🎯', label: '8+ Job Roles' },
]

export default function LandingScreen({ onStart }) {
  return (
    <div className={styles.landing}>
      <div className="grid-bg" />

      <div className={styles.content}>
        {/* Badge */}
        <div className={styles.logoBadge}>
          <span className={styles.dot} />
          AI-POWERED · CLAUDE SONNET
        </div>

        {/* Headline */}
        <h1 className={styles.headline}>
          Ace Your Next<br />
          <span className={styles.gradient}>Job Interview</span>
        </h1>

        <p className={styles.subheadline}>
          Practice with a real AI interviewer. Get instant, honest feedback on your
          answers, communication style, and confidence — all powered by Claude AI.
        </p>

        {/* Feature chips */}
        <div className={styles.featuresGrid}>
          {FEATURES.map(({ icon, label }) => (
            <div key={label} className={styles.featChip}>
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button className="btn-primary" onClick={onStart} style={{ fontSize: '1.05rem', padding: '16px 48px' }}>
          Start Interview Practice →
        </button>

        <p className={styles.note}>Free · No signup required · Runs in your browser</p>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { num: '5', lbl: 'Questions per session' },
            { num: 'AI', lbl: 'Real-time analysis' },
            { num: '8+', lbl: 'Job roles available' },
          ].map(({ num, lbl }) => (
            <div key={lbl} className={styles.statCard}>
              <div className={styles.statNum}>{num}</div>
              <div className={styles.statLbl}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
