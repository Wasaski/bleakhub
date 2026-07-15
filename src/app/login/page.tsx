"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">entrar</h1>
        <p className="text-sm text-[var(--text-secondary)]">Acesse sua conta anônima.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-[var(--accent)] bg-[var(--bg-card)] border border-[var(--accent-dim)] rounded p-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-3 py-2 rounded text-sm"
            placeholder="seu username"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded text-sm"
            placeholder="sua senha"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-[var(--accent-dim)] text-sm text-[var(--text-primary)] rounded hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
        >
          {loading ? "entrando..." : "entrar"}
        </button>
      </form>

      <div className="text-center mt-6 space-y-2">
        <p className="text-xs text-[var(--text-muted)]">
          esqueceu a senha?{" "}
          <Link href="/recovery" className="text-[var(--text-secondary)] hover:text-white transition-colors">
            recuperar com código
          </Link>
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          não tem conta?{" "}
          <Link href="/register" className="text-[var(--text-secondary)] hover:text-white transition-colors">
            criar
          </Link>
        </p>
      </div>
    </div>
  )
}
