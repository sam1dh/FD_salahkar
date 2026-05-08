import { calcMaturity, formatINR, getBankTypeColor, getSafetyNote } from '../utils/fd'

export default function FDCard({ fd, language = 'hi', onAsk, onBook, onSelect, selected }) {
  const { maturity, interest, effectiveRate } = calcMaturity({
    principal: 10000,
    rate: fd.rate,
    tenorMonths: fd.tenor,
    compounding: fd.compounding,
  })

  const typeColor = getBankTypeColor(fd.type)
  const safetyNote = getSafetyNote(fd, language)

  const typeLabel = {
    small_finance: language === 'hi' ? 'लघु वित्त बैंक' : language === 'ta' ? 'சிறு நிதி வங்கி' : 'చిన్న ఫైనాన్స్ బ్యాంక్',
    private:       language === 'hi' ? 'निजी बैंक'       : language === 'ta' ? 'தனியார் வங்கி'     : 'ప్రైవేట్ బ్యాంక్',
    public:        language === 'hi' ? 'सरकारी बैंक'     : language === 'ta' ? 'அரசு வங்கி'        : 'ప్రభుత్వ బ్యాంక్',
  }

  const askLabel = {
    hi: 'इस FD के बारे में पूछें',
    ta: 'இந்த FD பற்றி கேளுங்கள்',
    te: 'ఈ FD గురించి అడగండి',
  }

  const bookLabel = {
    hi: 'अभी खोलें',
    ta: 'இப்போது திற',
    te: 'ఇప్పుడు తెరవండి',
  }

  const estimateLabel = {
    hi: '₹10,000 जमा पर अनुमान',
    ta: '₹10,000 வைப்பில் மதிப்பீடு',
    te: '₹10,000 డిపాజిట్‌పై అంచనా',
  }

  return (
    <div className={`fd-card ${selected ? 'fd-card--selected' : ''}`} onClick={() => onSelect?.(fd)}>
      <div className="fd-card__header">
        <div className="fd-card__bank-info">
          <h3 className="fd-card__bank-name">{fd.bank}</h3>
          <span
            className="fd-card__type-badge"
            style={{ background: typeColor.bg, color: typeColor.text, borderColor: typeColor.border }}
          >
            {typeLabel[fd.type]}
          </span>
        </div>
        <div className="fd-card__rate">
          <span className="fd-card__rate-num">{fd.rate.toFixed(2)}%</span>
          <span className="fd-card__rate-label">p.a.</span>
        </div>
      </div>

      <div className="fd-card__meta">
        <div className="fd-card__meta-item">
          <span className="meta-label">{language === 'hi' ? 'अवधि' : language === 'ta' ? 'காலம்' : 'అవధి'}</span>
          <span className="meta-value">{fd.tenor} {language === 'hi' ? 'महीने' : language === 'ta' ? 'மாதங்கள்' : 'నెలలు'}</span>
        </div>
        <div className="fd-card__meta-item">
          <span className="meta-label">{language === 'hi' ? 'न्यूनतम' : language === 'ta' ? 'குறைந்தபட்சம்' : 'కనిష్టం'}</span>
          <span className="meta-value">{formatINR(fd.minAmount)}</span>
        </div>
        <div className="fd-card__meta-item">
          <span className="meta-label">{language === 'hi' ? 'वरिष्ठ बोनस' : language === 'ta' ? 'மூத்தோர் போனஸ்' : 'సీనియర్ బోనస్'}</span>
          <span className="meta-value meta-value--highlight">+{fd.seniorCitizenBonus}%</span>
        </div>
      </div>

      <div className="fd-card__estimate">
        <div className="estimate-label">{estimateLabel[language]}</div>
        <div className="estimate-row">
          <span className="estimate-maturity">{formatINR(maturity)}</span>
          <span className="estimate-interest">+{formatINR(interest)} {language === 'hi' ? 'ब्याज' : language === 'ta' ? 'வட்டி' : 'వడ్డీ'}</span>
        </div>
      </div>

      <div className="fd-card__tags">
        {fd.fdacInsured && (
          <span className="fd-tag fd-tag--insured">
            🛡 {language === 'hi' ? '₹5L बीमित' : language === 'ta' ? '₹5L காப்பீடு' : '₹5L బీమా'}
          </span>
        )}
        {fd.prematureWithdrawal && (
          <span className="fd-tag fd-tag--premature">
            ✓ {language === 'hi' ? 'समय से पहले निकासी' : language === 'ta' ? 'முன்கூட்டிய திரும்பப் பெறுதல்' : 'ముందస్తు ఉపసంహరణ'}
          </span>
        )}
      </div>

      <div className="fd-card__safety-note">{safetyNote}</div>

      <div className="fd-card__actions">
        <button
          className="fd-btn fd-btn--ask"
          onClick={(e) => { e.stopPropagation(); onAsk?.(fd) }}
        >
          💬 {askLabel[language]}
        </button>
        <button
          className="fd-btn fd-btn--book"
          onClick={(e) => { e.stopPropagation(); onBook?.(fd) }}
        >
          {bookLabel[language]}
        </button>
      </div>
    </div>
  )
}