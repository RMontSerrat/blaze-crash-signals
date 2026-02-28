import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE =
  '/api/singleplayer-originals/originals/crash_games/recent/history/4'

function buildApiUrl() {
  const now = new Date()
  const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 dias
  const startDate = past.toISOString()
  const endDate = now.toISOString()
  return `${API_BASE}?page=1&startDate=${startDate}&endDate=${endDate}`
}

export function useCrashHistory(pollInterval = 2000) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [newGameDetected, setNewGameDetected] = useState(false)
  const lastGameIdRef = useRef(null)
  const intervalRef = useRef(null)

  const fetchHistory = useCallback(async () => {
    try {
      const url = buildApiUrl()
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      const records = data?.records || data || []
      if (!Array.isArray(records) || records.length === 0) return

      const completedGames = records.filter((g) => g.status === 'complete')

      if (completedGames.length > 0) {
        const latestId = completedGames[0].id
        if (lastGameIdRef.current && lastGameIdRef.current !== latestId) {
          setNewGameDetected(true)
          setTimeout(() => setNewGameDetected(false), 3000)
        }
        lastGameIdRef.current = latestId
      }

      setGames(completedGames)
      setLastUpdate(new Date())
      setError(null)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
    intervalRef.current = setInterval(fetchHistory, pollInterval)
    return () => clearInterval(intervalRef.current)
  }, [fetchHistory, pollInterval])

  return { games, loading, error, lastUpdate, newGameDetected }
}
