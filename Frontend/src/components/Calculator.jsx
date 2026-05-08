import { useState, useMemo } from 'react'
import { calcMaturity, formatINR } from '../utils/fd'

/* ─── UI labels per language ─── */
const L = {
  title:       { hi: 'कितना मिलेगा?',           ta: 'எவ்வளவு கிடைக்கும்?',          te: 'ఎంత వస్తుంది?' },
  principal:   { hi: 'जमा राशि (₹)',             ta: 'வைப்பு தொகை (₹)',              te: 'డిపాజిట్ మొత్తం (₹)' },
  tenorLabel:  { hi: 'अवधि',                     ta: 'காலம்',                        te: 'అవధి' },
  months:      { hi: 'महीने',                    ta: 'மாதங்கள்',                     te: 'నెలలు' },
  rateLabel:   { hi: 'ब्याज दर',                 ta: 'வட்டி விகிதம்',                te: 'వడ్డీ రేటు' },
  compLabel:   { hi: 'चक्रवृद्धि',               ta: 'கூட்டு வட்டி முறை',            te: 'కాంపౌండింగ్' },
  monthly:     { hi: 'मासिक',                    ta: 'மாதாந்திர',                    te: 'నెలవారీ' },
  quarterly:   { hi: 'तिमाही',                   ta: 'காலாண்டு',                     te: 'త్రైమాసిక' },
  yearly:      { hi: 'वार्षिक',                  ta: 'வருடாந்திர',                   te: 'వార్షిక' },
  youGet:      { hi: 'आपको मिलेगा',              ta: 'நீங்கள் பெறுவீர்கள்',          te: 'మీకు వస్తుంది' },
  interest:    { hi: 'ब्याज से कमाई',            ta: 'வட்டி ஆதாயம்',                 te: 'వడ్డీ ఆదాయం' },
  effRate:     { hi: 'प्रभावी वार्षिक दर',       ta: 'பயனுள்ள வட்டி விகிதம்',       te: 'ప్రభావవంతమైన రేటు' },
  invested:    { hi: 'आपने लगाया',               ta: 'நீங்கள் போட்டது',              te: 'మీరు పెట్టింది' },
  jargonTitle: { hi: 'इन शब्दों का मतलब जानें 👇', ta: 'இந்த வார்த்தைகளை புரிந்துகொள்ளுங்கள் 👇', te: 'ఈ పదాల అర్థం తెలుసుకోండి 👇' },
  askBtn:      { hi: 'AI से पूछें →',            ta: 'AI-யிடம் கேளுங்கள் →',         te: 'AI తో అడగండి →' },
  seniorNote:  { hi: 'वरिष्ठ नागरिकों को +0.50% अतिरिक्त ब्याज मिलता है', ta: 'மூத்தோருக்கு +0.50% கூடுதல் வட்டி', te: 'సీనియర్ సిటిజన్లకు +0.50% అదనపు వడ్డీ' },
}

/* ─── Bar chart helper ─── */
function GrowthBar({ principal, maturity }) {
  const pct = Math.min((principal / maturity) * 100, 100).toFixed(1)
  const intPct = (100 - pct).toFixed(1)
  return (
    <div className="growth-bar-wrap">
      <div className="growth-bar">
        <div className="growth-bar__principal" style={{ width: `${pct}%` }} />
        <div className="growth-bar__interest" style={{ width: `${intPct}%` }} />
      </div>
      <div className="growth-bar__legend">
        <span className="legend-dot legend-dot--principal" />
        <span className="legend-label">{pct}% Principal</span>
        <span className="legend-dot legend-dot--interest" />
        <span className="legend-label">{intPct}% Interest</span>
      </div>
    </div>
  )
}

export default function Calculator({ language = 'hi', onAskAdvisor }) {
  const [principal, setPrincipal] = useState(10000)
  const [tenorMonths, setTenorMonths] = useState(12)
  const [rate, setRate]             = useState(7.0)
  const [compounding, setCompounding] = useState('quarterly')

  const t = (key) => L[key]?.[language] || L[key]?.hi || key

  const result = useMemo(
    () => calcMaturity({ principal, rate, tenorMonths, compounding }),
    [principal, rate, tenorMonths, compounding]
  )


  return (
    <div className="calc-page">

      {/* ── Inputs ── */}
      <div className="calc-card">
        <h2 className="calc-title">{t('title')}</h2>

        {/* Principal */}
        <div className="calc-field">
          <div className="calc-field__header">
            <label className="calc-label">{t('principal')}</label>
            <span className="calc-value-display">{formatINR(principal)}</span>
          </div>
          <input
            type="range"
            className="calc-slider"
            min={1000} max={500000} step={1000}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
          />
          <div className="calc-slider-ends">
            <span>₹1,000</span><span>₹5,00,000</span>
          </div>
          <div className="calc-quick-amounts">
            {[5000, 10000, 50000, 100000].map((v) => (
              <button
                key={v}
                className={`quick-amount ${principal === v ? 'quick-amount--active' : ''}`}
                onClick={() => setPrincipal(v)}
              >
                {formatINR(v)}
              </button>
            ))}
          </div>
        </div>

        {/* Tenor */}
        <div className="calc-field">
          <div className="calc-field__header">
            <label className="calc-label">{t('tenorLabel')}</label>
            <span className="calc-value-display">{tenorMonths} {t('months')}</span>
          </div>
          <input
            type="range"
            className="calc-slider"
            min={3} max={60} step={1}
            value={tenorMonths}
            onChange={(e) => setTenorMonths(Number(e.target.value))}
          />
          <div className="calc-slider-ends">
            <span>3 {t('months')}</span><span>60 {t('months')}</span>
          </div>
          <div className="calc-quick-amounts">
            {[6, 12, 24, 36].map((v) => (
              <button
                key={v}
                className={`quick-amount ${tenorMonths === v ? 'quick-amount--active' : ''}`}
                onClick={() => setTenorMonths(v)}
              >
                {v}M
              </button>
            ))}
          </div>
        </div>

        {/* Rate */}
        <div className="calc-field">
          <div className="calc-field__header">
            <label className="calc-label">{t('rateLabel')}</label>
            <span className="calc-value-display calc-value-display--rate">{rate.toFixed(2)}%</span>
          </div>
          <input
            type="range"
            className="calc-slider calc-slider--green"
            min={4} max={10} step={0.05}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
          <div className="calc-slider-ends">
            <span>4%</span><span>10%</span>
          </div>
        </div>

        {/* Compounding */}
        <div className="calc-field">
          <label className="calc-label">{t('compLabel')}</label>
          <div className="comp-toggle">
            {['monthly', 'quarterly', 'yearly'].map((c) => (
              <button
                key={c}
                className={`comp-btn ${compounding === c ? 'comp-btn--active' : ''}`}
                onClick={() => setCompounding(c)}
              >
                {t(c)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Result Card ── */}
      <div className="calc-result">
        <div className="result-row result-row--main">
          <span className="result-label">{t('youGet')}</span>
          <span className="result-amount">{formatINR(result.maturity)}</span>
        </div>

        <GrowthBar principal={principal} maturity={result.maturity} />

        <div className="result-grid">
          <div className="result-item">
            <span className="result-item__label">{t('invested')}</span>
            <span className="result-item__value">{formatINR(principal)}</span>
          </div>
          <div className="result-item result-item--green">
            <span className="result-item__label">{t('interest')}</span>
            <span className="result-item__value">+{formatINR(result.interest)}</span>
          </div>
          <div className="result-item result-item--blue">
            <span className="result-item__label">{t('effRate')}</span>
            <span className="result-item__value">{result.effectiveRate}%</span>
          </div>
        </div>

        <p className="senior-note">ℹ {t('seniorNote')}</p>
      </div>


    </div>
  )
}