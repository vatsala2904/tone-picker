import React from 'react'

export default function Landing({ hasSaved=false, onStart, onStartFresh }){
  return (
    <div className="landing">
      <h1 className="hero">Tone Picker</h1>
      <p className="sub">Adjust tone with a 3×3 matrix. Selection scope, Try Again, autosave.</p>

      {hasSaved ? (
        <div className="row" style={{gap:12}}>
          <button className="cta" onClick={onStart}>Resume last session</button>
          <button className="button action" onClick={onStartFresh}>Start fresh</button>
        </div>
      ) : (
        <button className="cta" onClick={onStart}>Start Editing</button>
      )}

      <ul className="bullets">
        <li>3×3 tone matrix</li><li>Selection scope</li><li>Try Again</li>
        <li>Undo/Redo</li><li>Light/Dark</li>
      </ul>
    </div>
  )
}
