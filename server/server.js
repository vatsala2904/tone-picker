import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import fetch from 'node-fetch'
import crypto from 'node:crypto'
import { get as cget, set as cset } from './cache.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(rateLimit({ windowMs: 60_000, max: 30 }))

const PORT = process.env.PORT || 8787
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions'
const MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest'
const KEY = process.env.MISTRAL_API_KEY

if (!KEY) {
  console.error('Missing MISTRAL_API_KEY in .env')
  process.exit(1)
}

function sanitize(s) {
  return String(s || '').slice(0, 8000)
}

function prompt(formality, vibe) {
  const F = ['Formal', 'Neutral', 'Casual'][formality] ?? 'Neutral'
  const V = ['Serious', 'Neutral', 'Playful'][vibe] ?? 'Neutral'
  return `You rewrite text by adjusting tone. Keep meaning intact and minimize edits.
Target tone: Formality=${F}, Vibe=${V}.
Preserve technical terms and URLs.
Keep length within ±10% of original.
Keep the language the same as input.
Return ONLY the rewritten text.`
}

app.post('/api/tone', async (req, res) => {
  try {
    const { text, formality, vibe, retry } = req.body || {}
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'text required' })
    }

    const cacheKey = crypto
      .createHash('sha256')
      .update(`${formality}|${vibe}|${text}`)
      .digest('hex')

    const cached = !retry ? cget(cacheKey) : null
    if (cached) return res.json({ output: cached, cached: true })

    const body = {
      model: MODEL,
      messages: [
        { role: 'system', content: prompt(formality, vibe) + (retry ? '\nProvide a different alternative phrasing.' : '') },
        { role: 'user', content: sanitize(text) }
      ],
      temperature: retry ? 0.7 : 0.3,
      max_tokens: 1024
    }

    const r = await fetch(MISTRAL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!r.ok) {
      const errTxt = await r.text().catch(() => '')
      return res
        .status(502)
        .json({ message: `Upstream error ${r.status}: ${errTxt.slice(0, 200)}` })
    }

    const data = await r.json()
    const output = data?.choices?.[0]?.message?.content?.trim()
    if (!output) return res.status(502).json({ message: 'Empty response from model' })

    cset(cacheKey, output, 5 * 60_000) // 5 min TTL
    res.json({ output })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Server error' })
  }
})

app.listen(PORT, () => {
  console.log('Server listening on', PORT)
})
