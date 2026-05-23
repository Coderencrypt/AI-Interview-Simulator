import React, { useEffect, useRef, useState } from 'react'
import styles from './InterviewScreen.module.css'
import { useWebcam } from '../hooks/useInterviewHooks'

const EMOTIONS = ['Confident', 'Focused', 'Calm', 'Nervous', 'Engaged', 'Thoughtful']
const EMOTION_STYLE = {
  Confident:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
  Focused:    { bg: 'rgba(0,212,255,0.12)',   color: '#00d4ff' },
  Calm:       { bg: 'rgba(124,58,237,0.12)',  color: '#a78bfa' },
  Nervous:    { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  Engaged:    { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa' },
  Thoughtful: { bg: 'rgba(236,72,153,0.12)',  color: '#f472b6' },
}

const TIPS = [
  'Maintain natural eye contact with the camera while speaking',
  'Use the STAR method: Situation, Task, Action, Result',
  'Speak clearly at a moderate pace — avoid rushing',
  "It's okay to pause briefly before answering",
  'Quantify achievements when possible (e.g., "increased sales by 20%")',
  'Mirror the language in the job description',
  "Don't just say what you did — explain the impact",
  'Keep answers 1–2 minutes long for behavioral questions',
]

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function InterviewScreen({
  question,
  questionNumber,
  totalQuestions,
  currentAnswer,
  setCurrentAnswer,
  isListening,
  onStartListening,
  onStopListening,
  onNext,
  analysisLoading,
  selectedRole,
}) {
  const videoRef = useRef(null)
  const timerRef = useRef(null)
  const emotionRef = useRef(null)

  const [emotion, setEmotion] = useState('Calm')
  const [confidence, setConfidence] = useState(65)
  const [timer, setTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  
  const { active: webcamActive, start: startWebcam } = useWebcam(videoRef)

  const pct = Math.round((questionNumber / totalQuestions) * 100)
  const tipIdx = (questionNumber - 1) % TIPS.length
  const eStyle = EMOTION_STYLE[emotion] || EMOTION_STYLE.Calm
  const confColor =
    confidence > 70 ? 'var(--green)' : confidence > 45 ? 'var(--cyan)' : 'var(--amber)'

  useEffect(() => { startWebcam() }, [startWebcam])

  // Emotion simulation
  useEffect(() => {
    emotionRef.current = setInterval(() => {
      setEmotion(EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)])
      setConfidence(p => Math.min(95, Math.max(28, p + (Math.random() - 0.42) * 7)))
    }, 2500)
    return () => clearInterval(emotionRef.current)
  }, [])

  // Timer control linked to isListening
  useEffect(() => {
    if (isListening && !timerRunning) {
      setTimerRunning(true)
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    } else if (!isListening && timerRunning) {
      clearInterval(timerRef.current)
      setTimerRunning(false)
    }
  }, [isListening, timerRunning])

  // Reset timer on new question
  useEffect(() => {
    setTimer(0)
    setTimerRunning(false)
    clearInterval(timerRef.current)
  }, [questionNumber])

  useEffect(() => () => clearInterval(timerRef.current), [])

  const qTypeColor = {
    behavioral:  '#00d4ff',
    technical:   '#7c3aed',
    situational: '#10b981',
    personality: '#f59e0b',
  }[question?.type] || '#94a3b8'

  return (
    <div className={styles.layout}>
      {/* ── Main panel ── */}
      <div className={styles.main}>

        {/* Top bar */}
        <div className={styles.topbar}>
          <div className={styles.roleLabel}>
            <span className={styles.liveDot} />
            {selectedRole?.icon} {selectedRole?.title} Interview
          </div>
          <div className="progress-track" style={{ flex: 1, margin: '0 1rem' }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>
            {questionNumber} / {totalQuestions}
          </span>
        </div>

        {/* Question card */}
        <div className={`${styles.questionCard} fade-in-up`}>
          <span
            className={styles.qTypeBadge}
            style={{ background: `${qTypeColor}18`, color: qTypeColor, borderColor: `${qTypeColor}30` }}
          >
            {question?.type || 'question'}
          </span>
          <h2 className={styles.questionText}>{question?.question || 'Loading question…'}</h2>
        </div>

        {/* Hint */}
        {question?.hint && (
          <div className={styles.hintBox}>
            <span>💡</span>
            <span>
              <strong>Coach tip:</strong> {question.hint}
            </span>
          </div>
        )}

        {/* Answer area */}
        <div className={styles.answerCard}>
          <label className={styles.answerLabel}>Your Answer — Type or Use Voice</label>
          <textarea
            className={styles.textarea}
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            placeholder={
              isListening
                ? '🎙️ Listening… speak now'
                : 'Click "Start Voice" to speak your answer, or type it here…'
            }
            rows={6}
            disabled={analysisLoading}
          />

          {/* Controls row */}
          <div className={styles.controls}>
            <button
              className={`${styles.micBtn} ${isListening ? styles.recording : ''}`}
              onClick={isListening ? onStopListening : onStartListening}
              disabled={analysisLoading}
            >
              {isListening ? '⏹ Stop Recording' : '🎙️ Start Voice'}
            </button>

            {(isListening || timer > 0) && (
              <div className={styles.timer}>{formatTime(timer)}</div>
            )}

            <div style={{ flex: 1 }} />

            {!currentAnswer && !isListening && !analysisLoading && (
              <button
                className="btn-ghost"
                onClick={() => { setCurrentAnswer('(Skipped)'); onNext('(Skipped)') }}
              >
                Skip →
              </button>
            )}

            <button
              className={styles.nextBtn}
              disabled={(!currentAnswer.trim() && !isListening) || analysisLoading}
              onClick={() => onNext(currentAnswer)}
            >
              {analysisLoading ? (
                <><span className={styles.spin} /> Analyzing…</>
              ) : questionNumber === totalQuestions ? (
                'Finish Interview ✓'
              ) : (
                'Next Question →'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>

        {/* Webcam */}
        <div>
          <p className={styles.sideLabel}>Live Camera</p>
          <div className={styles.camBox}>
            <video ref={videoRef} autoPlay muted playsInline className={styles.video} />
            {!webcamActive && <div className={styles.camPlaceholder}>📷<br /><small>Camera off</small></div>}
            <div className={styles.camBadges}>
              <span className={styles.camBadge}>
                <span
                  className={styles.camDot}
                  style={{ background: webcamActive ? 'var(--green)' : 'var(--red)' }}
                />
                {webcamActive ? 'Live' : 'Off'}
              </span>
              {isListening && (
                <span className={styles.camBadge} style={{ color: 'var(--red)' }}>
                  <span className={styles.camDot} style={{ background: 'var(--red)', animation: 'pulse 1s infinite' }} />
                  REC
                </span>
              )}
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Emotion */}
        <div>
          <p className={styles.sideLabel}>Detected Mood</p>
          <div
            className={styles.emotionPill}
            style={{ background: eStyle.bg, color: eStyle.color }}
          >
            <span
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: eStyle.color, display: 'inline-block',
              }}
            />
            {emotion}
          </div>
        </div>

        {/* Confidence */}
        <div>
          <p className={styles.sideLabel}>Confidence Level</p>
          <div className="progress-track" style={{ height: '8px', marginBottom: '6px' }}>
            <div
              className="progress-fill"
              style={{ width: `${confidence}%`, background: confColor }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text2)' }}>
            <span>{confidence < 40 ? 'Low' : confidence < 70 ? 'Medium' : 'High'}</span>
            <span>{Math.round(confidence)}%</span>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Tip */}
        <div className={styles.tipCard}>
          <div className={styles.tipLabel}>💡 Coach Tip</div>
          <p>{TIPS[tipIdx]}</p>
        </div>

        {/* Progress dots */}
        <div>
          <p className={styles.sideLabel}>Progress</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Array.from({ length: totalQuestions }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: i < questionNumber - 1
                    ? 'var(--green)' : i === questionNumber - 1
                    ? 'var(--cyan)' : 'var(--surface2)',
                  border: i === questionNumber - 1
                    ? '2px solid var(--cyan)' : '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  color: i < questionNumber - 1 ? '#000' : i === questionNumber - 1 ? '#000' : 'var(--text3)',
                  transition: 'all 0.3s',
                }}
              >
                {i < questionNumber - 1 ? '✓' : i + 1}
              </div>
            ))}
          </div>
        </div>

      </aside>
    </div>
  )
}
