const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

export async function rewriteTone({ text, formality, vibe, retry=false }) {
  const r = await fetch(`${BASE}/api/tone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, formality, vibe, retry })
  })
  if (!r.ok) {
    const err = await r.json().catch(()=>({message:'Unknown error'}))
    throw new Error(err.message || `HTTP ${r.status}`)
  }
  const data = await r.json()
  return data.output
}
