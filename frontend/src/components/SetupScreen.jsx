import React, { useState } from 'react'
import styles from './SetupScreen.module.css'

const JOB_ROLES = [
  { id: 'swe',  title: 'Software Engineer',  icon: '⚙️',  level: 'Technical',  color: '#00d4ff' },
  { id: 'ds',   title: 'Data Scientist',      icon: '📊',  level: 'Analytics',  color: '#7c3aed' },
  { id: 'pm',   title: 'Product Manager',     icon: '🎯',  level: 'Management', color: '#10b981' },
  { id: 'ux',   title: 'UI/UX Designer',      icon: '🎨',  level: 'Creative',   color: '#f59e0b' },
  { id: 'ml',   title: 'ML Engineer',         icon: '🤖',  level: 'Technical',  color: '#00d4ff' },
  { id: 'ba',   title: 'Business Analyst',    icon: '📈',  level: 'Business',   color: '#3b82f6' },
  { id: 'hr',   title: 'HR Manager',          icon: '👥',  level: 'Management', color: '#ec4899' },
  { id: 'mkt',  title: 'Marketing Manager',   icon: '📣',  level: 'Marketing',  color: '#f59e0b' },
  { id: 'dev',  title: 'Full Stack Developer',icon: '💻',  level: 'Technical',  color: '#00d4ff' },
  { id: 'qa',   title: 'QA Engineer',         icon: '🔍',  level: 'Technical',  color: '#10b981' },
  { id: 'devops',title: 'DevOps Engineer',    icon: '🚀',  level: 'Technical',  color: '#7c3aed' },
  { id: 'fin',  title: 'Finance Analyst',     icon: '💰',  level: 'Finance',    color: '#f59e0b' },
]

const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',   desc: 'Freshers / Interns' },
  { id: 'medium', label: 'Medium', desc: '1–3 years experience' },
  { id: 'hard',   label: 'Hard',   desc: 'Senior / Expert level' },
]

export default function SetupScreen({ onSelect, isLoading }) {
  const [selected, setSelected] = useState(null)
  const [difficulty, setDifficulty] = useState('medium')
  const [numQ, setNumQ] = useState(5)

  const handleStart = () => {
    if (!selected || isLoading) return
    onSelect({ ...selected, difficulty, numQ })
  }

  return (
    <div className={styles.setup}>
      <div className="grid-bg" />
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className="badge badge-cyan" style={{ marginBottom: '1rem' }}>Step 1 of 1</div>
          <h2>Configure Your Interview</h2>
          <p>Choose your target role, difficulty, and number of questions</p>
        </div>

        {/* Role grid */}
        <div className={styles.sectionLabel}>Select Job Role</div>
        <div className={styles.rolesGrid}>
          {JOB_ROLES.map(role => (
            <div
              key={role.id}
              className={`${styles.roleCard} ${selected?.id === role.id ? styles.selected : ''}`}
              onClick={() => setSelected(role)}
              style={selected?.id === role.id ? { borderColor: role.color, boxShadow: `0 0 20px ${role.color}18` } : {}}
            >
              {selected?.id === role.id && (
                <div className={styles.checkMark} style={{ background: role.color, color: '#000' }}>✓</div>
              )}
              <span className={styles.roleIcon}>{role.icon}</span>
              <div className={styles.roleTitle}>{role.title}</div>
              <span className={styles.roleLevel}>{role.level}</span>
            </div>
          ))}
        </div>

        {/* Difficulty */}
        <div className={styles.sectionLabel} style={{ marginTop: '2rem' }}>Difficulty Level</div>
        <div className={styles.diffRow}>
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              className={`${styles.diffBtn} ${difficulty === d.id ? styles.diffActive : ''}`}
              onClick={() => setDifficulty(d.id)}
            >
              <span className={styles.diffLabel}>{d.label}</span>
              <span className={styles.diffDesc}>{d.desc}</span>
            </button>
          ))}
        </div>

        {/* Number of questions */}
        <div className={styles.sectionLabel} style={{ marginTop: '2rem' }}>Number of Questions</div>
        <div className={styles.numRow}>
          {[3, 5, 7, 10].map(n => (
            <button
              key={n}
              className={`${styles.numBtn} ${numQ === n ? styles.numActive : ''}`}
              onClick={() => setNumQ(n)}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {selected && (
            <div className={styles.selectedInfo}>
              <span>Ready: </span>
              <strong>{selected.icon} {selected.title}</strong>
              <span> · {difficulty} · {numQ} questions</span>
            </div>
          )}
          <button className="btn-primary" onClick={handleStart} disabled={!selected || isLoading}>
            {isLoading ? (
              <><span className={styles.spin} />Generating Questions...</>
            ) : (
              'Begin Interview →'
            )}
          </button>
          {!selected && (
            <p className={styles.hint}>Please select a job role to continue</p>
          )}
        </div>

      </div>
    </div>
  )
}
