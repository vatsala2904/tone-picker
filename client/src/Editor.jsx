// client/src/Editor.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import useUndoRedo from './hooks/useUndoRedo.js'
import TonePicker from './components/TonePicker.jsx'
import { rewriteTone } from './lib/api.js'

const LS_KEY = 'tone-picker-state-v1'

export default function Editor(){
  const saved = useMemo(()=>{
    try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') } catch { return null }
  },[])

  const undo = useUndoRedo(saved?.text || 'Paste or type text here…')
  const [sel, setSel] = useState(saved?.sel || [1,1]) // [formality,vibe]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // selection-aware extras
  const taRef = useRef(null)
  const lastReq = useRef(null)
  const [selRange, setSelRange] = useState([0,0])

  // keyboard: undo/redo and Cmd/Ctrl+Enter to apply
  useEffect(()=>{
    const h = (e)=>{
      if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='z'){
        e.preventDefault()
        if (e.shiftKey) undo.redo(); else undo.undo()
      }
    }
    window.addEventListener('keydown', h)
    return ()=>window.removeEventListener('keydown', h)
  },[undo])

  // persist current text and picker selection
  useEffect(()=>{
    localStorage.setItem(LS_KEY, JSON.stringify({ text: undo.value, sel }))
  },[undo.value, sel])

  const onApply = async (overrideSel = null) => {
  setError(''); setLoading(true)
  const [s,e] = selRange
  const hasSel = e > s
  const inputText = hasSel ? undo.value.slice(s,e) : undo.value
  const [f, v] = overrideSel ?? sel
  lastReq.current = { text: inputText, formality: f, vibe: v, hasSel, s, e }
  try{
    const args = { text: inputText, formality: f, vibe: v }
    if (typeof emo !== 'undefined' && emo) args.emotion = emo
    const output = await rewriteTone(args)
    if(hasSel){
      const next = undo.value.slice(0,s) + output + undo.value.slice(e)
      undo.set(next); setSelRange([s+output.length, s+output.length])
    } else {
      undo.set(output)
    }
  } catch(err){ setError(err.message) }
  finally{ setLoading(false) }
}
const chooseSel = (nextSel) => {
  setSel(nextSel)
  if (undo.value.trim() && !loading) onApply(nextSel)
}



  const onTryAgain = async()=>{
    if(!lastReq.current) return
    const { text, formality, vibe, hasSel, s, e } = lastReq.current
    try{
      setLoading(true); setError('')
      const output = await rewriteTone({ text, formality, vibe, retry: true })
      if(hasSel){
        const next = undo.value.slice(0,s) + output + undo.value.slice(e)
        undo.set(next); setSelRange([s+output.length, s+output.length])
      } else {
        undo.set(output)
      }
    }catch(err){ setError(err.message) }
    finally{ setLoading(false) }
  }

  const onReset = ()=>{ undo.set('') }

  return (
  <div className="container">
    <div className="grid">
      {/* Left: editor with neon outline */}
      <div className="panel editor-panel">
        <div className="h1">Tone Editor</div>
        <textarea
          ref={taRef}
          className="textarea"
          value={undo.value}
          onChange={(e)=>undo.set(e.target.value)}
          onSelect={(e)=> setSelRange([e.target.selectionStart, e.target.selectionEnd])}
          onKeyDown={(e)=>{ if((e.metaKey||e.ctrlKey) && e.key==='Enter' && !loading){ onApply() } }}
          placeholder="Write something to adjust its tone."
        />
        <div className="footer">
          <div className="row" style={{gap:8}}>
  <button className="button action" onClick={undo.undo} disabled={!undo.canUndo}>Undo</button>
  <button className="button action" onClick={undo.redo} disabled={!undo.canRedo}>Redo</button>
  <button className="button action" onClick={onReset}>Reset</button>
  <button className="button action" onClick={onTryAgain} disabled={loading || !lastReq.current}>Try Again</button>
</div>

          <div>{error ? <span className="error">{error}</span> : null}</div>
        </div>
      </div>

      {/* Right: picker and presets */}
      <div className="panel picker-panel">
        <TonePicker selection={sel} onSelect={chooseSel} disabled={loading} />
        {loading && <div className="loading" style={{marginTop:10}}>Contacting AI…</div>}
        <div className="divider"></div>
        <div className="small">
          Selected: {[['Formal','Neutral','Casual'][sel[0]], ['Serious','Neutral','Playful'][sel[1]]].join(' × ')}
        </div>
        <div className="divider"></div>
        <div className="small">Presets:</div>
        <ul className="preset-list">
  <li><button className="linklike" onClick={()=>chooseSel([0,0])}>Executive</button></li>
  <li><button className="linklike" onClick={()=>chooseSel([0,1])}>Technical</button></li>
  <li><button className="linklike" onClick={()=>chooseSel([1,0])}>Educational</button></li>
  <li><button className="linklike" onClick={()=>chooseSel([2,1])}>Basic</button></li>
</ul>
      </div>
    </div>
  </div>
)
}