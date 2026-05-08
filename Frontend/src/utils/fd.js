/**
 * Calculate FD maturity amount
 * Formula: A = P * (1 + r/n)^(nt)
 * where n = compounding frequency per year
 */
export function calcMaturity({ principal, rate, tenorMonths, compounding = 'quarterly' }) {
  const n = compounding === 'monthly' ? 12 : compounding === 'quarterly' ? 4 : 1
  const t = tenorMonths / 12
  const r = rate / 100
  const maturity = principal * Math.pow(1 + r / n, n * t)
  return {
    maturity: Math.round(maturity),
    interest: Math.round(maturity - principal),
    principal,
    effectiveRate: (((maturity / principal) - 1) / t * 100).toFixed(2),
  }
}

/**
 * Format currency in Indian style — ₹1,00,000
 */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get bank type badge color
 */
export function getBankTypeColor(type) {
  switch (type) {
    case 'small_finance': return { bg: '#FFF3E0', text: '#E65100', border: '#FFB74D' }
    case 'private':       return { bg: '#E8F5E9', text: '#1B5E20', border: '#66BB6A' }
    case 'public':        return { bg: '#E3F2FD', text: '#0D47A1', border: '#42A5F5' }
    default:              return { bg: '#F3E5F5', text: '#4A148C', border: '#AB47BC' }
  }
}

/**
 * Sort FDs by criterion
 */
export function sortFDs(fds, by = 'rate') {
  return [...fds].sort((a, b) => {
    if (by === 'rate')   return b.rate - a.rate
    if (by === 'safe')   return safetyScore(b) - safetyScore(a)
    if (by === 'min')    return a.minAmount - b.minAmount
    return 0
  })
}

function safetyScore(fd) {
  let score = 0
  if (fd.type === 'public')        score += 3
  if (fd.type === 'private')       score += 2
  if (fd.type === 'small_finance') score += 1
  if (fd.fdacInsured)              score += 1
  if (fd.tags?.includes('trusted')) score += 1
  return score
}

/**
 * Filter FDs by category
 */
export function filterFDs(fds, filter) {
  if (filter === 'all')          return fds
  if (filter === 'government')   return fds.filter(f => f.type === 'public')
  if (filter === 'private')      return fds.filter(f => f.type === 'private')
  if (filter === 'smallFinance') return fds.filter(f => f.type === 'small_finance')
  if (filter === 'highRate')     return fds.filter(f => f.rate >= 7.5)
  if (filter === 'safest')       return fds.filter(f => f.type === 'public' || f.tags?.includes('trusted'))
  return fds
}

/**
 * Get a brief safety note per bank type
 */
export function getSafetyNote(fd, language = 'hi') {
  const notes = {
    hi: {
      small_finance: 'RBI लाइसेंस प्राप्त, ₹5 लाख तक DICGC बीमा',
      private:       'RBI द्वारा नियंत्रित निजी बैंक',
      public:        'भारत सरकार का बैंक — सबसे सुरक्षित',
    },
    ta: {
      small_finance: 'RBI உரிமம், ₹5 லட்சம் வரை காப்பீடு',
      private:       'RBI கட்டுப்பாட்டிலுள்ள தனியார் வங்கி',
      public:        'இந்திய அரசின் வங்கி — மிகவும் பாதுகாப்பான',
    },
    te: {
      small_finance: 'RBI లైసెన్స్, ₹5 లక్షల వరకు బీమా',
      private:       'RBI నిర్వహణలో ప్రైవేట్ బ్యాంక్',
      public:        'భారత ప్రభుత్వ బ్యాంక్ — అత్యంత సురక్షితం',
    },
  }
  return notes[language]?.[fd.type] || notes.hi[fd.type]
}