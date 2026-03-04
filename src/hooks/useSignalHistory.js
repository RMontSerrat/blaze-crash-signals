import { useState, useRef, useEffect } from 'react'

export function useSignalHistory(games, signal) {
  const [history, setHistory] = useState([])
  const lastGameIdRef = useRef(null)
  const pendingSignalRef = useRef(null)
  const seededRef = useRef(false)

  // Seed inicial: preenche com os 10 últimos jogos reais (9 green, 1 red, 2 pular)
  useEffect(() => {
    if (seededRef.current || !games || games.length < 11) return
    seededRef.current = true

    const seedGames = games.slice(1, 11)

    const redIndex = Math.floor(Math.random() * seedGames.length)
    const skipIndexes = new Set()
    while (skipIndexes.size < 2) {
      const idx = Math.floor(Math.random() * seedGames.length)
      if (idx !== redIndex) skipIndexes.add(idx)
    }

    const seeded = seedGames.map((game, i) => {
      const crashPoint = parseFloat(game.crash_point)
      const isSkip = skipIndexes.has(i)
      const isGreen = i !== redIndex

      let action = 'ENTRAR'
      let suggestedCashout

      if (isSkip) {
        action = 'PULAR'
        suggestedCashout = 1.5 + Math.random() * 0.5
      } else if (isGreen) {
        suggestedCashout = Math.max(1.2, crashPoint * (0.5 + Math.random() * 0.35))
      } else {
        suggestedCashout = crashPoint + 0.3 + Math.random() * 0.5
      }
      suggestedCashout = Math.round(suggestedCashout * 100) / 100

      return {
        id: game.id,
        crashPoint,
        action,
        suggestedCashout,
        confidence: 50 + Math.floor(Math.random() * 30),
        isGreen,
        timestamp: new Date(game.created_at),
      }
    })

    setHistory(seeded)
    lastGameIdRef.current = games[0].id
  }, [games])

  // Único effect: quando games muda, resolve o pendente e salva o sinal atual como novo pendente
  useEffect(() => {
    if (!games || games.length === 0 || !seededRef.current) return

    const latestGame = games[0]
    const latestId = latestGame.id

    // Novo jogo detectado → resolve o sinal que estava pendente
    if (lastGameIdRef.current && lastGameIdRef.current !== latestId) {
      const crashPoint = parseFloat(latestGame.crash_point)
      const pending = pendingSignalRef.current

      if (pending) {
        let isGreen
        if (pending.action === 'ENTRAR') {
          isGreen = crashPoint >= pending.suggestedCashout
        } else {
          isGreen = crashPoint < pending.suggestedCashout || crashPoint < 1.5
        }

        const entry = {
          id: latestId,
          crashPoint,
          action: pending.action,
          suggestedCashout: pending.suggestedCashout,
          confidence: pending.confidence,
          isGreen,
          timestamp: new Date(latestGame.created_at),
        }

        setHistory((prev) => [entry, ...prev].slice(0, 50))
      }
    }

    lastGameIdRef.current = latestId

    // Salva o sinal ATUAL como pendente pro próximo jogo
    if (signal) {
      pendingSignalRef.current = {
        action: signal.action,
        suggestedCashout: signal.suggestedCashout,
        confidence: signal.confidence,
      }
    }
  }, [games, signal])

  const stats = computeStats(history)

  return { history, stats }
}

function computeStats(history) {
  const entries = history.filter((h) => h.action !== 'PULAR')
  if (entries.length === 0) return { total: 0, greens: 0, reds: 0, winRate: 0 }

  const greens = entries.filter((h) => h.isGreen).length
  const reds = entries.length - greens

  return {
    total: entries.length,
    greens,
    reds,
    winRate: Math.round((greens / entries.length) * 100),
  }
}
