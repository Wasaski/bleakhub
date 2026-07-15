"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { PostCard } from "@/components/PostCard"
import { CountdownTimer } from "@/components/CountdownTimer"

interface UserProfile {
  id: string
  username: string
  displayName?: string | null
  avatarUrl?: string | null
  bio?: string | null
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
  _count: { comments: number }
}

export default function ProfilePage() {
  const params = useParams()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetch(`/api/profile/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(d => {
        setUser(d.user)
        setPosts(d.posts || [])
        setDisplayName(d.user.displayName || "")
        setBio(d.user.bio || "")
      })
      .catch(() => setError("Usuário não encontrado."))
      .finally(() => setLoading(false))

    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(u => {
        if (u && u.userId === params.id) setIsOwner(true)
      })
      .catch(() => {})
  }, [params.id])

  const handleSave = async () => {
    const res = await fetch(`/api/profile/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio }),
    })
    if (res.ok) {
      const data = await res.json()
      setUser(prev => prev ? { ...prev, ...data.user } : prev)
      setEditing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="h-20 w-full bg-[var(--bg-card)] rounded animate-pulse mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 bg-[var(--bg-card)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-[var(--text-muted)] text-sm mb-4">{error}</p>
        <Link href="/" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors">
          voltar ao início
        </Link>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              {user.displayName || user.username}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">@{user.username}</p>
          </div>
          {isOwner && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-[var(--text-muted)] hover:text-white transition-colors border border-[var(--border)] px-3 py-1 rounded"
            >
              editar perfil
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm"
              placeholder="nome de exibição"
            />
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm min-h-[60px] resize-y"
              placeholder="bio..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-[var(--accent-dim)] text-xs text-[var(--text-primary)] rounded hover:bg-[var(--accent)] transition-colors"
              >
                salvar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 text-xs text-[var(--text-muted)] hover:text-white transition-colors"
              >
                cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            {user.bio && (
              <p className="text-sm text-[var(--text-secondary)] mb-4">{user.bio}</p>
            )}
            <div className="flex gap-4 text-xs text-[var(--text-muted)]">
              <span>{user._count.posts} posts</span>
              <span>{user._count.comments} comentários</span>
              <span>membro desde {new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
          </>
        )}
      </div>

      <div>
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-4">
          exposições públicas
        </p>
        {posts.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm">Nenhuma exposição pública.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={{ ...post, user: { id: user.id, username: user.username, displayName: user.displayName } }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
