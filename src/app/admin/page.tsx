"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CountdownTimer } from "@/components/CountdownTimer"

interface Stats {
  totalUsers: number
  totalPosts: number
  activePosts: number
  expiredPosts: number
  totalComments: number
  bannedUsers: number
}

interface User {
  id: string
  username: string
  displayName?: string | null
  role: string
  banned: boolean
  createdAt: string
  _count: { posts: number; comments: number }
}

interface Post {
  id: string
  slug: string
  title: string
  content: string
  visibility: string
  createdAt: string
  expiresAt: string
  user: { id: string; username: string; role: string }
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [tab, setTab] = useState<"stats" | "users" | "posts">("stats")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(u => fetch(`/api/admin/stats`).then(r => { if (!r.ok) throw new Error(); return r.json() }))
      .then(d => { setStats(d.stats); setPosts(d.recentPosts || []) })
      .catch(() => { setError("Acesso negado. Apenas administradores."); setLoading(false) })
      .finally(() => setLoading(false))
  }, [])

  const loadUsers = async (q = "") => {
    const res = await fetch(`/api/admin/users?search=${q}`)
    if (res.ok) {
      const d = await res.json()
      setUsers(d.users)
    }
  }

  const userAction = async (userId: string, action: string, role?: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, role }),
    })
    if (res.ok) loadUsers(search)
  }

  const postAction = async (postId: string, action: string) => {
    if (action === "delete") {
      if (!confirm("Excluir este post permanentemente?")) return
      await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" })
      setPosts(prev => prev.filter(p => p.id !== postId))
    } else {
      await fetch(`/api/admin/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
    }
  }

  const handleTab = (t: "stats" | "users" | "posts") => {
    setTab(t)
    if (t === "users") loadUsers(search)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="h-8 w-48 bg-[var(--bg-card)] rounded animate-pulse mb-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-[var(--accent)] text-sm mb-4">{error}</p>
        <Link href="/" className="text-xs text-[var(--text-secondary)] hover:text-white">voltar</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">centro de administração</h1>
          <p className="text-sm text-[var(--text-secondary)]">controle total da plataforma</p>
        </div>
        <Link href="/dashboard" className="text-xs text-[var(--text-muted)] hover:text-white transition-colors">
          voltar ao painel
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {(["stats", "users", "posts"] as const).map(t => (
          <button
            key={t}
            onClick={() => handleTab(t)}
            className={`px-4 py-1.5 text-xs rounded transition-colors ${
              tab === t
                ? "bg-[var(--accent-dim)] text-[var(--text-primary)]"
                : "border border-[var(--border)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            {t === "stats" ? "estatísticas" : t === "users" ? "usuários" : "posts"}
          </button>
        ))}
      </div>

      {tab === "stats" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "usuários", value: stats.totalUsers },
            { label: "posts ativos", value: stats.activePosts },
            { label: "posts expirados", value: stats.expiredPosts },
            { label: "total posts", value: stats.totalPosts },
            { label: "comentários", value: stats.totalComments },
            { label: "banidos", value: stats.bannedUsers },
          ].map(s => (
            <div key={s.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div>
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); loadUsers(e.target.value) }}
              className="w-full px-3 py-2 rounded text-sm"
              placeholder="buscar usuário..."
            />
          </div>
          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm">Nenhum usuário encontrado.</p>
            ) : (
              users.map(u => (
                <div key={u.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">@{u.username}</span>
                      {u.role === "admin" && <span className="text-[10px] px-1.5 py-0.5 bg-[var(--accent-dim)] text-[var(--text-primary)] rounded">admin</span>}
                      {u.banned && <span className="text-[10px] px-1.5 py-0.5 bg-red-900 text-red-300 rounded">banido</span>}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {u._count.posts} posts · {u._count.comments} comentários · desde {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${u.id}`} className="text-[10px] text-[var(--text-muted)] hover:text-white px-2 py-1">perfil</Link>
                    {u.role !== "admin" && (
                      <>
                        {!u.banned ? (
                          <button onClick={() => userAction(u.id, "ban")} className="text-[10px] text-red-500 hover:text-red-400 px-2 py-1">banir</button>
                        ) : (
                          <button onClick={() => userAction(u.id, "unban")} className="text-[10px] text-green-500 hover:text-green-400 px-2 py-1">desbanir</button>
                        )}
                        <button onClick={() => userAction(u.id, "setRole", "admin")} className="text-[10px] text-[var(--text-muted)] hover:text-white px-2 py-1">promover</button>
                        <button onClick={() => userAction(u.id, "delete")} className="text-[10px] text-red-700 hover:text-red-500 px-2 py-1">excluir</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "posts" && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">Nenhum post.</p>
          ) : (
            posts.map(p => (
              <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Link href={`/post/${p.slug}`} className="text-sm font-semibold text-[var(--text-primary)] hover:text-white">{p.title}</Link>
                    <span className="text-xs text-[var(--text-muted)]">@{p.user.username}</span>
                    <span className="text-xs text-[var(--text-muted)]">{p.visibility}</span>
                  </div>
                  <CountdownTimer expiresAt={p.expiresAt} compact />
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">{p.content}</p>
                <div className="flex gap-2">
                  <button onClick={() => postAction(p.id, "toggleVisibility")} className="text-[10px] text-[var(--text-muted)] hover:text-white px-2 py-1 border border-[var(--border)] rounded">
                    {p.visibility === "public" ? "tornar privado" : "tornar público"}
                  </button>
                  <button onClick={() => postAction(p.id, "extend")} className="text-[10px] text-[var(--text-muted)] hover:text-white px-2 py-1 border border-[var(--border)] rounded">
                    +10 dias
                  </button>
                  <button onClick={() => postAction(p.id, "delete")} className="text-[10px] text-red-500 hover:text-red-400 px-2 py-1 border border-red-900 rounded">
                    excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
