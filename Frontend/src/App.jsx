import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ChatUI from './components/ChatUI'
import FDList from './components/FDList'
import Calculator from './components/Calculator'
import BookingFlow from './components/BookingFlow'
import GoalTracker from './components/GoalTracker'
import fds from './data/fds.json'
import { LANGUAGES } from './i18n/index.js'
export default function App() {
  const { i18n } = useTranslation()
  const [language, setLanguage]     = useState('hi')
  const [activeTab, setActiveTab]   = useState('compare')
  const [selectedFD, setSelectedFD] = useState(null)
  const [fdContext, setFdContext]    = useState(null)
  const [pendingMsg, setPendingMsg] = useState(null)
  const [bookingFD, setBookingFD]   = useState(null)   // FD preselected from card

  const changeLanguage = (code) => {
    setLanguage(code)
    i18n.changeLanguage(code)
  }

  /* FD card "Ask AI" button → open chat with this FD as context */
  const handleAskAboutFD = (fd) => {
    setFdContext(fd)
    setActiveTab('advisor')
  }

  /* FD card "Book Now" → open booking tab with FD preselected */
  const handleBookFD = (fd) => {
    setBookingFD(fd)
    setActiveTab('book')
  }

  /* Calculator jargon pill → open chat with that question pre-sent */
  const handleJargonAsk = (question) => {
    setPendingMsg(question)
    setFdContext(null)
    setActiveTab('advisor')
  }

  /* Booking flow complete */
  const handleBookingComplete = (result) => {
    if (result === 'home') {
      setActiveTab('compare')
      setBookingFD(null)
    }
  }

  const appTitle = { hi: 'FD सलाहकार', ta: 'FD ஆலோசகர்', te: 'FD సలహాదారు' }
  const appSub   = {
    hi: 'अपनी भाषा में समझें',
    ta: 'உங்கள் மொழியில் புரிந்துகொள்ளுங்கள்',
    te: 'మీ భాషలో అర్థం చేసుకోండి',
  }

  const navLabels = {
    advisor:    { hi: '💬 सलाहकार',    ta: '💬 ஆலோசகர்',    te: '💬 సలహాదారు' },
    compare:    { hi: '🏦 बैंक तुलना', ta: '🏦 வங்கி ஒப்பிடு', te: '🏦 బ్యాంక్ పోల్చు' },
    calculator: { hi: '🧮 कैलकुलेटर', ta: '🧮 கணக்கிடு',    te: '🧮 కాల్కులేటర్' },
    book:       { hi: '✅ FD खोलें',    ta: '✅ FD திறக்க',   te: '✅ FD తెరవండి' },
    goals:      { hi: '🎯 लक्ष्य ट्रैक', ta: '🎯 இலக்கு',     te: '🎯 లక్ష్యం' },
  }

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">₹</div>
          <div>
            <h1 className="app-title">{appTitle[language]}</h1>
            <p className="app-subtitle">{appSub[language]}</p>
          </div>
        </div>
        <div className="lang-switcher">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              className={`lang-btn ${language === l.code ? 'lang-btn--active' : ''}`}
              onClick={() => changeLanguage(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Nav ── */}
      <nav className="app-nav">
        {Object.entries(navLabels).map(([key, labels]) => (
          <button
            key={key}
            className={`nav-btn ${activeTab === key ? 'nav-btn--active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {labels[language]}
          </button>
          
        ))}
      </nav>

      {/* ── FD context banner (shown in advisor tab) ── */}
      {fdContext && activeTab === 'advisor' && (
        <div className="fd-context-banner">
          <span className="context-bank">{fdContext.bank}</span>
          <span className="context-rate">{fdContext.rate}% p.a.</span>
          <button className="context-clear" onClick={() => setFdContext(null)}>✕</button>
        </div>
      )}
      

      {/* ── Main ── */}
      <main className="app-main">
        {activeTab === 'advisor' && (
          <ChatUI
            language={language}
            fdContext={fdContext}
            pendingMsg={pendingMsg}
            onPendingMsgConsumed={() => setPendingMsg(null)}
          />
        )}
        {activeTab === 'compare' && (
          <FDList
            fds={fds}
            language={language}
            onAskAboutFD={handleAskAboutFD}
            onBookFD={handleBookFD}
            onSelectFD={(fd) => setSelectedFD(fd === selectedFD ? null : fd)}
            selectedFD={selectedFD}
          />
        )}
        {activeTab === 'calculator' && (
          <Calculator
            language={language}
            onAskAdvisor={handleJargonAsk}
          />
        )}
        {activeTab === 'book' && (
          <BookingFlow
            language={language}
            preselectedFD={bookingFD}
            onComplete={handleBookingComplete}
          />
        )}
          {activeTab === 'goals' && (
          <GoalTracker language={language} />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <p>
          {language === 'hi' && 'ब्याज दरें अप्रैल 2025 के अनुसार। निवेश से पहले बैंक से पुष्टि करें।'}
          {language === 'ta' && 'வட்டி விகிதங்கள் ஏப்ரல் 2025 நிலவரப்படி. முதலீட்டிற்கு முன் வங்கியில் உறுதிப்படுத்தவும்.'}
          {language === 'te' && 'వడ్డీ రేట్లు ఏప్రిల్ 2025 నాటివి. పెట్టుబడికి ముందు బ్యాంకులో నిర్ధారించండి.'}
        </p>
      </footer>

    </div>
  )
}