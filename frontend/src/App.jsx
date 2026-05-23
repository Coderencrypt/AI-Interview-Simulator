import React, { useState, useRef, useCallback } from 'react'
import LandingScreen   from './components/LandingScreen'
import SetupScreen     from './components/SetupScreen'
import InterviewScreen from './components/InterviewScreen'
import FeedbackScreen  from './components/FeedbackScreen'
import LoadingScreen   from './components/LoadingScreen'
import { api }         from './api'
import { useSpeechRecognition } from './hooks/useInterviewHooks'

const FALLBACK_QUESTIONS = (role) => [
  { id: 1, question: `Tell me about yourself and what drew you to the ${role} role.`,         type: 'behavioral',  hint: 'Keep it to 2 minutes — professional, relevant, enthusiastic.' },
  { id: 2, question: `What is your greatest technical strength as a ${role}?`,                 type: 'technical',   hint: 'Give a concrete example with measurable impact.' },
  { id: 3, question: 'Describe a time you overcame a significant challenge at work.',          type: 'behavioral',  hint: 'Use STAR: Situation, Task, Action, Result.' },
  { id: 4, question: 'How do you prioritize when you have multiple deadlines competing?',      type: 'situational', hint: 'Show your system — tools, communication, trade-offs.' },
  { id: 5, question: 'Where do you see yourself in three years, and how does this role fit?',  type: 'personality', hint: 'Align your ambition with realistic growth inside the company.' },
]

const FALLBACK_ANALYSIS = {
  score: 7, clarity: 7, relevance: 7, confidence_indicator: 7, communication: 7,
  strengths:    ['Answered the question', 'Showed relevant knowledge'],
  improvements: ['Use more specific examples', 'Quantify your impact'],
  ideal_answer_hint: 'Structure your answer using the STAR method with real numbers.',
  overall_comment:   'Good effort! More concrete examples will make your answers stand out.',
}

const FALLBACK_FEEDBACK = (answers) => ({
  overall_score:         72,
  hire_likelihood:       'Maybe',
  key_strengths:         ['Demonstrated relevant experience', 'Clear communication', 'Enthusiasm for the role'],
  key_improvements:      ['Use more specific examples', 'Structure answers with STAR method', 'Research the company more deeply'],
  communication_score:   7,
  technical_score:       6,
  confidence_score:      7,
  preparation_score:     6,
  executive_summary:     'You showed solid potential. With more structured, example-driven answers you can easily move to a "Yes" or "Strong Yes" rating.',
  next_steps:            ['Practice the STAR method daily', 'Record yourself answering questions', 'Research common role-specific questions', 'Prepare 3–5 STAR stories in advance'],
  recommended_resources: ['Cracking the Coding Interview', 'STAR Method Guide (Indeed)', 'Glassdoor Interview Questions'],
  interview_tips:        ['Always quantify your achievements', 'Pause briefly before answering — it shows confidence', 'Ask clarifying questions if needed'],
  answers,
})

export default function App() {
  const [screen,          setScreen]         = useState('landing')   // landing | setup | interview | feedback | loading
  const [loadingMsg,      setLoadingMsg]      = useState('')
  const [selectedRole,    setSelectedRole]    = useState(null)
  const [questions,       setQuestions]       = useState([])
  const [currentQIdx,     setCurrentQIdx]     = useState(0)
  const [answers,         setAnswers]         = useState([])
  const [currentAnswer,   setCurrentAnswer]   = useState('')
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [feedback,        setFeedback]        = useState(null)

  const { 
    transcript, 
    setTranscript, 
    isListening, 
    startListening, 
    stopListening,
    resetTranscript
  } = useSpeechRecognition()

  // Sync transcript to currentAnswer
  React.useEffect(() => {
    if (isListening) setCurrentAnswer(transcript)
  }, [transcript, isListening])

  // ── Generate questions ────────────────────────────────────────────────────
  const handleRoleSelect = async (role) => {
    setSelectedRole(role)
    setLoadingMsg('Generating your interview questions…')
    setScreen('loading')

    try {
      const data = await api.generateQuestions(role.title, role.difficulty, role.numQ)
      setQuestions(data.questions)
    } catch (err) {
      console.warn('Question generation failed, using fallback:', err)
      setQuestions(FALLBACK_QUESTIONS(role.title))
    }

    setCurrentQIdx(0)
    setAnswers([])
    setCurrentAnswer('')
    setScreen('interview')
  }

  // ── Submit one answer ─────────────────────────────────────────────────────
  const handleNext = async (ans) => {
    stopListening()
    const finalAns = (ans || currentAnswer || '').trim() || '(Skipped)'
    setAnalysisLoading(true)

    let analysis = FALLBACK_ANALYSIS
    try {
      const data = await api.analyzeAnswer(
        questions[currentQIdx].question,
        finalAns,
        selectedRole.title,
        questions[currentQIdx].type,
      )
      analysis = data.analysis
    } catch (err) {
      console.warn('Analysis failed, using fallback:', err)
    }

    const record = {
      questionId: questions[currentQIdx].id,
      question:   questions[currentQIdx].question,
      type:       questions[currentQIdx].type,
      answer:     finalAns,
      analysis,
      emotion:    'Calm',   // InterviewScreen manages real-time emotion internally
    }

    const updatedAnswers = [...answers, record]
    setAnswers(updatedAnswers)
    setAnalysisLoading(false)

    if (currentQIdx + 1 < questions.length) {
      setCurrentQIdx(i => i + 1)
      setCurrentAnswer('')
      resetTranscript()
    } else {
      // Last question — generate final feedback
      await buildFinalFeedback(updatedAnswers)
    }
  }

  // ── Final feedback ────────────────────────────────────────────────────────
  const buildFinalFeedback = async (allAnswers) => {
    setLoadingMsg('Building your performance report…')
    setScreen('loading')

    try {
      const data = await api.generateFeedback(selectedRole.title, allAnswers)
      setFeedback({ ...data.feedback, answers: allAnswers })
    } catch (err) {
      console.warn('Feedback generation failed, using fallback:', err)
      setFeedback(FALLBACK_FEEDBACK(allAnswers))
    }

    setScreen('feedback')
  }

  // ── Reset / retry ─────────────────────────────────────────────────────────
  const handleRetry = () => {
    setScreen('setup')
    setFeedback(null)
    setAnswers([])
    setCurrentQIdx(0)
    setCurrentAnswer('')
    stopListening()
    resetTranscript()
    setQuestions([])
    setSelectedRole(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (screen === 'loading')   return <LoadingScreen message={loadingMsg} />
  if (screen === 'landing')   return <LandingScreen onStart={() => setScreen('setup')} />
  if (screen === 'setup')     return <SetupScreen   onSelect={handleRoleSelect} isLoading={false} />
  if (screen === 'feedback')  return (
    <FeedbackScreen
      feedback={feedback}
      selectedRole={selectedRole}
      onRetry={handleRetry}
    />
  )
  if (screen === 'interview') return (
    <InterviewScreen
      question={questions[currentQIdx]}
      questionNumber={currentQIdx + 1}
      totalQuestions={questions.length}
      currentAnswer={currentAnswer}
      setCurrentAnswer={setCurrentAnswer}
      isListening={isListening}
      onStartListening={startListening}
      onStopListening={stopListening}
      onNext={handleNext}
      analysisLoading={analysisLoading}
      selectedRole={selectedRole}
    />
  )

  return null
}
