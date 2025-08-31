import React, { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Landing from './pages/Landing.jsx'
import Editor from './Editor.jsx'
import Footer from './components/Footer.jsx'

export default function App(){
  const [mode, setMode] = useState('landing')
  useEffect(()=>{ if(localStorage.getItem('tone-picker-state-v1')) setMode('editor') },[])
  return (
    <div className="app-wrap">
      <Header />
      {mode === 'landing'
        ? <Landing onStart={()=>setMode('editor')} />
        : (<>
            <Editor />
            <Footer />
          </>)
      }
    </div>
  )
}
