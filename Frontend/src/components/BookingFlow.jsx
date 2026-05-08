import { useState } from 'react'
import { calcMaturity, formatINR } from '../utils/fd'
import fdsData from '../data/fds.json'

/* ─── All UI strings per language ─── */
const L = {
  /* Step labels */
  s1: { hi: 'बैंक चुनें',       ta: 'வங்கி தேர்வு',         te: 'బ్యాంక్ ఎంచుకోండి' },
  s2: { hi: 'राशि & अवधि',     ta: 'தொகை & காலம்',         te: 'మొత్తం & అవధి' },
  s3: { hi: 'जानकारी',          ta: 'விவரங்கள்',             te: 'వివరాలు' },
  s4: { hi: 'पुष्टि करें',      ta: 'உறுதிப்படுத்தவும்',    te: 'నిర్ధారించండి' },
  s5: { hi: 'हो गया! 🎉',       ta: 'முடிந்தது! 🎉',          te: 'పూర్తయింది! 🎉' },

  /* Step 1 */
  pickBank:   { hi: 'अपना बैंक चुनें',           ta: 'உங்கள் வங்கியைத் தேர்ந்தெடுங்கள்', te: 'మీ బ్యాంక్ ఎంచుకోండి' },
  ratePA:     { hi: 'ब्याज प्रति वर्ष',          ta: 'வட்டி (ஆண்டுக்கு)',                te: 'వడ్డీ (సంవత్సరానికి)' },
  minDep:     { hi: 'न्यूनतम जमा',               ta: 'குறைந்தபட்ச வைப்பு',              te: 'కనిష్ట డిపాజిట్' },
  tenor:      { hi: 'अवधि',                       ta: 'காலம்',                            te: 'అవధి' },
  months:     { hi: 'महीने',                      ta: 'மாதங்கள்',                         te: 'నెలలు' },
  selectThis: { hi: 'यह बैंक चुनें',              ta: 'இந்த வங்கியை தேர்ந்தெடு',          te: 'ఈ బ్యాంక్ ఎంచుకో' },
  selected:   { hi: '✓ चुना गया',                ta: '✓ தேர்ந்தெடுக்கப்பட்டது',         te: '✓ ఎంచుకున్నారు' },

  /* Step 2 */
  amountLabel:    { hi: 'कितना जमा करना है? (₹)',        ta: 'எவ்வளவு வைப்பு செய்வீர்கள்? (₹)',  te: 'ఎంత డిపాజిట్ చేస్తారు? (₹)' },
  tenorLabel:     { hi: 'कितने महीनों के लिए?',         ta: 'எத்தனை மாதங்களுக்கு?',              te: 'ఎన్ని నెలలకు?' },
  projectedReturn:{ hi: 'अनुमानित रिटर्न',             ta: 'எதிர்பார்க்கப்படும் வருமானம்',     te: 'అంచనా రాబడి' },
  youInvest:      { hi: 'आप जमा करेंगे',               ta: 'நீங்கள் வைப்பு செய்வீர்கள்',        te: 'మీరు వేస్తారు' },
  youGet:         { hi: 'आपको मिलेगा',                 ta: 'நீங்கள் பெறுவீர்கள்',               te: 'మీకు వస్తుంది' },
  interest:       { hi: 'ब्याज कमाई',                  ta: 'வட்டி ஆதாயம்',                     te: 'వడ్డీ లాభం' },
  amountTooLow:   { hi: 'न्यूनतम राशि',                ta: 'குறைந்தபட்ச தொகை',                  te: 'కనిష్ట మొత్తం' },

  /* Step 3 */
  nameLabel:    { hi: 'आपका पूरा नाम',          ta: 'உங்கள் முழு பெயர்',            te: 'మీ పూర్తి పేరు' },
  phoneLabel:   { hi: 'मोबाइल नंबर',             ta: 'மொபைல் எண்',                   te: 'మొబైల్ నంబర్' },
  emailLabel:   { hi: 'ईमेल (वैकल्पिक)',         ta: 'மின்னஞ்சல் (விரும்பினால்)',    te: 'ఇమెయిల్ (ఐచ్ఛికం)' },
  namePH:       { hi: 'जैसे: रमेश कुमार',       ta: 'எ.கா: ராமசாமி',               te: 'ఉదా: రామారావు' },
  phonePH:      { hi: '10 अंक का नंबर',          ta: '10 இலக்க எண்',                 te: '10 అంకెల నంబర్' },
  emailPH:      { hi: 'your@email.com',           ta: 'your@email.com',               te: 'your@email.com' },
  nameErr:      { hi: 'नाम ज़रूरी है',           ta: 'பெயர் அவசியம்',                te: 'పేరు అవసరం' },
  phoneErr:     { hi: '10 अंक का मोबाइल नंबर दर्ज करें', ta: '10 இலக்க மொபைல் எண் உள்ளிடவும்', te: '10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి' },

  /* Step 4 */
  reviewTitle:  { hi: 'आवेदन की समीक्षा करें',        ta: 'விண்ணப்பத்தை மதிப்பாய்வு செய்யுங்கள்', te: 'దరఖాస్తు సమీక్షించండి' },
  bankLabel:    { hi: 'बैंक',                          ta: 'வங்கி',                                te: 'బ్యాంక్' },
  amtLabel:     { hi: 'जमा राशि',                     ta: 'வைப்பு தொகை',                          te: 'డిపాజిట్ మొత్తం' },
  tenorLbl:     { hi: 'अवधि',                          ta: 'காலம்',                                te: 'అవధి' },
  maturityLbl:  { hi: 'परिपक्वता राशि',               ta: 'முதிர்வு தொகை',                         te: 'మెచ్యూరిటీ మొత్తం' },
  applicant:    { hi: 'आवेदक',                         ta: 'விண்ணப்பதாரர்',                        te: 'దరఖాస్తుదారు' },
  mobile:       { hi: 'मोबाइल',                        ta: 'மொபைல்',                               te: 'మొబైల్' },
  confirmBtn:   { hi: 'FD आवेदन जमा करें',            ta: 'FD விண்ணப்பத்தை சமர்ப்பிக்கவும்',     te: 'FD దరఖాస్తు సమర్పించండి' },
  disclaimer:   {
    hi: 'यह एक डेमो है। वास्तविक FD के लिए सीधे बैंक शाखा में जाएं या बैंक की आधिकारिक वेबसाइट पर जाएं।',
    ta: 'இது ஒரு டெமோ. உண்மையான FD-க்கு நேரடியாக வங்கி கிளையில் அல்லது அதிகாரப்பூர்வ இணையதளத்தில் செல்லவும்.',
    te: 'ఇది ఒక డెమో. నిజమైన FD కోసం నేరుగా బ్యాంక్ శాఖకు లేదా అధికారిక వెబ్‌సైట్‌కు వెళ్ళండి.',
  },

  /* Step 5 — Success */
  successTitle: { hi: 'आवेदन सफल!',            ta: 'விண்ணப்பம் வெற்றிகரமாக!',      te: 'దరఖాస్తు విజయవంతమైంది!' },
  successSub:   {
    hi: 'आपका FD आवेदन जमा कर दिया गया है। बैंक 24 घंटे के अंदर आपसे संपर्क करेगा।',
    ta: 'உங்கள் FD விண்ணப்பம் சமர்ப்பிக்கப்பட்டது. 24 மணி நேரத்தில் வங்கி தொடர்பு கொள்ளும்.',
    te: 'మీ FD దరఖాస్తు సమర్పించబడింది. 24 గంటల్లో బ్యాంక్ మిమ్మల్ని సంప్రదిస్తుంది.',
  },
  refLabel:     { hi: 'संदर्भ संख्या',          ta: 'குறிப்பு எண்',                  te: 'రిఫరెన్స్ నంబర్' },
  anotherFD:    { hi: 'एक और FD खोलें',         ta: 'மற்றொரு FD திறக்கவும்',         te: 'మరొక FD తెరవండి' },
  goHome:       { hi: 'बैंक सूची पर जाएं',      ta: 'வங்கி பட்டியலுக்கு செல்லவும்',  te: 'బ్యాంక్ జాబితాకు వెళ్ళండి' },

  /* Nav buttons */
  next:   { hi: 'आगे →',   ta: 'அடுத்து →',   te: 'తదుపరి →' },
  back:   { hi: '← वापस',  ta: '← திரும்பு',  te: '← వెనక్కి' },
  submit: { hi: 'जमा करें', ta: 'சமர்ப்பிக்க', te: 'సమర్పించు' },
}

const t = (key, lang) => L[key]?.[lang] || L[key]?.hi || key

/* ─── Tenor presets ─── */
const TENOR_OPTIONS = [3, 6, 12, 18, 24, 36, 48, 60]

/* ─── Reference number generator ─── */
function genRef() {
  return 'FD' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100)
}

/* ─── Step indicator ─── */
function StepBar({ step, lang }) {
  const labels = [t('s1', lang), t('s2', lang), t('s3', lang), t('s4', lang)]
  return (
    <div className="booking-stepbar">
      {labels.map((label, i) => {
        const idx = i + 1
        const done = step > idx
        const active = step === idx
        return (
          <div key={i} className={`booking-step ${active ? 'booking-step--active' : ''} ${done ? 'booking-step--done' : ''}`}>
            <div className="booking-step__circle">
              {done ? '✓' : idx}
            </div>
            <div className="booking-step__label">{label}</div>
            {i < labels.length - 1 && <div className="booking-step__line" />}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Bank type badge ─── */
function TypeBadge({ type, lang }) {
  const labels = {
    small_finance: { hi: 'लघु वित्त', ta: 'சிறு நிதி', te: 'చిన్న ఫైనాన్స్' },
    private:       { hi: 'निजी बैंक', ta: 'தனியார்',   te: 'ప్రైవేట్' },
    public:        { hi: 'सरकारी',    ta: 'அரசு',      te: 'ప్రభుత్వ' },
  }
  const colors = {
    small_finance: { bg: '#FFF3E0', color: '#E65100', border: '#FFB74D' },
    private:       { bg: '#E8F5E9', color: '#1B5E20', border: '#66BB6A' },
    public:        { bg: '#E3F2FD', color: '#0D47A1', border: '#42A5F5' },
  }
  const c = colors[type]
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '2px 8px',
      borderRadius: 20, border: `1px solid ${c.border}`,
      background: c.bg, color: c.color, display: 'inline-block',
    }}>
      {labels[type]?.[lang] || labels[type]?.hi}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════
   STEP 1 — Pick a bank
   ═══════════════════════════════════════════════════════ */
function Step1({ lang, selected, onSelect, onNext }) {
  return (
    <div className="booking-step-content">
      <h2 className="booking-section-title">{t('pickBank', lang)}</h2>
      <div className="booking-bank-list">
        {fdsData.map(fd => {
          const isSelected = selected?.id === fd.id
          const result = calcMaturity({ principal: 10000, rate: fd.rate, tenorMonths: fd.tenor, compounding: fd.compounding })
          return (
            <div
              key={fd.id}
              className={`booking-bank-card ${isSelected ? 'booking-bank-card--selected' : ''}`}
              onClick={() => onSelect(fd)}
            >
              <div className="bbc-top">
                <div className="bbc-info">
                  <div className="bbc-name">{fd.bank}</div>
                  <TypeBadge type={fd.type} lang={lang} />
                </div>
                <div className="bbc-rate">{fd.rate.toFixed(2)}%</div>
              </div>
              <div className="bbc-meta">
                <span>{t('minDep', lang)}: {formatINR(fd.minAmount)}</span>
                <span>{t('tenor', lang)}: {fd.tenor} {t('months', lang)}</span>
                <span>+{formatINR(result.interest)} {t('interest', lang)}</span>
              </div>
              {fd.fdacInsured && (
                <div className="bbc-insured">🛡 DICGC {lang === 'hi' ? 'बीमित' : lang === 'ta' ? 'காப்பீடு' : 'బీమా'}</div>
              )}
              <button
                className={`bbc-select-btn ${isSelected ? 'bbc-select-btn--selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); onSelect(fd); }}
              >
                {isSelected ? t('selected', lang) : t('selectThis', lang)}
              </button>
            </div>
          )
        })}
      </div>
      <div className="booking-nav booking-nav--single">
        <button
          className="booking-btn booking-btn--primary"
          onClick={onNext}
          disabled={!selected}
        >
          {t('next', lang)}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   STEP 2 — Amount & Tenor
   ═══════════════════════════════════════════════════════ */
function Step2({ lang, fd, amount, setAmount, tenor, setTenor, onNext, onBack }) {
  const minAmount = fd?.minAmount || 1000
  const amountNum = parseInt(amount) || 0
  const tooLow = amountNum < minAmount && amountNum > 0

  const result = (amountNum >= minAmount && tenor)
    ? calcMaturity({ principal: amountNum, rate: fd.rate, tenorMonths: tenor, compounding: fd.compounding })
    : null

  return (
    <div className="booking-step-content">
      <div className="booking-context-pill">
        <span className="bcp-bank">{fd?.bankShort}</span>
        <span className="bcp-rate">{fd?.rate}% p.a.</span>
      </div>

      {/* Amount input */}
      <div className="booking-field">
        <label className="booking-label">{t('amountLabel', lang)}</label>
        <div className="booking-amount-input-wrap">
          <span className="booking-rupee">₹</span>
          <input
            type="number"
            className={`booking-input booking-input--amount ${tooLow ? 'booking-input--error' : ''}`}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={formatINR(minAmount).replace('₹', '')}
            min={minAmount}
          />
        </div>
        {tooLow && (
          <p className="booking-error">
            {t('amountTooLow', lang)}: {formatINR(minAmount)}
          </p>
        )}
        {/* Quick amount presets */}
        <div className="booking-quick-row">
          {[5000, 10000, 25000, 50000, 100000].filter(v => v >= minAmount).map(v => (
            <button
              key={v}
              className={`booking-quick-chip ${parseInt(amount) === v ? 'booking-quick-chip--active' : ''}`}
              onClick={() => setAmount(String(v))}
            >
              {formatINR(v)}
            </button>
          ))}
        </div>
      </div>

      {/* Tenor selector */}
      <div className="booking-field">
        <label className="booking-label">{t('tenorLabel', lang)}</label>
        <div className="booking-tenor-grid">
          {TENOR_OPTIONS.map(m => (
            <button
              key={m}
              className={`booking-tenor-btn ${tenor === m ? 'booking-tenor-btn--active' : ''}`}
              onClick={() => setTenor(m)}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {/* Result preview */}
      {result && (
        <div className="booking-result-preview">
          <div className="brp-row">
            <span className="brp-label">{t('youInvest', lang)}</span>
            <span className="brp-value">{formatINR(amountNum)}</span>
          </div>
          <div className="brp-row brp-row--highlight">
            <span className="brp-label">{t('youGet', lang)}</span>
            <span className="brp-value brp-value--big">{formatINR(result.maturity)}</span>
          </div>
          <div className="brp-row">
            <span className="brp-label">{t('interest', lang)}</span>
            <span className="brp-value brp-value--green">+{formatINR(result.interest)}</span>
          </div>
        </div>
      )}

      <div className="booking-nav">
        <button className="booking-btn booking-btn--secondary" onClick={onBack}>{t('back', lang)}</button>
        <button
          className="booking-btn booking-btn--primary"
          onClick={onNext}
          disabled={!tenor || !amount || tooLow || amountNum < minAmount}
        >
          {t('next', lang)}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   STEP 3 — Personal details
   ═══════════════════════════════════════════════════════ */
function Step3({ lang, name, setName, phone, setPhone, email, setEmail, onNext, onBack }) {
  const [touched, setTouched] = useState({ name: false, phone: false })

  const nameOk  = name.trim().length >= 2
  const phoneOk = /^[6-9]\d{9}$/.test(phone.trim())

  const handleNext = () => {
    setTouched({ name: true, phone: true })
    if (nameOk && phoneOk) onNext()
  }

  return (
    <div className="booking-step-content">
      <div className="booking-field">
        <label className="booking-label">{t('nameLabel', lang)}</label>
        <input
          type="text"
          className={`booking-input ${touched.name && !nameOk ? 'booking-input--error' : ''}`}
          value={name}
          onChange={e => { setName(e.target.value); setTouched(p => ({ ...p, name: true })) }}
          placeholder={t('namePH', lang)}
        />
        {touched.name && !nameOk && <p className="booking-error">{t('nameErr', lang)}</p>}
      </div>

      <div className="booking-field">
        <label className="booking-label">{t('phoneLabel', lang)}</label>
        <div className="booking-phone-wrap">
          <span className="booking-phone-prefix">+91</span>
          <input
            type="tel"
            className={`booking-input booking-input--phone ${touched.phone && !phoneOk ? 'booking-input--error' : ''}`}
            value={phone}
            onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setTouched(p => ({ ...p, phone: true })) }}
            placeholder={t('phonePH', lang)}
            maxLength={10}
          />
        </div>
        {touched.phone && !phoneOk && <p className="booking-error">{t('phoneErr', lang)}</p>}
      </div>

      <div className="booking-field">
        <label className="booking-label">{t('emailLabel', lang)}</label>
        <input
          type="email"
          className="booking-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('emailPH', lang)}
        />
      </div>

      <div className="booking-nav">
        <button className="booking-btn booking-btn--secondary" onClick={onBack}>{t('back', lang)}</button>
        <button className="booking-btn booking-btn--primary" onClick={handleNext}>{t('next', lang)}</button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   STEP 4 — Review & Confirm
   ═══════════════════════════════════════════════════════ */
function Step4({ lang, fd, amount, tenor, name, phone, onSubmit, onBack, submitting }) {
  const result = calcMaturity({
    principal: parseInt(amount),
    rate: fd.rate,
    tenorMonths: tenor,
    compounding: fd.compounding,
  })

  const rows = [
    [t('bankLabel', lang),    fd.bank],
    [t('amtLabel', lang),     formatINR(parseInt(amount))],
    [t('tenorLbl', lang),     `${tenor} ${t('months', lang)}`],
    [t('ratePA', lang),       `${fd.rate.toFixed(2)}% p.a.`],
    [t('maturityLbl', lang),  formatINR(result.maturity)],
    [t('interest', lang),     `+${formatINR(result.interest)}`],
    [t('applicant', lang),    name],
    [t('mobile', lang),       `+91 ${phone}`],
  ]

  return (
    <div className="booking-step-content">
      <h2 className="booking-section-title">{t('reviewTitle', lang)}</h2>

      <div className="booking-review-card">
        {rows.map(([label, value], i) => (
          <div key={i} className={`review-row ${label === t('maturityLbl', lang) ? 'review-row--highlight' : ''}`}>
            <span className="review-label">{label}</span>
            <span className="review-value">{value}</span>
          </div>
        ))}
      </div>

      <p className="booking-disclaimer">{t('disclaimer', lang)}</p>

      <div className="booking-nav">
        <button className="booking-btn booking-btn--secondary" onClick={onBack} disabled={submitting}>
          {t('back', lang)}
        </button>
        <button
          className="booking-btn booking-btn--primary booking-btn--submit"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? '⏳ ...' : t('confirmBtn', lang)}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   STEP 5 — Success screen
   ═══════════════════════════════════════════════════════ */
function Step5({ lang, fd, amount, tenor, name, refNo, onReset, onGoHome }) {
  const result = calcMaturity({
    principal: parseInt(amount),
    rate: fd.rate,
    tenorMonths: tenor,
    compounding: fd.compounding,
  })

  const maturityDate = new Date()
  maturityDate.setMonth(maturityDate.getMonth() + tenor)
  const maturityStr = maturityDate.toLocaleDateString(
    lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : 'te-IN',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  return (
    <div className="booking-success">
      <div className="success-confetti" aria-hidden="true">🎊</div>
      <h2 className="success-title">{t('successTitle', lang)}</h2>
      <p className="success-sub">{t('successSub', lang)}</p>

      {/* FD certificate card */}
      <div className="success-cert">
        <div className="cert-header">
          <span className="cert-bank">{fd.bank}</span>
          <span className="cert-rate">{fd.rate.toFixed(2)}% p.a.</span>
        </div>
        <div className="cert-body">
          <div className="cert-row">
            <span>{t('applicant', lang)}</span>
            <strong>{name}</strong>
          </div>
          <div className="cert-row">
            <span>{t('amtLabel', lang)}</span>
            <strong>{formatINR(parseInt(amount))}</strong>
          </div>
          <div className="cert-row">
            <span>{t('tenorLbl', lang)}</span>
            <strong>{tenor} {t('months', lang)}</strong>
          </div>
          <div className="cert-row cert-row--highlight">
            <span>{t('maturityLbl', lang)}</span>
            <strong>{formatINR(result.maturity)}</strong>
          </div>
          <div className="cert-row">
            <span>{lang === 'hi' ? 'परिपक्वता तिथि' : lang === 'ta' ? 'முதிர்வு தேதி' : 'మెచ్యూరిటీ తేదీ'}</span>
            <strong>{maturityStr}</strong>
          </div>
        </div>
        <div className="cert-footer">
          <span className="cert-ref">{t('refLabel', lang)}: {refNo}</span>
        </div>
      </div>

      <div className="success-actions">
        <button className="booking-btn booking-btn--secondary" onClick={onGoHome}>{t('goHome', lang)}</button>
        <button className="booking-btn booking-btn--primary" onClick={onReset}>{t('anotherFD', lang)}</button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN — BookingFlow orchestrator
   ═══════════════════════════════════════════════════════ */
export default function BookingFlow({ language = 'hi', preselectedFD = null, onComplete }) {
  const [step, setStep]         = useState(1)
  const [fd, setFd]             = useState(preselectedFD)
  const [amount, setAmount]     = useState(preselectedFD ? String(Math.max(preselectedFD.minAmount, 10000)) : '')
  const [tenor, setTenor]       = useState(preselectedFD?.tenor || 12)
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [email, setEmail]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [refNo, setRefNo]       = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1400)) // simulate API call
    setRefNo(genRef())
    setStep(5)
    setSubmitting(false)
    onComplete?.({ fd, amount, tenor, name, phone })
  }

  const reset = () => {
    setStep(1); setFd(null); setAmount(''); setTenor(12)
    setName(''); setPhone(''); setEmail(''); setRefNo('')
  }

  return (
    <div className="booking-container">
      {step < 5 && <StepBar step={step} lang={language} />}

      {step === 1 && (
        <Step1
          lang={language}
          selected={fd}
          onSelect={f => { setFd(f); setAmount(String(Math.max(f.minAmount, 10000))); setTenor(f.tenor) }}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2
          lang={language} fd={fd}
          amount={amount} setAmount={setAmount}
          tenor={tenor}   setTenor={setTenor}
          onNext={() => setStep(3)} onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3
          lang={language}
          name={name}   setName={setName}
          phone={phone} setPhone={setPhone}
          email={email} setEmail={setEmail}
          onNext={() => setStep(4)} onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <Step4
          lang={language} fd={fd}
          amount={amount} tenor={tenor}
          name={name}     phone={phone}
          onSubmit={handleSubmit} onBack={() => setStep(3)}
          submitting={submitting}
        />
      )}
      {step === 5 && (
        <Step5
          lang={language} fd={fd}
          amount={amount} tenor={tenor}
          name={name}     refNo={refNo}
          onReset={reset}
          onGoHome={() => onComplete?.('home')}
        />
      )}
    </div>
  )
}