const store = new Map()
export function get(key){
const v = store.get(key)
if(!v) return null
if(v.exp && v.exp < Date.now()){ store.delete(key); return null }
return v.val
}
export function set(key, val, ttlMs=60_000){ // 1 min default
store.set(key, { val, exp: Date.now()+ttlMs })
}