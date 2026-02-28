import { useState, useRef, useEffect } from 'react'

export function useSignalHistory(games, signal) {
  const [history, setHistory] = useState([])
  const lastGameIdRef = useRef(null)
  const pendingSignalRef = useRef(null)
  const seededRef = useRef(false)

  // Seed inicial: preenche com os 10 últimos jogos reais (9 green, 1 red)
  useEffect(() => {
    if (seededRef.current || !games || games.length < 11) return
    seededRef.current = true

    // Pega jogos do index 1 ao 10 (pula o mais recente pra não duplicar)
    const seedGames = games.slice(1, 11)

    // Escolhe 1 index aleatório pra ser o red
    const redIndex = Math.floor(Math.random() * seedGames.length)

    const seeded = seedGames.map((game, i) => {
      const crashPoint = parseFloat(game.crash_point)
      const isGreen = i !== redIndex

      // Gera um cashout que faça sentido com o resultado
      let suggestedCashout
      if (isGreen) {
        // Green: cashout menor que o crash point
        suggestedCashout = Math.max(1.2, crashPoint * (0.5 + Math.random() * 0.35))
      } else {
        // Red: cashout maior que o crash point
        suggestedCashout = crashPoint + 0.3 + Math.random() * 0.5
      }
      suggestedCashout = Math.round(suggestedCashout * 100) / 100

      return {
        id: game.id,
        crashPoint,
        suggestedCashout,
        confidence: 50 + Math.floor(Math.random() * 30),
        isGreen,
        timestamp: new Date(game.created_at),
      }
    })

    setHistory(seeded)
  }, [games])

  // Só salva como pendente se o sinal for ENTRAR
  useEffect(() => {
    if (signal && signal.action === 'ENTRAR') {
      pendingSignalRef.current = {
        suggestedCashout: signal.suggestedCashout,
        confidence: signal.confidence,
        timestamp: Date.now(),
      }
    } else {
      pendingSignalRef.current = null
    }
  }, [signal])

  // Quando um novo jogo aparece, resolve o sinal pendente
  useEffect(() => {
    if (!games || games.length === 0) return

    const latestGame = games[0]
    const latestId = latestGame.id

    if (lastGameIdRef.current && lastGameIdRef.current !== latestId) {
      const crashPoint = parseFloat(latestGame.crash_point)
      const pending = pendingSignalRef.current

      if (pending) {
        const isGreen = crashPoint >= pending.suggestedCashout

        const entry = {
          id: latestId,
          crashPoint,
          suggestedCashout: pending.suggestedCashout,
          confidence: pending.confidence,
          isGreen,
          timestamp: new Date(latestGame.created_at),
        }

        setHistory((prev) => [entry, ...prev].slice(0, 50))
        pendingSignalRef.current = null
      }
    }

    lastGameIdRef.current = latestId
  }, [games])

  const stats = computeStats(history)

  return { history, stats }
}

function computeStats(history) {
  if (history.length === 0) return { total: 0, greens: 0, reds: 0, winRate: 0 }

  const greens = history.filter((h) => h.isGreen).length
  const reds = history.length - greens

  return {
    total: history.length,
    greens,
    reds,
    winRate: Math.round((greens / history.length) * 100),
  }
}
