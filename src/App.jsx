import { useMemo } from 'react'
import { useCrashHistory } from './hooks/useCrashHistory'
import { useSignalHistory } from './hooks/useSignalHistory'
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
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-accent">CRASH</span>{' '}
            <span className="text-text-secondary font-normal">Signals</span>
          </h1>
          <span className="text-[10px] bg-bg-card border border-border text-text-secondary px-2 py-0.5 rounded-full uppercase tracking-wider">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-text-secondary/50 hidden sm:block">
            Use lado a lado com a Blaze
          </span>
          <GameLink />
        </div>
      </header>

      {/* Main Content — single column, scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto p-4 space-y-4">
          <SignalPanel signal={signal} newGame={newGameDetected} />
          <SignalHistory history={signalHistory} stats={signalStats} />
          <HistoryStrip games={games} />
          <StatsPanel stats={stats} />
        </div>
      </main>
    </div>
  )
}
