const BASE = '/api'

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  generateQuestions: (jobRole, difficulty = 'medium', numQuestions = 5) =>
    post('/generate-questions', { job_role: jobRole, difficulty, num_questions: numQuestions }),

  analyzeAnswer: (question, answer, jobRole, questionType = 'behavioral') =>
    post('/analyze-answer', { question, answer, job_role: jobRole, question_type: questionType }),

  generateFeedback: (jobRole, answers) =>
    post('/generate-feedback', { job_role: jobRole, answers }),
}
