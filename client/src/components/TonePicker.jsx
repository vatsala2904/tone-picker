import React from 'react'

const FORMALITY = ['Formal','Neutral','Casual']
const VIBE = ['Serious','Neutral','Playful']

export default function TonePicker({ selection, onSelect, disabled }){
const [fSel, vSel] = selection
return (
<div>
<div className="row"><div className="h1">Tone Picker 3×3</div></div>
<div className="small">Rows = Formality, Cols = Vibe</div>
<div className="divider"></div>
<div className="grid3">
{FORMALITY.map((f,i)=> VIBE.map((v,j)=>{
const active = fSel===i && vSel===j
return (
<button key={`${i}-${j}`} className={`cell ${active?'active':''}`} disabled={disabled}
onClick={()=>onSelect([i,j])} aria-label={`${f} × ${v}`}>
<div style={{fontWeight:600}}>{f}</div>
<div className="badge">{v}</div>
</button>
)
}))}
</div>
</div>
)
}