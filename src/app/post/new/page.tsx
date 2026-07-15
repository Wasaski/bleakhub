"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NewPostPage() {
  const [user, setUser] = useState<{ userId: string } | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [visibility, setVisibility] = useState("public")
  const [files, setFiles] = useState<FileList | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setUser)
      .catch(() => router.push("/login"))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError("")
    setLoading(true)

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, visibility }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("postId", data.post.id)
        await fetch("/api/upload", { method: "POST", body: fd })
      }
    }

    router.push(`/post/${data.post.slug}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">nova exposição</h1>
        <p className="text-sm text-[var(--text-secondary)]">Tudo que você postar será apagado em 10 dias.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-[var(--accent)] bg-[var(--bg-card)] border border-[var(--accent-dim)] rounded p-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">título</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded text-sm"
            placeholder="o que está sendo exposto"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">conteúdo</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-3 py-2 rounded text-sm min-h-[200px] resize-y"
            placeholder="descreva em detalhes..."
            required
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">visibilidade</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={`flex-1 py-2 text-xs rounded border transition-colors ${
                visibility === "public"
                  ? "border-[var(--accent-dim)] text-[var(--text-primary)] bg-[var(--bg-card)]"
                  : "border-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              público — todos veem
            </button>
            <button
              type="button"
              onClick={() => setVisibility("private")}
              className={`flex-1 py-2 text-xs rounded border transition-colors ${
                visibility === "private"
                  ? "border-[var(--accent-dim)] text-[var(--text-primary)] bg-[var(--bg-card)]"
                  : "border-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              privado — só você
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">arquivos (opcional)</label>
          <input
            type="file"
            multiple
            onChange={e => setFiles(e.target.files)}
            className="w-full text-xs text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[var(--bg-card)] file:text-[var(--text-secondary)] file:border file:border-[var(--border)] hover:file:bg-[var(--bg-hover)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !user}
          className="w-full py-2.5 bg-[var(--accent-dim)] text-sm text-[var(--text-primary)] rounded hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
        >
          {loading ? "exposto..." : "publicar exposição"}
        </button>
      </form>
    </div>
  )
}
