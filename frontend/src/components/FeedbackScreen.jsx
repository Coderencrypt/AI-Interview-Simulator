import React, { useState, useEffect } from 'react'
import styles from './FeedbackScreen.module.css'

const HIRE_STYLE = {
  'Strong Yes': { bg: 'rgba(16,185,129,0.15)', color: '#10b981', icon: '🌟' },
  Yes:          { bg: 'rgba(0,212,255,0.15)',   color: '#00d4ff', icon: '✅' },
  Maybe:        { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', icon: '🤔' },
  No:           { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444', icon: '❌' },
}

function ScoreRing({ score }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    let frame
    const animate = () => {
      setDisplayed(prev => {
        if (prev >= score) return score
        frame = requestAnimationFrame(animate)
        return prev + 1
      })
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  const deg = (displayed / 100) * 360
  const color = score >= 75 ? '#10b981' : score >= 55 ? '#00d4ff' : '#f59e0b'

  return (
    <div
      className={styles.scoreRing}
      style={{
        background: `conic-gradient(${color} ${deg}deg, var(--surface2) ${deg}deg)`,
      }}
    >
      <div className={styles.scoreInner}>
        <span className={styles.scoreNum} style={{ color }}>{displayed}</span>
        <span className={styles.scoreLabel}>/ 100</span>
      </div>
    </div>
  )
}

function MetricBar({ label, value, color }) {
  const [w, setW] = useState(0)
  useEffect(() => { setTimeout(() => setW(value * 10), 300) }, [value])
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricVal} style={{ color }}>{value}<span style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>/10</span></div>
      <div className={styles.metricLbl}>{label}</div>
      <div className={styles.metricTrack}>
        <div className={styles.metricFill} style={{ width: `${w}%`, background: color }} />
      </div>
    </div>
  )
}

function QAItem({ item, index }) {
  const [open, setOpen] = useState(false)
  const score = item.analysis?.score ?? 7
  const scoreColor = score >= 8 ? '#10b981' : score >= 6 ? '#00d4ff' : '#f59e0b'

  return (
    <div className={styles.qaItem}>
      <div className={styles.qaHeader} onClick={() => setOpen(o => !o)}>
        <div className={styles.qaScore} style={{ color: scoreColor }}>{score}/10</div>
        <div className={styles.qaQ}>Q{index + 1}: {item.question}</div>
        <span className={styles.qaChevron} style={{ transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </div>
      {open && (
        <div className={styles.qaBody}>
          {item.answer && item.answer !== '(Skipped)' && (
            <div className={styles.answerTxt}>
              "{item.answer.slice(0, 350)}{item.answer.length > 350 ? '…' : ''}"
            </div>
          )}
          <div className={styles.miniMetrics}>
            {[
              ['Clarity',     item.analysis?.clarity],
              ['Relevance',   item.analysis?.relevance],
              ['Confidence',  item.analysis?.confidence_indicator],
              ['Communication', item.analysis?.communication],
            ].filter(([, v]) => v != null).map(([l, v]) => (
              <div key={l} className={styles.miniMetric}>
                <span className={styles.miniLbl}>{l}</span>
                <strong className={styles.miniVal}>{v}/10</strong>
              </div>
            ))}
            <div className={styles.miniMetric}>
              <span className={styles.miniLbl}>Mood</span>
              <strong className={styles.miniVal} style={{ color: 'var(--purple)' }}>{item.emotion || 'Calm'}</strong>
            </div>
          </div>
          {item.analysis?.overall_comment && (
            <p className={styles.comment}>💬 {item.analysis.overall_comment}</p>
          )}
          {item.analysis?.ideal_answer_hint && (
            <div className={styles.idealHint}>
              <strong>Better approach:</strong> {item.analysis.ideal_answer_hint}
            </div>
          )}
          {item.analysis?.strengths?.length > 0 && (
            <div className={styles.miniSection}>
              <span style={{ color: 'var(--green)', fontSize: '12px' }}>✓ Strengths: </span>
              <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{item.analysis.strengths.join(' · ')}</span>
            </div>
          )}
          {item.analysis?.improvements?.length > 0 && (
            <div className={styles.miniSection}>
              <span style={{ color: 'var(--amber)', fontSize: '12px' }}>↑ Improve: </span>
              <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{item.analysis.improvements.join(' · ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FeedbackScreen({ feedback, selectedRole, onRetry }) {
  if (!feedback) return null

  const score    = feedback.overall_score ?? 72
  const hire     = feedback.hire_likelihood ?? 'Maybe'
  const hStyle   = HIRE_STYLE[hire] || HIRE_STYLE.Maybe

  const handlePrint = () => window.print()

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <ScoreRing score={score} />
          <div
            className={styles.hireBadge}
            style={{ background: hStyle.bg, color: hStyle.color, borderColor: `${hStyle.color}40` }}
          >
            {hStyle.icon} Hire Recommendation: <strong>{hire}</strong>
          </div>
          <h2 className={styles.headline}>Interview Complete — {selectedRole?.title}</h2>
          <p className={styles.summary}>{feedback.executive_summary}</p>
        </div>

        {/* ── Metrics ── */}
        <div className={styles.metricsGrid}>
          <MetricBar label="Communication" value={feedback.communication_score ?? 7} color="var(--cyan)"   />
          <MetricBar label="Technical"     value={feedback.technical_score     ?? 7} color="var(--purple)" />
          <MetricBar label="Confidence"    value={feedback.confidence_score    ?? 7} color="var(--green)"  />
          <MetricBar label="Preparation"   value={feedback.preparation_score   ?? 7} color="var(--amber)"  />
        </div>

        {/* ── Strengths / Improvements ── */}
        <div className={styles.twoCol}>
          <div className={styles.fbCard}>
            <h3 className={styles.fbTitle} style={{ color: 'var(--green)' }}>✓ Key Strengths</h3>
            <ul className={styles.fbList}>
              {(feedback.key_strengths ?? []).map((s, i) => (
                <li key={i} className={`${styles.fbItem} ${styles.strengthItem}`}>{s}</li>
              ))}
            </ul>
          </div>
          <div className={styles.fbCard}>
            <h3 className={styles.fbTitle} style={{ color: 'var(--amber)' }}>↑ Areas to Improve</h3>
            <ul className={styles.fbList}>
              {(feedback.key_improvements ?? []).map((s, i) => (
                <li key={i} className={`${styles.fbItem} ${styles.improveItem}`}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Per-question breakdown ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Question-by-Question Breakdown</h3>
          <div className={styles.qaList}>
            {(feedback.answers ?? []).map((a, i) => (
              <QAItem key={i} item={a} index={i} />
            ))}
          </div>
        </div>

        {/* ── Action Plan ── */}
        {feedback.next_steps && feedback.next_steps.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Your Action Plan</h3>
            <div className={styles.actionCard}>
              <ol className={styles.actionList}>
                {feedback.next_steps.map((s, i) => (
                  <li key={i} className={styles.actionItem}>{s}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* ── Resources ── */}
        {feedback.recommended_resources && feedback.recommended_resources.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Recommended Resources</h3>
            <div className={styles.resourceRow}>
              {feedback.recommended_resources.map((r, i) => (
                <div key={i} className={styles.resourceChip}>📚 {r}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── Interview Tips ── */}
        {feedback.interview_tips && feedback.interview_tips.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Interview Tips for Next Time</h3>
            <div className={styles.tipsGrid}>
              {feedback.interview_tips.map((t, i) => (
                <div key={i} className={styles.tipItem}>
                  <span className={styles.tipNum}>{i + 1}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className={styles.actionRow}>
          <button className="btn-primary" onClick={onRetry}>Practice Again →</button>
          <button className="btn-secondary" onClick={handlePrint}>🖨️ Save / Print Report</button>
        </div>

      </div>
    </div>
  )
}
