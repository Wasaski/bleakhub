"use client"

import { useEffect, useState } from "react"
import { PostCard } from "@/components/PostCard"
import Link from "next/link"

interface Post {
  id: string
  slug: string
  title: string
  content: string
  visibility: string
  createdAt: string
  expiresAt: string
  user: { id: string; username: string; displayName?: string | null }
  _count?: { comments: number }
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/posts")
      .then(r => r.json())
      .then(d => setPosts(d.posts || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-[var(--text-primary)]">
          Bleak<span className="text-[var(--accent)]">Hub</span>
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
          Anonymous exposure. Every post carries a countdown.
          <br />
          When time runs out, everything decays. Nothing remains.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/register"
            className="px-5 py-2 bg-[var(--accent-dim)] text-sm text-[var(--text-primary)] rounded hover:bg-[var(--accent)] transition-colors"
          >
            criar conta anônima
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 border border-[var(--border)] text-sm text-[var(--text-secondary)] rounded hover:border-[var(--border-light)] hover:text-[var(--text-primary)] transition-colors"
          >
            entrar
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] animate-pulse" />
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--text-muted)] text-sm">Nada foi exposto ainda.</p>
            <p className="text-[var(--text-muted)] text-xs mt-2">O silêncio não dura para sempre.</p>
          </div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}
