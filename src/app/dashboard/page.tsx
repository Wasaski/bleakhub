"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CountdownTimer } from "@/components/CountdownTimer"

interface User {
  userId: string
  username: string
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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(u => {
        setUser(u)
        return fetch(`/api/profile/${u.userId}`)
      })
      .then(r => r.json())
      .then(d => setPosts(d.posts || []))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false))
  }, [router])

  const handleDelete = async (slug: string) => {
    if (!confirm("Excluir este post permanentemente?")) return
    await fetch(`/api/posts/${slug}`, { method: "DELETE" })
    setPosts(prev => prev.filter(p => p.slug !== slug))
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="h-8 w-48 bg-[var(--bg-card)] rounded animate-pulse mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 bg-[var(--bg-card)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">painel</h1>
          <p className="text-sm text-[var(--text-secondary)]">@{user?.username}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/profile/${user?.userId}`}
            className="px-3 py-1.5 border border-[var(--border)] text-xs text-[var(--text-secondary)] rounded hover:border-[var(--border-light)] hover:text-white transition-colors"
          >
            ver perfil
          </Link>
          <Link
            href="/post/new"
            className="px-3 py-1.5 bg-[var(--accent-dim)] text-xs text-[var(--text-primary)] rounded hover:bg-[var(--accent)] transition-colors"
          >
            novo post
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--text-muted)] text-sm">Você ainda não expôs nada.</p>
            <Link
              href="/post/new"
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors mt-2 inline-block"
            >
              fazer primeira exposição
            </Link>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="card-hover rounded-lg p-4 bg-[var(--bg-card)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Link href={`/post/${post.slug}`} className="text-sm font-semibold text-[var(--text-primary)] hover:text-white transition-colors">
                    {post.title}
                  </Link>
                  <span className="text-xs text-[var(--text-muted)]">
                    {post.visibility === "private" ? "privado" : "público"}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(post.slug)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  excluir
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">{post.content}</p>
              <div className="flex items-center justify-between">
                <CountdownTimer expiresAt={post.expiresAt} compact />
                <span className="text-xs text-[var(--text-muted)]">
                  {post._count.comments} {post._count.comments === 1 ? "comentário" : "comentários"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
