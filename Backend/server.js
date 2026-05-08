import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

const LANGUAGE_PROMPTS = {
  hi: `You are a beginner-friendly FD advisor for users in India.

STRICT RULES:
- Always reply in simple Hindi (no English mixing unless user uses English)
- Keep answers VERY SHORT (max 2–3 lines)
- Use simple words like: "paisa", "kamai", "lock", "nikalna"
- Always explain with ₹ example when needed

BEHAVIOR:
- If user is confused → guide step-by-step (ask what they want to do)
- If user asks "kya karu" → suggest next step (amount, time, bank)
- If user asks about safety → explain DICGC ₹5 lakh simply

TONE:
- Be neutral and factual
- DO NOT give advice or recommendations
`,

ta: `You are a beginner-friendly FD advisor for users in India.

STRICT RULES:
- Always reply in simple Tamil (no English mixing unless user uses English)
- Keep answers VERY SHORT (max 2–3 lines)
- Use simple Tamil terms

BEHAVIOR:
- If user is confused → guide step-by-step
- If user asks about safety → explain ₹5 lakh insurance simply

TONE:
- Neutral, factual, no advice
`,

te: `You are a beginner-friendly FD advisor for users in India.

STRICT RULES:
- Always reply in simple Telugu only (no English mixing unless user uses English)
- Keep answers VERY SHORT (max 2–3 lines)

BEHAVIOR:
- If user is confused → guide step-by-step
- If user asks about safety → explain ₹5 lakh insurance simply

TONE:
- Neutral, no advice

DO NOT:
- give opinions
- mix English unnecessarily
- repeat answers
`,
}
const upload = multer({ storage: multer.memoryStorage() })
/**
 * POST /api/chat
 */
// app.post('/api/chat', async (req, res) => {
//   try {
//     const { userMessage, language = 'hi', fdContext = null } = req.body

//     if (!userMessage?.trim()) {
//       return res.status(400).json({ error: 'userMessage is required' })
//     }

//     const apiKey = process.env.OPENROUTER_API_KEY
//     if (!apiKey) {
//       console.error('OPENROUTER_API_KEY not set in .env')
//       return res.status(500).json({ error: 'API key not configured' })
//     }

//     const systemPrompt = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.hi

//     // Inject FD context into the system prompt so the model knows which FD
//     const contextNote = fdContext
//       ? `\n\nThe user is currently viewing this Fixed Deposit:\nBank: ${fdContext.bank}\nRate: ${fdContext.rate}% p.a.\nTenor: ${fdContext.tenor} months\nMinimum deposit: ₹${fdContext.minAmount?.toLocaleString('en-IN')}\nType: ${fdContext.type}\nInsured: ${fdContext.fdacInsured ? 'Yes, up to ₹5 lakh (DICGC)' : 'No'}\n\nAnswer questions in the context of this specific FD when relevant.`
//       : ''

//     const response = await fetch(OPENROUTER_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type':  'application/json',
//         'Authorization': `Bearer ${apiKey}`,
//         'HTTP-Referer':  process.env.APP_URL || 'http://localhost:5173',
//         'X-Title':       'Vernacular FD Advisor',
//       },
//       body: JSON.stringify({
//         // mistralai/mistral-7b-instruct is FREE on OpenRouter (no credits needed)
//         // Other free options: google/gemma-3-12b-it:free  |  meta-llama/llama-3.1-8b-instruct:free
//         model: 'gpt-3.5-turbo',
//         messages: [
//           { role: 'system',  content: systemPrompt + contextNote },
//           { role: 'user',    content: userMessage },
//         ],
//         max_tokens:  350,
//         temperature: 0.7,
//       }),
//     })

//     if (!response.ok) {
//       const err = await response.json()
//       console.error('OpenRouter API Error:', err)
//       return res.status(response.status).json({ error: err.error?.message || 'OpenRouter request failed' })
//     }

//     const data  = await response.json()
//     const reply = data.choices?.[0]?.message?.content || ''

//     res.json({ reply })

//   } catch (error) {
//     console.error('Server error:', error.message)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    // We send the audio buffer directly to Deepgram's REST API
    // We are using 'nova-2' model and setting language to Hindi ('hi')
    const deepgramUrl = 'https://api.deepgram.com/v1/listen?model=nova-2&language=hi'
    
    const response = await fetch(deepgramUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': req.file.mimetype,
      },
      body: req.file.buffer
    })

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.status}`)
    }

    const data = await response.json()
    // Extract the text from Deepgram's response
    const transcript = data.results?.channels[0]?.alternatives[0]?.transcript || ''
    
    res.json({ text: transcript })

  } catch (error) {
    console.error('❌ Deepgram Error:', error.message)
    res.status(500).json({ error: 'Voice transcription failed' })
  }
})

/**
 * POST /api/speak - Text to Speech
 */
// server.js - Update this route
app.post('/api/speak', async (req, res) => {
  try {
    const { text, language } = req.body;
    const apiKey = process.env.SARVAM_API_KEY; // Ensure this is in your .env

    // Map your app's language codes to Sarvam's supported codes
    const sarvamLangMap = {
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN'
    };

    // Map language to available speaker for bulbul:v2 model
    const speakerMap = {
      hi: 'manisha',      // Hindi female voice
      ta: 'manisha',      // Tamil
      te: 'anushka'       // Telugu
    };

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: sarvamLangMap[language] || 'hi-IN',
        speaker: speakerMap[language] || 'manisha',
        model: 'bulbul:v2',
        pitch: 0,
        pace: 1.0,
        loudness: 1.5,
        speech_sample_rate: 16000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sarvam Error: ${errorText}`);
    }

    const data = await response.json();
    // Sarvam returns a base64 string in 'audios' array
    const audioBuffer = Buffer.from(data.audios[0], 'base64');

    res.setHeader('Content-Type', 'audio/wav');
    res.send(audioBuffer);

  } catch (error) {
    console.error('❌ Sarvam TTS Error:', error.message);
    res.status(500).json({ error: 'Speech generation failed' });
  }
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', model: 'gpt-3.5-turbo' }))

app.listen(PORT, () => {
  console.log(`🚀 Voice Server → http://localhost:${PORT}`)
  console.log(`🎤 Deepgram STT → POST /api/transcribe`)
  console.log(`🔊 Sarvam TTS   → POST /api/speak`)
})