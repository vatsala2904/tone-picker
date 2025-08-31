import { useCallback, useState } from 'react'

export default function useUndoRedo(initial) {
const [past, setPast] = useState([])
const [present, setPresent] = useState(initial)
const [future, setFuture] = useState([])

const set = useCallback((val) => {
setPast((p) => [...p, present])
setPresent(val)
setFuture([])
}, [present])

const undo = useCallback(() => {
if (!past.length) return
const previous = past[past.length - 1]
setPast(past.slice(0, -1))
setFuture((f) => [present, ...f])
setPresent(previous)
}, [past, present])

const redo = useCallback(() => {
if (!future.length) return
const next = future[0]
setFuture(future.slice(1))
setPast((p) => [...p, present])
setPresent(next)
}, [future, present])

return { value: present, set, undo, redo, canUndo: past.length>0, canRedo: future.length>0 }
}