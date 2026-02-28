export function HistoryStrip({ games }) {
  if (!games || games.length === 0) return null

  const recent = games.slice(0, 30)

  return (
    <div className="rounded-xl border border-border bg-bg-card p-4">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
        Últimos Resultados
      </h2>

      <div className="flex flex-wrap gap-1.5">
        {recent.map((game, i) => {
          const crash = parseFloat(game.crash_point)
          const colorClass = getColorClass(crash)

          return (
            <div
              key={game.id}
              className={`${colorClass} rounded px-2 py-1 text-xs font-bold font-mono transition-all duration-200 hover:scale-110 cursor-default ${
                i === 0 ? 'animate-slide-in ring-1 ring-white/20' : ''
              }`}
              title={`ID: ${game.id}\nCrash: ${crash}x\n${new Date(game.created_at).toLocaleTimeString('pt-BR')}`}
            >
              {crash === 0 ? '0x' : `${crash.toFixed(2)}x`}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getColorClass(crash) {
  if (crash === 0) return 'bg-red-900/80 text-red-300'
  if (crash < 1.5) return 'bg-red-800/60 text-red-300'
  if (crash < 2) return 'bg-orange-800/60 text-orange-300'
  if (crash < 3) return 'bg-yellow-800/50 text-yellow-300'
  if (crash < 5) return 'bg-green-800/50 text-green-300'
  if (crash < 10) return 'bg-emerald-800/50 text-emerald-300'
  return 'bg-cyan-800/60 text-cyan-200'
}
