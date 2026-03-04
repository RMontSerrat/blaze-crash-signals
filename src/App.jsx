import { useMemo } from 'react'
import { useCrashHistory } from './hooks/useCrashHistory'
import { useSignalHistory } from './hooks/useSignalHistory'
import { useSignalSound } from './hooks/useSignalSound'
import { analyzeGames } from './lib/signalEngine'
import { SignalPanel } from './components/SignalPanel'
import { StatsPanel } from './components/StatsPanel'
import { HistoryStrip } from './components/HistoryStrip'
import { SignalHistory } from './components/SignalHistory'
import { GameLink } from './components/GameIframe'
import { StatusBar } from './components/StatusBar'

export default function App() {
  const { games, loading, error, lastUpdate, newGameDetected } = useCrashHistory(3000)

  const { signal, stats } = useMemo(() => analyzeGames(games), [games])

  const { history: signalHistory, stats: signalStats } = useSignalHistory(games, signal)

  useSignalSound(signal, newGameDetected)

  return (
    <div className="flex flex-col h-screen">
      {/* Status Bar */}
      <StatusBar
        loading={loading}
        error={error}
        lastUpdate={lastUpdate}
        gamesCount={games.length}
      />

      {/* Header */}
      <header className="px-6 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">SINAIS CRASH</span>{' '}
            <span className="text-text-secondary font-normal">Blaze</span>
          </span>
          <span className="text-[10px] bg-bg-card border border-border text-text-secondary px-2 py-0.5 rounded-full uppercase tracking-wider">
            Grátis
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-text-secondary/50 hidden sm:block">
            Sinais em tempo real — use lado a lado com a Blaze
          </span>
          <GameLink />
        </div>
      </header>

      {/* Main Content — single column, scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto p-4 space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold">
              <span className="text-primary">Sinais Crash Blaze</span>{' '}
              <span className="text-text-secondary font-normal">— Grátis e em Tempo Real</span>
            </h1>
            <p className="text-xs text-text-secondary/60">
              Powered by <span className="text-primary font-semibold">Claude AI (Anthropic)</span>
            </p>
          </div>
          <SignalPanel signal={signal} newGame={newGameDetected} />
          <SignalHistory history={signalHistory} stats={signalStats} />
          <HistoryStrip games={games} />
          <StatsPanel stats={stats} />

          {/* Footer */}
          <footer className="text-center pt-4 pb-8">
            <p className="text-[11px] text-text-secondary/40">
              Sinais gratuitos para o Crash da Blaze, atualizados em tempo real a cada rodada. Análise estatística automática com sugestão de entrada e cashout.
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
