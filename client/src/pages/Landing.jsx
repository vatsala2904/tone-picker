import React from 'react'

export default function Landing({ onStart }){
  return (
    <div className="landing">
      <h1 className="hero">Rewrite text by tone.</h1>
      <p className="sub">Pick Formality × Vibe. Apply, undo/redo, and iterate fast.</p>
      <ul className="bullets">
        <li>3×3 tone matrix</li>
        <li>Selection-scoped rewrite</li>
        <li>Try Again with variety</li>
        <li>Local autosave</li>
      </ul>
      <button className="cta" onClick={onStart}>Start Editing</button>
    </div>
  )
}
