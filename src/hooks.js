import { scheduleWork, getHook } from './reconciler'
let cursor = 0

function update (key, reducer, value) {
  value = reducer ? reducer(this.state[key], value) : value
  this.state[key] = value
  scheduleWork(this, true)
}
export function resetCursor () {
  cursor = 0
}
export function useState (initState) {
  return useReducer(null, initState)
}
export function useReducer (reducer, initState) {
  let wip = getHook()
  let key = getKey()
  let setter = update.bind(wip, key, reducer)
  if (key in wip.state) {
    return [wip.state[key], setter]
  } else {
    wip.state[key] = initState
    return [initState, setter]
  }
}

export function useEffect (cb, deps) {
  let wip = getHook()
  let key = getKey()
  if (isChanged(wip.deps[key], deps)) {
    wip.effect[key] = useCallback(cb, deps)
    wip.deps[key] = deps
  }
}

export function useMemo (cb, deps) {
  let wip = getHook()
  let key = getKey()
  if (isChanged(wip.deps[key], deps)) {
    wip.deps[key] = deps
    return (wip.memo[key] = cb())
  }
  return wip.memo[key]
}

export function useCallback (cb, deps) {
  return useMemo(() => cb, deps)
}

export function useRef (current) {
  return { current }
}

function isChanged (a, b) {
  return !a || b.some((arg, index) => arg !== a[index])
}

function getKey(){
  return '$' + cursor && cursor++
}