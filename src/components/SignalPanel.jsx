import { useMemo } from 'react'

const ACTION_CONFIG = {
  ENTRAR: {
    bg: 'bg-accent/10',
    border: 'border-accent',
    text: 'text-accent',
    glow: 'animate-pulse-glow',
    icon: '✅',
    label: 'ENTRAR',
  },
  PULAR: {
    bg: 'bg-danger/10',
    border: 'border-danger',
    text: 'text-danger',
    glow: 'animate-pulse-glow-danger',
    icon: '⛔',
    label: 'PULAR',
  },
}

export function SignalPanel({ signal, newGame }) {
  const config = useMemo(
    () => (signal ? ACTION_CONFIG[signal.action] || ACTION_CONFIG.PULAR : null),
    [signal]
  )

  if (!signal) {
    return (
      <div className="rounded-xl border border-border bg-bg-card p-6 text-center">
        <div className="text-text-secondary text-sm">Carregando sinais...</div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-6 ${config.glow} transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Sinal Atual
        </h2>
        {newGame && (
          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full animate-slide-in">
            NOVO JOGO
          </span>
        )}
      </div>

      {/* Action */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-3xl">{config.icon}</span>
        <span className={`text-3xl font-extrabold ${config.text} font-mono`}>
          {config.label}
        </span>
      </div>

      {/* Cashout sugerido — só mostra quando é ENTRAR */}
      {signal.action === 'ENTRAR' && (
        <div className="bg-bg-secondary/60 rounded-lg p-4 mb-4">
          <div className="text-xs text-text-secondary mb-2">Cashout sugerido</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-accent font-medium">Sair até</span>
            <span className="text-3xl font-extrabold font-mono text-accent">
              {signal.suggestedCashout.toFixed(2)}x
            </span>
          </div>
        </div>
      )}

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>Confiança</span>
          <span className="font-mono">{signal.confidence}%</span>
        </div>
        <div className="w-full bg-bg-secondary rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              signal.confidence >= 65
                ? 'bg-accent'
                : signal.confidence >= 45
                  ? 'bg-warning'
                  : 'bg-danger'
            }`}
            style={{ width: `${signal.confidence}%` }}
          />
        </div>
      </div>

      {/* Reasons */}
      <div className="space-y-2">
        <div className="text-xs text-text-secondary uppercase tracking-wider">Análise</div>
        {signal.reasons.map((reason, i) => (
          <div
            key={i}
            className="text-xs text-text-secondary flex items-start gap-2"
          >
            <span>{reason}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
