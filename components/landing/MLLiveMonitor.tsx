'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, Clock3, Gauge, Server, Wifi, WifiOff } from 'lucide-react'

type PingResponse = {
  ok: boolean
  statusCode: number
  latencyMs: number
  checkedAt: string
  target: string
  error?: string
}

const POLL_INTERVAL_MS = 25_000

export function MLLiveMonitor() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastPing, setLastPing] = useState<PingResponse | null>(null)
  const [latencies, setLatencies] = useState<number[]>([])
  const [totalPings, setTotalPings] = useState(0)
  const [successPings, setSuccessPings] = useState(0)

  const pingML = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/ml/ping', {
        method: 'GET',
        cache: 'no-store',
      })

      const data = (await response.json()) as PingResponse
      setLastPing(data)
      setTotalPings((current) => current + 1)

      if (data.ok) {
        setSuccessPings((current) => current + 1)
      }

      if (typeof data.latencyMs === 'number') {
        setLatencies((current) => [...current.slice(-29), data.latencyMs])
      }
    } catch {
      const fallback: PingResponse = {
        ok: false,
        statusCode: 0,
        latencyMs: 0,
        checkedAt: new Date().toISOString(),
        target: 'ML health endpoint',
        error: 'Could not reach ping route',
      }

      setLastPing(fallback)
      setTotalPings((current) => current + 1)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void pingML()
    const timer = setInterval(() => {
      void pingML()
    }, POLL_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [pingML])

  const stats = useMemo(() => {
    if (latencies.length === 0) {
      return {
        avg: 0,
        min: 0,
        max: 0,
      }
    }

    const sum = latencies.reduce((acc, value) => acc + value, 0)

    return {
      avg: Math.round(sum / latencies.length),
      min: Math.min(...latencies),
      max: Math.max(...latencies),
    }
  }, [latencies])

  const successRate = totalPings > 0 ? Math.round((successPings / totalPings) * 100) : 0

  return (
    <section className="rounded-2xl bg-white dark:bg-neutral-surface-dark border border-slate-200/70 dark:border-slate-800 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">ML Uptime and Latency Monitor</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Auto-pings every {Math.round(POLL_INTERVAL_MS / 1000)} seconds to keep the service warm and measure real-time response behavior.
          </p>
        </div>

        <button
          onClick={() => {
            void pingML()
          }}
          disabled={isLoading}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
        >
          {isLoading ? 'Pinging...' : 'Ping Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          icon={<Clock3 className="w-4 h-4" />}
          label="Last Latency"
          value={`${lastPing?.latencyMs ?? 0} ms`}
          tone="text-slate-900 dark:text-white"
        />
        <StatCard
          icon={<Gauge className="w-4 h-4" />}
          label="Average"
          value={`${stats.avg} ms`}
          tone="text-slate-900 dark:text-white"
        />
        <StatCard
          icon={<Activity className="w-4 h-4" />}
          label="Success Rate"
          value={`${successRate}%`}
          tone="text-slate-900 dark:text-white"
        />
        <StatCard
          icon={<Server className="w-4 h-4" />}
          label="Status"
          value={lastPing?.ok ? 'ONLINE' : 'OFFLINE'}
          tone={lastPing?.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}
        />
      </div>

      <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/30">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Min: <strong className="text-slate-900 dark:text-white">{stats.min} ms</strong></span>
          <span className="text-slate-600 dark:text-slate-300">Max: <strong className="text-slate-900 dark:text-white">{stats.max} ms</strong></span>
          <span className="text-slate-600 dark:text-slate-300">Pings: <strong className="text-slate-900 dark:text-white">{totalPings}</strong></span>
          <span className="text-slate-600 dark:text-slate-300">Last Check: <strong className="text-slate-900 dark:text-white">{lastPing ? new Date(lastPing.checkedAt).toLocaleTimeString() : 'N/A'}</strong></span>
        </div>

        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Endpoint: {lastPing?.target ?? 'ML health endpoint'}
        </div>

        {lastPing?.ok ? (
          <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Wifi className="w-4 h-4" />
            ML service is reachable and warmed by periodic traffic.
          </div>
        ) : (
          <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
            <WifiOff className="w-4 h-4" />
            ML service is not reachable right now{lastPing?.error ? `: ${lastPing.error}` : '.'}
          </div>
        )}
      </div>
    </section>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: string
}) {
  return (
    <article className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950/30 p-4">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-lg font-extrabold ${tone}`}>{value}</p>
    </article>
  )
}
