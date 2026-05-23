// ── useSpeechRecognition ──────────────────────────────────────────────────
import { useState, useRef, useCallback } from 'react'

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  )
  const recognitionRef = useRef(null)

  const startListening = useCallback(() => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser.\nPlease use Google Chrome or Microsoft Edge.')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-US'

    r.onresult = (event) => {
      let t = ''
      for (let i = 0; i < event.results.length; i++) {
        t += event.results[i][0].transcript
      }
      setTranscript(t)
    }
    r.onerror = (e) => {
      console.warn('Speech recognition error:', e.error)
      setIsListening(false)
    }
    r.onend = () => setIsListening(false)

    recognitionRef.current = r
    r.start()
    setIsListening(true)
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop()
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => setTranscript(''), [])

  return { transcript, setTranscript, isListening, isSupported, startListening, stopListening, resetTranscript }
}


// ── useWebcam ─────────────────────────────────────────────────────────────
import { useEffect, useRef as useRef2, useState as useState2 } from 'react'

export function useWebcam(videoRef) {
  const [active, setActive] = useState2(false)
  const [error, setError] = useState2(null)
  const streamRef = useRef2(null)

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setActive(true)
        setError(null)
      }
    } catch (err) {
      setError('Camera access denied or unavailable.')
      console.warn('Webcam error:', err)
    }
  }, [videoRef])

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
      setActive(false)
    }
  }, [])

  // cleanup on unmount
  useEffect(() => () => stop(), [stop])

  return { active, error, start, stop }
}
