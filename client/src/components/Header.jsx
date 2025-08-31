import React, { useEffect, useState } from 'react'

export default function Header(){
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  useEffect(()=>{
    document.body.dataset.theme = theme
    localStorage.setItem('theme', theme)
  },[theme])

  return (
    <div className="nav">
      <div className="nav-left"> Fiddle Tone Picker</div>
      <div className="nav-right">
        <button className="button" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>
          {theme==='dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className="button newsession" onClick={()=>{
  localStorage.removeItem('tone-picker-state-v1')
  location.reload()
}}>
  New Session
</button>

        <a className="button" href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </div>
  )
}
