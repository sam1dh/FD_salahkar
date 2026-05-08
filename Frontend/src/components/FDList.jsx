import { useState } from 'react'
import FDCard from './FDCard'
import { sortFDs, filterFDs } from '../utils/fd'

const FILTERS = [
  { key: 'all',          hi: 'सभी', ta: 'அனைத்தும்', te: 'అన్నీ' },
  { key: 'government',   hi: 'सरकारी', ta: 'அரசு', te: 'ప్రభుత్వ' },
  { key: 'private',      hi: 'निजी', ta: 'தனியார்', te: 'ప్రైవేట్' },
  { key: 'smallFinance', hi: 'लघु वित्त', ta: 'சிறு நிதி', te: 'చిన్న ఫైనాన్స్' },
  { key: 'highRate',     hi: 'ज़्यादा ब्याज', ta: 'அதிக வட்டி', te: 'ఎక్కువ వడ్డీ' },
  { key: 'safest',       hi: 'सबसे सुरक्षित', ta: 'மிகவும் பாதுகாப்பான', te: 'అత్యంత సురక్షిత' },
]

const SORTS = [
  { key: 'rate', hi: 'ब्याज दर', ta: 'வட்டி விகிதம்', te: 'వడ్డీ రేటు' },
  { key: 'safe', hi: 'सुरक्षा', ta: 'பாதுகாப்பு', te: 'భద్రత' },
  { key: 'min',  hi: 'न्यूनतम राशि', ta: 'குறைந்தபட்ச தொகை', te: 'కనిష్ట మొత్తం' },
]

export default function FDList({ fds, language = 'hi', onAskAboutFD, onBookFD, onSelectFD, selectedFD }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeSort, setActiveSort] = useState('rate')

  const sortLabel = { hi: 'क्रम', ta: 'வரிசை', te: 'క్రమం' }

  const displayed = sortFDs(filterFDs(fds, activeFilter), activeSort)

  return (
    <div className="fd-list">
      <div className="fd-list__filters">
        <div className="filter-chips">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-chip ${activeFilter === f.key ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f[language] || f.hi}
            </button>
          ))}
        </div>
        <div className="sort-group">
          <span className="sort-label">{sortLabel[language]}:</span>
          {SORTS.map((s) => (
            <button
              key={s.key}
              className={`sort-btn ${activeSort === s.key ? 'sort-btn--active' : ''}`}
              onClick={() => setActiveSort(s.key)}
            >
              {s[language] || s.hi}
            </button>
          ))}
        </div>
      </div>

      <div className="fd-list__count">
        {language === 'hi' && `${displayed.length} बैंक मिले`}
        {language === 'ta' && `${displayed.length} வங்கிகள் கிடைத்தன`}
        {language === 'te' && `${displayed.length} బ్యాంకులు దొరికాయి`}
      </div>

      <div className="fd-cards-grid">
        {displayed.map((fd) => (
          <FDCard
            key={fd.id}
            fd={fd}
            language={language}
            onAsk={onAskAboutFD}
            onBook={onBookFD}
            onSelect={onSelectFD}
            selected={selectedFD?.id === fd.id}
          />
        ))}
      </div>
    </div>
  )
}