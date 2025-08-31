import React, { useEffect, useMemo, useRef, useState } from 'react'
import useUndoRedo from './hooks/useUndoRedo.js'
import TonePicker from './components/TonePicker.jsx'
import { rewriteTone } from './lib/api.js'

const LS_KEY = 'tone-picker-state-v1'

export default function Editor(){
  const saved = useMemo(()=>{
    try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') } catch { return null }
  },[])

  // start with saved text or empty (placeholder shows)
  const undo = useUndoRedo(saved?.text || '')
  const [sel, setSel] = useState(saved?.sel || [1,1]) // [formality,vibe]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // remember last user-typed text (not AI rewrites)
  const originalRef = useRef(saved?.text || '')

  // selection tracking
  const taRef = useRef(null)
  const lastReq = useRef(null)
  const [selRange, setSelRange] = useState([0,0])

  // keyboard: undo/redo
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

  // debounce autosave
  useEffect(()=>{
    const t = setTimeout(()=>{
      localStorage.setItem(LS_KEY, JSON.stringify({ text: undo.value, sel }))
    }, 600)
    return ()=>clearTimeout(t)
  },[undo.value, sel])

  // apply with live selection
  const onApply = async (overrideSel = null) => {
    setError(''); setLoading(true)

    let [s,e] = selRange
    if (taRef.current){
      s = taRef.current.selectionStart
      e = taRef.current.selectionEnd
      setSelRange([s,e])
    }
    const hasSel = e > s
    const inputText = hasSel ? undo.value.slice(s,e) : undo.value

    const [f,v] = overrideSel ?? sel
    lastReq.current = { text: inputText, formality: f, vibe: v, hasSel, s, e }

    try{
      const out = await rewriteTone({ text: inputText, formality: f, vibe: v })
      if (hasSel){
        const next = undo.value.slice(0,s) + out + undo.value.slice(e)
        undo.set(next)
        setSelRange([s+out.length, s+out.length])
      } else {
        undo.set(out)
      }
    }catch(err){ setError(err.message) }
    finally{ setLoading(false) }
  }

  const chooseSel = (nextSel)=>{
    setSel(nextSel)
    if (undo.value.trim() && !loading) onApply(nextSel)
  }

  const onTryAgain = async()=>{
    if(!lastReq.current) return
    const { text, formality, vibe, hasSel, s, e } = lastReq.current
    try{
      setLoading(true); setError('')
      const out = await rewriteTone({ text, formality, vibe, retry:true })
      if(hasSel){
        const next = undo.value.slice(0,s) + out + undo.value.slice(e)
        undo.set(next); setSelRange([s+out.length, s+out.length])
      } else {
        undo.set(out)
      }
    }catch(err){ setError(err.message) }
    finally{ setLoading(false) }
  }

  // Reset back to last user-typed input (not blank)
  const onReset = ()=>{ undo.set(originalRef.current || '') }

  return (
    <div className="container">
      <div className="grid">
        {/* Left: editor */}
        <div className="panel editor-panel">
          <div className="h1">Tone Editor</div>
          <textarea
            ref={taRef}
            className="textarea"
            value={undo.value}
            onChange={(e)=>{ undo.set(e.target.value); originalRef.current = e.target.value; }}
            onSelect={(e)=> setSelRange([e.target.selectionStart, e.target.selectionEnd])}
            onMouseUp={(e)=> setSelRange([e.target.selectionStart, e.target.selectionEnd])}
            onKeyUp={(e)=> setSelRange([e.target.selectionStart, e.target.selectionEnd])}
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
