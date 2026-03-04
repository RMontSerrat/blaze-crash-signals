export function StatsPanel({ stats }) {
  if (!stats) return null

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
        Estatísticas
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Média 10" value={`${stats.avg10.toFixed(2)}x`} />
        <StatBox label="Média 20" value={`${stats.avg20.toFixed(2)}x`} />
        <StatBox label="Mediana 10" value={`${stats.median10.toFixed(2)}x`} />
        <StatBox label="Volatilidade" value={stats.volatility.toFixed(2)} />
        <StatBox
          label="Abaixo 2x (10)"
          value={`${stats.belowTwo10}/10`}
          highlight={stats.belowTwo10 >= 7 ? 'danger' : stats.belowTwo10 >= 5 ? 'warning' : 'success'}
        />
        <StatBox
          label="Instant 0x (10)"
          value={stats.instantCrashes}
          highlight={stats.instantCrashes >= 2 ? 'danger' : undefined}
        />
        <StatBox
          label="Streak"
          value={`${stats.streak.count}x ${stats.streak.type === 'low' ? 'baixo' : 'alto'}`}
          highlight={stats.streak.type === 'low' && stats.streak.count >= 3 ? 'danger' : undefined}
        />
        <StatBox label="Último" value={`${stats.lastCrash.toFixed(2)}x`} />
      </div>
    </div>
  )
}

function StatBox({ label, value, highlight }) {
  const colorClass = highlight
    ? highlight === 'danger'
      ? 'text-danger'
      : highlight === 'warning'
        ? 'text-warning'
        : 'text-success'
    : 'text-text-primary'

  return (
    <div className="bg-bg-secondary/60 rounded-lg p-3">
      <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`text-sm font-bold font-mono ${colorClass}`}>{value}</div>
    </div>
  )
}
