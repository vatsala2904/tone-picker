import React, { useEffect, useState } from 'react'

export default function Header({ onNewSession }){
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  useEffect(()=>{
    document.body.dataset.theme = theme
    localStorage.setItem('theme', theme)
  },[theme])

  return (
    <div className="nav">
      <div className="nav-left">Fiddle Tone Picker</div>
      <div className="nav-right">
        <button className="button" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>
          {theme==='dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className="button newsession" onClick={onNewSession}>
          New Session
        </button>
        {/* GitHub button removed */}
      </div>
    </div>
  )
}
