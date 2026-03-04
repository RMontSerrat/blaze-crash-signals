import { useState, useEffect } from 'react'

function useFakeOnline() {
  const [count, setCount] = useState(() => 1200 + Math.floor(Math.random() * 800))

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        const delta = Math.floor(Math.random() * 60) - 25
        return Math.max(1050, Math.min(2400, prev + delta))
      })
    }, 4000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])

  return count
}

export function StatusBar({ loading, error, lastUpdate, gamesCount }) {
  const online = useFakeOnline()

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary/50 border-b border-border text-xs text-text-secondary">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              error ? 'bg-danger' : loading ? 'bg-warning animate-pulse' : 'bg-success'
            }`}
          />
          <span>{error ? 'Erro' : loading ? 'Conectando...' : 'Online'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="font-mono">{online.toLocaleString('pt-BR')} online</span>
        </div>
        {error && <span className="text-danger">{error}</span>}
      </div>

      <div className="flex items-center gap-4">
        <span className="font-mono">{gamesCount} jogos</span>
        {lastUpdate && (
          <span className="font-mono">
            Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
          </span>
        )}
        <span className="font-mono">Poll: 3s</span>
      </div>
    </div>
  )
}
