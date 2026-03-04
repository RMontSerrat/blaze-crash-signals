import { useEffect, useRef } from 'react'

const AudioContext = window.AudioContext || window.webkitAudioContext

function playBeep(type) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'ENTRAR') {
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } else {
      osc.frequency.setValueAtTime(400, ctx.currentTime)
      osc.frequency.setValueAtTime(250, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.25)
    }

    osc.onended = () => ctx.close()
  } catch (e) {
    // Silently fail if audio not available
  }
}

export function useSignalSound(signal, newGame) {
  const signalRef = useRef(null)

  // Guarda o sinal atual sempre
  useEffect(() => {
    if (signal) {
      signalRef.current = signal.action
    }
  }, [signal])

  // Toca só quando newGame muda pra true
  useEffect(() => {
    if (newGame && signalRef.current) {
      playBeep(signalRef.current)
    }
  }, [newGame])
}
