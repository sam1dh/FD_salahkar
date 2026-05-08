import { useRef, useEffect, useState } from 'react'
import { useChat } from '../hooks/useChat'
import { QUICK_QUESTIONS, JARGON } from '../api/gemini'
import { FaMicrophone, FaStopCircle, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'

export default function ChatUI({ language, fdContext, pendingMsg, onPendingMsgConsumed }) {
  const { messages, input, setInput, loading, send } = useChat(language, fdContext)
  const bottomRef  = useRef(null)
  const consumedRef = useRef(false)
  const pendingMsgRef = useRef(null)

  // Voice Recording State and Refs
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  
  // Text-to-Speech State
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)
  const [playingMessageId, setPlayingMessageId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  /* Auto-scroll on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  /* Fire pendingMsg once when arriving from Calculator jargon pill */
  useEffect(() => {
    if (pendingMsg && pendingMsg !== pendingMsgRef.current) {
      pendingMsgRef.current = pendingMsg
      onPendingMsgConsumed?.()
      send(pendingMsg)
    }
  }, [pendingMsg, onPendingMsgConsumed])

  /* Reset consumed flag when language changes so pills still work */
  useEffect(() => { consumedRef.current = false }, [language])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', audioBlob)

        try {
          const res = await fetch('http://localhost:3001/api/transcribe', {
            method: 'POST',
            body: formData,
          })
          const data = await res.json()
          
          if (data.text) {
            setInput((prev) => prev + (prev ? ' ' : '') + data.text)
          } else if (data.error) {
            alert('Transcription failed: ' + data.error)
          }
        } catch (err) {
          console.error("Transcription error:", err)
          alert("Could not transcribe audio. Please check your microphone permissions.")
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      alert("Please allow microphone access to use voice typing.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Text-to-Speech Function
  const speakMessage = async (text, messageId = null) => {
    try {
      setIsPlaying(true)
      if (messageId) setPlayingMessageId(messageId)
      
      const res = await fetch('http://localhost:3001/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      })

      if (!res.ok) {
        throw new Error('TTS failed')
      }

      const audioBlob = await res.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play().catch((err) => {
          console.error('Audio playback error:', err)
          setIsPlaying(false)
        })
      }
    } catch (err) {
      console.error('Text-to-speech error:', err)
      setIsPlaying(false)
    }
  }

  const quickQs = QUICK_QUESTIONS[language] || QUICK_QUESTIONS.hi

  const placeholder = {
    hi: 'अपना सवाल यहाँ लिखें...',
    ta: 'உங்கள் கேள்வியை இங்கே எழுதுங்கள்...',
    te: 'మీ ప్రశ్న ఇక్కడ రాయండి...',
  }[language] || 'Ask your question...'

  return (
    <div className="chat-container">
      {/* Hidden audio element for TTS playback */}
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false)
          setPlayingMessageId(null)
        }}
        style={{ display: 'none' }}
      />

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.role}`}>
            <div className="bubble-content">{msg.text}</div>
            <div className="bubble-time">{msg.time}</div>
            
            {/* Speaker icon for assistant messages */}
            {msg.role === 'assistant' && (
              <button
                className="speaker-btn"
                onClick={() => speakMessage(msg.text, msg.id)}
                disabled={isPlaying && playingMessageId !== msg.id}
                title={playingMessageId === msg.id && isPlaying ? "Playing..." : "Replay audio"}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  marginTop: '8px',
                  fontSize: '16px',
                  color: playingMessageId === msg.id && isPlaying ? '#FF6B35' : '#999'
                }}
              >
                {playingMessageId === msg.id && isPlaying ? (
                  <FaVolumeMute size={16} />
                ) : (
                  <FaVolumeUp size={16} />
                )}
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant loading">
            <div className="typing-dots"><span /><span /><span /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick question chips */}
      <div className="quick-questions">
        {quickQs.map((q, i) => (
          <button
            key={i}
            className="quick-btn"
            onClick={() => send(q)}
            disabled={loading}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Jargon pills */}
      <div className="jargon-pills-row">
        {(JARGON[language] || JARGON.hi).map(({ term, q }) => (
          <button
            key={term}
            className="jargon-pill"
            onClick={() => send(q)}
            disabled={loading}
            title={q}
          >
            {term}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="chat-input-row">
        {/* Microphone Button */}
        <button 
          className="mic-btn"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
          title={isRecording ? "Stop Recording" : "Start Voice Typing"}
          style={{ 
            color: isRecording ? 'red' : 'inherit', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '10px'
          }}
        >
          {isRecording ? <FaStopCircle size={24} /> : <FaMicrophone size={24} />}
        </button>

        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={isRecording ? "Listening..." : placeholder}
          rows={2}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13"       stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

    </div>
  )
}