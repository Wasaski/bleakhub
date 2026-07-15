"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/register", {
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

    setRecoveryCodes(data.recoveryCodes)
    setLoading(false)
  }

  if (recoveryCodes) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-3 h-3 rounded-full bg-[var(--accent)] mx-auto mb-4 animate-pulse-dark" />
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Conta criada</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Salve seus códigos de recuperação. São sua única chance de recuperar a conta.
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 mb-6">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
            Códigos de recuperação
          </p>
          <div className="space-y-2">
            {recoveryCodes.map((code, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-muted)]">{i + 1}.</span>
                <code className="font-mono text-sm text-[var(--accent)] tracking-wider">{code}</code>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-4">
            Estes códigos são descartados após uso. Se você perder sua senha, estes são seus únicos caminhos de volta.
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-2 bg-[var(--accent-dim)] text-sm text-[var(--text-primary)] rounded hover:bg-[var(--accent)] transition-colors"
        >
          entrar no painel
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">criar conta anônima</h1>
        <p className="text-sm text-[var(--text-secondary)]">Sem email. Sem rastros. Apenas username e senha.</p>
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
            placeholder="nome anônimo"
            required
            minLength={3}
            maxLength={20}
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded text-sm"
            placeholder="mínimo 6 caracteres"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-[var(--accent-dim)] text-sm text-[var(--text-primary)] rounded hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
        >
          {loading ? "criando..." : "criar conta"}
        </button>
      </form>

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        já tem conta?{" "}
        <Link href="/login" className="text-[var(--text-secondary)] hover:text-white transition-colors">
          entrar
        </Link>
      </p>
    </div>
  )
}
