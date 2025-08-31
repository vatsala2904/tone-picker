import React, { useState } from 'react'
import Header from './components/Header.jsx'
import Landing from './pages/Landing.jsx'
import Editor from './Editor.jsx'

const LS_KEY = 'tone-picker-state-v1'

export default function App(){
  const [mode, setMode] = useState(() =>
    localStorage.getItem(LS_KEY) ? 'editor' : 'landing'
  )
  const hasSaved = !!localStorage.getItem(LS_KEY)

  return (
    <div className="app-wrap">
      <Header onNewSession={()=> setMode('landing')} />
      {mode === 'landing'
        ? <Landing
            hasSaved={hasSaved}
            onStart={()=>setMode('editor')}
            onStartFresh={()=>{
              localStorage.removeItem(LS_KEY)
              setMode('editor')
            }}
          />
        : <Editor />
      }
    </div>
  )
}
