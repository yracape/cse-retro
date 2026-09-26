import { useEffect, useState } from 'react'

const PREFIX = 'cse-retro:'

/**
 * useState synchronisé avec localStorage :
 * les modifications survivent au rechargement de la page.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw !== null ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // stockage plein ou indisponible : on ignore silencieusement
    }
  }, [key, value])

  return [value, setValue] as const
}

export function clearPersistentData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k))
}
