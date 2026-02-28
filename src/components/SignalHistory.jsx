export function SignalHistory({ history, stats }) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Resultados dos Sinais
        </h2>
        {stats.total > 0 && (
          <span className="text-xs font-mono text-text-secondary">
            {stats.total} jogos
          </span>
        )}
      </div>

      {/* Win rate bar */}
      {stats.total > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-accent font-bold font-mono">{stats.greens}</span>
                <span className="text-text-secondary">green</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-danger" />
                <span className="text-danger font-bold font-mono">{stats.reds}</span>
                <span className="text-text-secondary">red</span>
              </span>
            </div>
            <span
              className={`text-sm font-bold font-mono ${
                stats.winRate >= 60 ? 'text-accent' : stats.winRate >= 40 ? 'text-warning' : 'text-danger'
              }`}
            >
              {stats.winRate}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-bg-secondary rounded-full overflow-hidden flex">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${stats.winRate}%` }}
            />
            <div
              className="h-full bg-danger transition-all duration-500"
              style={{ width: `${100 - stats.winRate}%` }}
            />
          </div>
        </div>
      )}

      {/* History list */}
      {history.length === 0 ? (
        <div className="text-center py-6 text-text-secondary text-xs">
          Aguardando jogos para registrar resultados...
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
          {history.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                i === 0 ? 'animate-slide-in' : ''
              } ${
                entry.isGreen
                  ? 'bg-accent/5 border border-accent/20'
                  : 'bg-danger/5 border border-danger/20'
              }`}
            >
              {/* Left side */}
              <div className="flex items-center gap-2.5">
                <span className="text-base">
                  {entry.isGreen ? '🟢' : '🔴'}
                </span>
                <div>
                  <span
                    className={`font-bold font-mono ${
                      entry.isGreen ? 'text-accent' : 'text-danger'
                    }`}
                  >
                    {entry.crashPoint === 0 ? '0x' : `${entry.crashPoint.toFixed(2)}x`}
                  </span>
                  <div className="text-text-secondary text-[10px]">
                    {entry.timestamp.toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="text-right">
                <div className="text-text-secondary text-[10px]">Cashout</div>
                <div className="font-mono font-bold text-text-primary">
                  {entry.suggestedCashout.toFixed(2)}x
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
