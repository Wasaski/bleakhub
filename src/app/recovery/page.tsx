"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RecoveryPage() {
  const [username, setUsername] = useState("")
  const [recoveryCode, setRecoveryCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newCodes, setNewCodes] = useState<string[] | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, recoveryCode, newPassword }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setNewCodes(data.newRecoveryCodes)
    setLoading(false)
  }

  if (newCodes) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Conta recuperada</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Novos códigos de recuperação gerados. Salve-os.
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 mb-6">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
            Novos códigos
          </p>
          <div className="space-y-2">
            {newCodes.map((code, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-muted)]">{i + 1}.</span>
                <code className="font-mono text-sm text-[var(--accent)] tracking-wider">{code}</code>
              </div>
            ))}
          </div>
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
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">recuperar conta</h1>
        <p className="text-sm text-[var(--text-secondary)]">Use um de seus 3 códigos de recuperação.</p>
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
            required
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">código de recuperação</label>
          <input
            type="text"
            value={recoveryCode}
            onChange={e => setRecoveryCode(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 rounded text-sm font-mono tracking-wider"
            placeholder="XXXXXXXX"
            required
            maxLength={8}
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">nova senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
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
          {loading ? "recuperando..." : "recuperar conta"}
        </button>
      </form>

      <p className="text-center text-xs text-[var(--text-muted)] mt-6">
        <Link href="/login" className="text-[var(--text-secondary)] hover:text-white transition-colors">
          voltar ao login
        </Link>
      </p>
    </div>
  )
}
