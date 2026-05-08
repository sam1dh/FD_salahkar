import { useState } from 'react'
import { calcMaturity, formatINR } from '../utils/fd'

const L = {
  title:      { hi: '🎯 FD लक्ष्य ट्रैकर',           ta: '🎯 FD இலக்கு கண்காணிப்பு',        te: '🎯 FD లక్ష్య ట్రాకర్' },
  subtitle:   { hi: 'अपना सपना — हम रास्ता दिखाएंगे', ta: 'உங்கள் கனவு — நாங்கள் வழி காட்டுவோம்', te: 'మీ కల — మేము దారి చూపిస్తాం' },
  goal:       { hi: 'आपका लक्ष्य क्या है?',           ta: 'உங்கள் இலக்கு என்ன?',               te: 'మీ లక్ష్యం ఏమిటి?' },
  targetAmt:  { hi: 'कितना पैसा चाहिए? (₹)',          ta: 'எவ்வளவு பணம் வேண்டும்? (₹)',        te: 'ఎంత డబ్బు కావాలి? (₹)' },
  savedSoFar: { hi: 'अब तक कितना बचाया?',             ta: 'இதுவரை எவ்வளவு சேமித்தீர்கள்?',    te: 'ఇప్పటివరకు ఎంత దాచారు?' },
  months:     { hi: 'कितने महीनों में चाहिए?',         ta: 'எத்தனை மாதங்களில் வேண்டும்?',      te: 'ఎన్ని నెలల్లో కావాలి?' },
  rate:       { hi: 'FD ब्याज दर (%)',                ta: 'FD வட்டி விகிதம் (%)',              te: 'FD వడ్డీ రేటు (%)' },
  plan:       { hi: 'आपका प्लान',                     ta: 'உங்கள் திட்டம்',                   te: 'మీ ప్లాన్' },
  monthly:    { hi: 'हर महीने RD करें',               ta: 'மாதந்தோறும் RD செய்யுங்கள்',       te: 'ప్రతి నెలా RD చేయండి' },
  lumpsum:    { hi: 'आज FD करें',                     ta: 'இன்று FD செய்யுங்கள்',             te: 'ఈరోజు FD చేయండి' },
  willGet:    { hi: 'मिलेगा',                          ta: 'கிடைக்கும்',                       te: 'వస్తుంది' },
  gap:        { hi: 'अभी भी चाहिए',                   ta: 'இன்னும் தேவை',                     te: 'ఇంకా కావాలి' },
  achieved:   { hi: '🎉 लक्ष्य पूरा होगा!',            ta: '🎉 இலக்கு நிறைவேறும்!',             te: '🎉 లక్ష్యం పూర్తవుతుంది!' },
  notEnough:  { hi: '⚠️ थोड़ा और चाहिए',             ta: '⚠️ கொஞ்சம் கூட வேண்டும்',          te: '⚠️ కొంచెం ఎక్కువ కావాలి' },
}

const GOALS = [
  { id: 'shaadi',    hi: '💍 शादी',           ta: '💍 திருமணம்',        te: '💍 పెళ్ళి',       default: 200000 },
  { id: 'ghar',      hi: '🏠 घर',             ta: '🏠 வீடு',            te: '🏠 ఇల్లు',        default: 500000 },
  { id: 'padhai',    hi: '📚 पढ़ाई',           ta: '📚 படிப்பு',         te: '📚 చదువు',        default: 100000 },
  { id: 'car',       hi: '🚗 गाड़ी',           ta: '🚗 கார்',            te: '🚗 కారు',         default: 300000 },
  { id: 'medical',   hi: '🏥 इलाज',           ta: '🏥 சிகிச்சை',       te: '🏥 వైద్యం',       default: 50000 },
  { id: 'custom',    hi: '✏️ अपना लक्ष्य',    ta: '✏️ சொந்த இலக்கு',   te: '✏️ స్వంత లక్ష్యం', default: 100000 },
]

export default function GoalTracker({ language = 'hi' }) {
  const t = (key) => L[key]?.[language] || L[key]?.hi || key

  const [selectedGoal, setSelectedGoal] = useState(GOALS[0])
  const [targetAmount, setTargetAmount] = useState(200000)
  const [savedSoFar, setSavedSoFar]     = useState(0)
  const [months, setMonths]             = useState(24)
  const [rate, setRate]                 = useState(8.5)

  const remaining = Math.max(0, targetAmount - savedSoFar)
  const progressPct = Math.min(100, Math.round((savedSoFar / targetAmount) * 100))

  // RD monthly needed
  const rdMonthly = Math.ceil(remaining / months * (1 + (rate / 100 / 12) * (months / 2)))

  // If lumpsum invested today
  const lumpResult = calcMaturity({ principal: remaining, rate, tenorMonths: months, compounding: 'quarterly' })
  const willGetLump = lumpResult.maturity

  const isAchieved = willGetLump >= remaining
  const isRDOk = rdMonthly * months >= remaining

  return (
    <div style={{ padding: '12px 16px 80px', overflowY: 'auto' }}>

      {/* Title */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: '#FF6B00' }}>{t('title')}</div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{t('subtitle')}</div>
      </div>

      {/* Goal chips */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
          {t('goal')}
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {GOALS.map(g => (
            <button
              key={g.id}
              onClick={() => { setSelectedGoal(g); setTargetAmount(g.default) }}
              style={{
                padding: '7px 14px', borderRadius: 20,
                border: `1.5px solid ${selectedGoal.id === g.id ? '#FF6B00' : '#ddd'}`,
                background: selectedGoal.id === g.id ? '#FFF3E0' : 'white',
                color: selectedGoal.id === g.id ? '#FF6B00' : '#444',
                fontSize: 13, cursor: 'pointer', fontWeight: selectedGoal.id === g.id ? 500 : 400,
              }}
            >
              {g[language] || g.hi}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        background: '#f5f5f5', borderRadius: 12, padding: '14px 16px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
          <span style={{ color: '#888' }}>{t('savedSoFar')}: {formatINR(savedSoFar)}</span>
          <span style={{ color: '#FF6B00', fontWeight: 500 }}>{progressPct}%</span>
        </div>
        <div style={{ background: '#e0e0e0', borderRadius: 10, height: 12, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progressPct}%`,
            background: progressPct >= 100 ? '#4CAF50' : 'linear-gradient(90deg, #FF6B00, #FF9800)',
            borderRadius: 10, transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#aaa' }}>
          <span>₹0</span>
          <span>{formatINR(targetAmount)}</span>
        </div>
      </div>

      {/* Inputs */}
      {[
        { label: t('targetAmt'), value: targetAmount, set: setTargetAmount, min: 10000, max: 2000000, step: 5000 },
        { label: t('savedSoFar'), value: savedSoFar, set: setSavedSoFar, min: 0, max: targetAmount, step: 1000 },
        { label: t('months'), value: months, set: setMonths, min: 3, max: 120, step: 1, suffix: ' M' },
        { label: t('rate'), value: rate, set: setRate, min: 5, max: 10, step: 0.25, suffix: '%', float: true },
      ].map(({ label, value, set, min, max, step, suffix, float }) => (
        <div key={label} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 13, color: '#555' }}>{label}</label>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>
              {float ? value.toFixed(2) : formatINR(value)}{suffix || ''}
            </span>
          </div>
          <input
            type="range" min={min} max={max} step={step} value={value}
            onChange={e => set(float ? parseFloat(e.target.value) : parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#FF6B00' }}
          />
        </div>
      ))}

      {/* Plan result */}
      <div style={{
        background: isAchieved ? '#E8F5E9' : '#FFF3E0',
        border: `1.5px solid ${isAchieved ? '#4CAF50' : '#FF9800'}`,
        borderRadius: 14, padding: 16, marginTop: 8,
      }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: isAchieved ? '#1B5E20' : '#E65100', marginBottom: 12 }}>
          {isAchieved ? t('achieved') : t('notEnough')}
        </div>

        {/* Option A — RD */}
        <div style={{
          background: 'white', borderRadius: 10, padding: '10px 14px', marginBottom: 10,
          border: '1px solid #ddd',
        }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{t('plan')} A — {t('monthly')}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#FF6B00' }}>
            {formatINR(rdMonthly)}
            <span style={{ fontSize: 13, fontWeight: 400, color: '#888' }}> / {language === 'hi' ? 'महीना' : language === 'ta' ? 'மாதம்' : 'నెల'}</span>
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            {months} {language === 'hi' ? 'महीने' : language === 'ta' ? 'மாதங்கள்' : 'నెలలు'} × {formatINR(rdMonthly)} = {formatINR(rdMonthly * months)}
          </div>
        </div>

        {/* Option B — Lumpsum */}
        <div style={{
          background: 'white', borderRadius: 10, padding: '10px 14px',
          border: '1px solid #ddd',
        }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{t('plan')} B — {t('lumpsum')}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: 13, color: '#555' }}>{formatINR(remaining)} → {months} {language === 'hi' ? 'महीने' : 'months'}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#4CAF50' }}>
                {formatINR(willGetLump)} {t('willGet')}
              </div>
            </div>
            <div style={{
              fontSize: 12, padding: '4px 10px',
              background: isAchieved ? '#E8F5E9' : '#FFE8D6',
              color: isAchieved ? '#1B5E20' : '#E65100',
              borderRadius: 20, border: `1px solid ${isAchieved ? '#4CAF50' : '#FF9800'}`,
            }}>
              {rate}% p.a.
            </div>
          </div>
          {!isAchieved && (
            <div style={{ fontSize: 12, color: '#E65100', marginTop: 6 }}>
              {t('gap')}: {formatINR(remaining - willGetLump)}
            </div>
          )}
        </div>

        {/* Best bank recommendation */}
        <div style={{ marginTop: 12, fontSize: 12, color: '#555', background: 'white', borderRadius: 8, padding: '8px 12px', border: '1px solid #eee' }}>
          💡 {language === 'hi' ? `Suryoday SFB में ${rate}% p.a. पर FD करें — DICGC से ₹5 लाख तक protected` :
              language === 'ta' ? `Suryoday SFB-ல் ${rate}% p.a. FD செய்யுங்கள் — DICGC கீழ் ₹5 லட்சம் பாதுகாப்பு` :
              `Suryoday SFB లో ${rate}% p.a. FD చేయండి — DICGC ₹5 లక్షల వరకు రక్షణ`}
        </div>
      </div>
    </div>
  )
}