export function StatusBar({ loading, error, lastUpdate, gamesCount }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary/50 border-b border-border text-xs text-text-secondary">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              error ? 'bg-danger' : loading ? 'bg-warning animate-pulse' : 'bg-accent'
            }`}
          />
          <span>{error ? 'Erro' : loading ? 'Conectando...' : 'Online'}</span>
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
