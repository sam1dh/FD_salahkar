
const API_URL = import.meta.env.VITE_API_URL || 'https://vernacular-fd-advisor.onrender.com'

export async function askAdvisor({ userMessage, language = 'hi', fdContext = null }) {
  if (!userMessage?.trim()) {
    throw new Error('Message cannot be empty')
  }

  try {
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage,
        language,
        fdContext,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Backend API request failed')
    }

    const data = await res.json()
    return data.reply || ''
  } catch (error) {
    console.error('API Error:', error.message)
    throw error
  }
}

export const QUICK_QUESTIONS = {
  hi: [
    'DICGC ₹5 लाख तक जमा राशि को कैसे सुरक्षित करता है?',
    'FD के तीन मुख्य तत्व — Principal, Interest Rate और Tenure क्या हैं?',
    'Senior Citizen FD में अतिरिक्त ब्याज का क्या फायदा मिलता है?',
    'Cumulative FD और Non-Cumulative FD में क्या अंतर है?',
    'Tax-Saving FD पर Section 80C के तहत कितनी टैक्स छूट मिलती है?'
  ],
  ta: [
    'DICGC காப்பீடு என்றால் என்ன, என் பணம் எவ்வளவு பாதுகாப்பானது?',
    'FD-ன் மூன்று முக்கிய கூறுகள் யாவை?',
    'மூத்தோருக்கான FD-ல் எவ்வளவு கூடுதல் வட்டி கிடைக்கும்?',
    'Cumulative மற்றும் Non-Cumulative FD-க்களுக்கு இடையே உள்ள வேறுபாடு என்ன?',
    'Tax-Saving FD-ல் எவ்வளவு வரி விலக்கு கிடைக்கும்?'
  ],
  te: [
    'DICGC బీమా అంటే ఏమిటి, నా డబ్బు ఎంత సురక్షితం?',
    'FD యొక్క మూడు ప్రధాన అంశాలు ఏమిటి?',
    'సీనియర్ సిటిజన్ FDలో ఎంత అదనపు వడ్డీ లభిస్తుంది?',
    'Cumulative మరియు Non-Cumulative FDల మధ్య తేడా ఏమిటి?',
    'Tax-Saving FDలో ఎంత పన్ను మినహాయింపు ఉంటుంది?'
  ]
};

export const JARGON = {
  hi: [
    { term: 'OVD',        q: 'KYC के लिए Officially Valid Documents (OVD) कौन से हैं?' },
    { term: 'PEP',        q: 'PEP (Politically Exposed Person) किसे कहा जाता है?' },
    { term: 'Nomination', q: 'Nomination Form DA-1 क्यों जरूरी होता है?' },
    { term: 'TDS',        q: 'FD पर TDS कब और किस PAN पर कटता है?' },
    { term: 'E or S Mode', q: 'Either or Survivor (E or S) ऑपरेटिंग मोड कैसे काम करता है?' }
  ],
  ta: [
    { term: 'OVD',        q: 'KYC-க்கான OVD ஆவணங்கள் யாவை?' },
    { term: 'PEP',        q: 'PEP என்றால் என்ன?' },
    { term: 'Nomination', q: 'Form DA-1 ஏன் முக்கியம்?' },
    { term: 'TDS',        q: 'FD-ல் TDS எப்போது பிடிக்கப்படும்?' },
    { term: 'E or S Mode', q: 'Either or Survivor முறை என்றால் என்ன?' }
  ],
  te: [
    { term: 'OVD',        q: 'KYC కోసం OVD పత్రాలు ఏమిటి?' },
    { term: 'PEP',        q: 'PEP అంటే ఏమిటి?' },
    { term: 'Nomination', q: 'Form DA-1 ఎందుకు నింపాలి?' },
    { term: 'TDS',        q: 'FD పై TDS ఎప్పుడు కట్ అవుతుంది?' },
    { term: 'E or S Mode', q: 'Either or Survivor మోడ్ అంటే ఏమిటి?' }
  ]
};