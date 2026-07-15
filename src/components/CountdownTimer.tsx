"use client"

import { useState, useEffect } from "react"

interface Props {
  expiresAt: string
  compact?: boolean
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer({ expiresAt, compact }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      }
    }
    setTimeLeft(calc())
    const id = setInterval(() => setTimeLeft(calc()), 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  if (!timeLeft) return null

  const total = timeLeft.days * 24 * 60 * 60 + timeLeft.hours * 60 * 60 + timeLeft.minutes * 60 + timeLeft.seconds
  const urgency = total < 86400 ? "critical" : total < 259200 ? "warning" : "normal"

  const colors = {
    normal: "text-[var(--text-secondary)]",
    warning: "text-[var(--accent)]",
    critical: "text-red-700 animate-pulse-dark",
  }

  if (compact) {
    return (
      <span className={`font-mono text-xs ${colors[urgency]}`}>
        {timeLeft.days}d {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m
      </span>
    )
  }

  return (
    <div className={`flex items-center gap-2 font-mono text-sm ${colors[urgency]} countdown-glow`}>
      <span className="text-[var(--text-muted)] text-xs uppercase tracking-widest">auto-destruição em</span>
      <div className="flex gap-1">
        {[
          { val: timeLeft.days, label: "d" },
          { val: timeLeft.hours, label: "h" },
          { val: timeLeft.minutes, label: "m" },
          { val: timeLeft.seconds, label: "s" },
        ].map(({ val, label }) => (
          <span key={label} className="tabular-nums">
            {String(val).padStart(2, "0")}
            <span className="text-[var(--text-muted)]">{label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
