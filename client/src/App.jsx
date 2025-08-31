import React, { useState } from 'react'
import Header from './components/Header.jsx'
import Landing from './pages/Landing.jsx'
import Editor from './Editor.jsx'

const LS_KEY = 'tone-picker-state-v1'

export default function App(){
  // Always start on landing
  const [mode, setMode] = useState('landing')
  const hasSaved = !!localStorage.getItem(LS_KEY)

  return (
    <div className="app-wrap">
      <Header
        onNewSession={()=> setMode('landing')}
        showNew={mode === 'editor'}
      />
      {mode === 'landing'
        ? (
          <Landing
            hasSaved={hasSaved}
            onStart={()=>setMode('editor')}
            onStartFresh={()=>{
              localStorage.removeItem(LS_KEY)
              setMode('editor')
            }}
          />
        )
        : <Editor />
      }
    </div>
  )
}
