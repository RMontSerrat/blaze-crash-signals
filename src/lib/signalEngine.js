/**
 * Signal Engine — analisa histórico de crash points e gera sugestões.
 *
 * DISCLAIMER: crash games são aleatórios. Estas sugestões são baseadas
 * em heurísticas estatísticas e NÃO garantem resultado.
 */

export function analyzeGames(games) {
  if (!games || games.length < 5) {
    return { signal: null, stats: null }
  }

  const crashPoints = games
    .map((g) => parseFloat(g.crash_point))
    .filter((v) => !isNaN(v))

  if (crashPoints.length < 5) {
    return { signal: null, stats: null }
  }

  const stats = computeStats(crashPoints)
  const signal = generateSignal(crashPoints, stats)

  return { signal, stats }
}

function computeStats(points) {
  const recent10 = points.slice(0, 10)
  const recent20 = points.slice(0, 20)
  const recent50 = points.slice(0, 50)

  const avg10 = average(recent10)
  const avg20 = average(recent20)
  const avg50 = average(recent50)

  const median10 = median(recent10)
  const median20 = median(recent20)

  const belowTwo10 = recent10.filter((v) => v < 2).length
  const belowTwo20 = recent20.filter((v) => v < 2).length

  const instantCrashes = recent10.filter((v) => v === 0).length
  const streak = getStreak(points)

  const volatility = standardDeviation(recent10)

  // Percentis dos últimos 20 jogos (para cashout dinâmico)
  const sorted20 = [...recent20].sort((a, b) => a - b)
  const p25 = percentile(sorted20, 25)
  const p40 = percentile(sorted20, 40)
  const p50 = percentile(sorted20, 50)
  const p60 = percentile(sorted20, 60)

  return {
    avg10,
    avg20,
    avg50,
    median10,
    median20,
    belowTwo10,
    belowTwo20,
    instantCrashes,
    streak,
    volatility,
    lastCrash: points[0],
    secondLast: points[1] ?? 0,
    recent10,
    p25,
    p40,
    p50,
    p60,
  }
}

function generateSignal(points, stats) {
  const {
    avg10,
    avg20,
    median10,
    median20,
    belowTwo10,
    instantCrashes,
    streak,
    volatility,
    lastCrash,
    secondLast,
    p25,
    p40,
    p50,
    p60,
  } = stats

  let confidence = 50
  const reasons = []

  // ===== CASHOUT: baseado nos percentis reais dos dados =====
  // Usa o percentil 40 como base — "onde 40% dos jogos crasham antes"
  // Isso dá um cashout que historicamente teria sobrevivido em ~60% dos jogos
  let suggestedCashout = Math.max(1.2, p40)

  // Ajusta com base no contexto
  if (streak.type === 'low' && streak.count >= 4) {
    // Muitos baixos seguidos — ser mais conservador, usar p25
    suggestedCashout = Math.max(1.2, p25)
    confidence += 10
    reasons.push(`🛡️ ${streak.count} crashes baixos seguidos — cashout conservador`)
  } else if (streak.type === 'low' && streak.count >= 2) {
    suggestedCashout = Math.max(1.3, p40)
    confidence += 5
    reasons.push(`⬇️ ${streak.count} crashes baixos seguidos`)
  } else if (streak.type === 'high' && streak.count >= 3) {
    // Sequência de altos — pode arriscar mais, usar p60
    suggestedCashout = Math.max(1.5, p60)
    confidence += 15
    reasons.push(`🔥 ${streak.count} crashes altos seguidos — janela favorável`)
  } else if (streak.type === 'high' && streak.count >= 2) {
    suggestedCashout = Math.max(1.4, p50)
    confidence += 8
    reasons.push(`📈 ${streak.count} crashes altos seguidos`)
  }

  // ===== CONFIANÇA =====

  // Proporção de baixos nos últimos 10
  if (belowTwo10 >= 8) {
    confidence -= 10
    reasons.push(`🚨 ${belowTwo10}/10 jogos abaixo de 2x — zona perigosa`)
  } else if (belowTwo10 >= 6) {
    confidence -= 5
    reasons.push(`⚠️ ${belowTwo10}/10 jogos abaixo de 2x`)
  } else if (belowTwo10 <= 3) {
    confidence += 12
    reasons.push(`✅ Apenas ${belowTwo10}/10 abaixo de 2x — momento favorável`)
  } else if (belowTwo10 <= 4) {
    confidence += 5
    reasons.push(`👍 ${belowTwo10}/10 abaixo de 2x — razoável`)
  }

  // Instant crashes recentes
  if (instantCrashes >= 3) {
    confidence -= 20
    suggestedCashout = Math.max(1.2, suggestedCashout * 0.8)
    reasons.push(`💀 ${instantCrashes} instant crashes (0x) nos últimos 10 — risco extremo`)
  } else if (instantCrashes >= 2) {
    confidence -= 10
    suggestedCashout = Math.max(1.2, suggestedCashout * 0.9)
    reasons.push(`☠️ ${instantCrashes} instant crashes (0x) nos últimos 10`)
  } else if (instantCrashes === 0) {
    confidence += 5
    reasons.push('🟢 Nenhum instant crash recente')
  }

  // Último jogo
  if (lastCrash === 0) {
    confidence -= 8
    reasons.push('💥 Último jogo foi instant crash (0x)')
  } else if (lastCrash >= 10) {
    // Após um crash muito alto, o próximo tende a ser menor
    suggestedCashout = Math.max(1.3, p40 * 0.9)
    confidence -= 5
    reasons.push(`📉 Último crash alto (${lastCrash.toFixed(2)}x) — regressão provável`)
  } else if (lastCrash >= 5) {
    confidence += 3
    reasons.push(`🎯 Último crash em ${lastCrash.toFixed(2)}x`)
  } else if (lastCrash < 1.5 && secondLast < 1.5) {
    confidence += 8
    reasons.push('🔄 2 crashes baixos seguidos — possível recuperação')
  }

  // Volatilidade
  if (volatility > 8) {
    confidence -= 8
    reasons.push('🌊 Volatilidade muito alta — mercado instável')
  } else if (volatility > 5) {
    confidence -= 3
    reasons.push('📊 Volatilidade alta')
  } else if (volatility < 1.5) {
    confidence += 5
    reasons.push('🧊 Baixa volatilidade — mercado estável')
  }

  // Média curta vs longa
  if (avg10 > avg20 * 1.3) {
    confidence += 5
    reasons.push('🚀 Média recente acima da média geral — tendência de alta')
  } else if (avg10 < avg20 * 0.7) {
    confidence -= 5
    reasons.push('📉 Média recente abaixo da média geral — tendência de baixa')
  }

  // ===== DECISÃO =====
  confidence = Math.max(10, Math.min(90, confidence))

  let action = confidence >= 50 ? 'ENTRAR' : 'PULAR'

  // Arredondar
  suggestedCashout = Math.round(suggestedCashout * 100) / 100

  return {
    action,
    confidence,
    suggestedCashout,
    reasons,
    timestamp: Date.now(),
  }
}

// --- Helpers ---

function average(arr) {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function median(arr) {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0
  const index = (p / 100) * (sortedArr.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sortedArr[lower]
  return sortedArr[lower] + (sortedArr[upper] - sortedArr[lower]) * (index - lower)
}

function standardDeviation(arr) {
  const avg = average(arr)
  const squareDiffs = arr.map((v) => (v - avg) ** 2)
  return Math.sqrt(average(squareDiffs))
}

function getStreak(points) {
  if (points.length === 0) return { type: 'none', count: 0 }

  const threshold = 2.0
  const firstIsLow = points[0] < threshold
  let count = 0

  for (const p of points) {
    const isLow = p < threshold
    if (isLow === firstIsLow) {
      count++
    } else {
      break
    }
  }

  return {
    type: firstIsLow ? 'low' : 'high',
    count,
  }
}
