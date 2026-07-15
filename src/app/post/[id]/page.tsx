"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CountdownTimer } from "@/components/CountdownTimer"

interface Post {
  id: string
  slug: string
  title: string
  content: string
  visibility: string
  createdAt: string
  expiresAt: string
  user: { id: string; username: string; displayName?: string | null; avatarUrl?: string | null; bio?: string | null }
  media: { id: string; fileUrl: string; fileType: string; fileName: string }[]
  comments: {
    id: string
    content: string
    createdAt: string
    user: { id: string; username: string; displayName?: string | null }
  }[]
}

export default function PostPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ userId: string } | null>(null)

  useEffect(() => {
    fetch(`/api/posts/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(d => setPost(d.post))
      .catch(() => setError("Post não encontrado ou já expirou."))
      .finally(() => setLoading(false))

    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(setCurrentUser)
      .catch(() => {})
  }, [params.id])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !post) return
    setCommentLoading(true)

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id, content: comment }),
    })

    if (res.ok) {
      const data = await res.json()
      setPost(prev => prev ? { ...prev, comments: [data.comment, ...prev.comments] } : prev)
      setComment("")
    }
    setCommentLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="h-8 w-64 bg-[var(--bg-card)] rounded animate-pulse mb-4" />
        <div className="h-4 w-32 bg-[var(--bg-card)] rounded animate-pulse mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-[var(--bg-card)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-[var(--text-muted)] text-sm mb-4">{error}</p>
        <Link href="/" className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors">
          voltar ao início
        </Link>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in">
      <div className="mb-2">
        <CountdownTimer expiresAt={post.expiresAt} />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <Link href={`/profile/${post.user.id}`} className="hover:text-white transition-colors">
            @{post.user.displayName || post.user.username}
          </Link>
          <span className="text-[var(--text-muted)]">·</span>
          <span>{new Date(post.createdAt).toLocaleDateString("pt-BR")}</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-xs">{post.visibility === "private" ? "privado" : "público"}</span>
        </div>
      </div>

      <article className="prose prose-invert max-w-none mb-8">
        <div className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      {post.media.length > 0 && (
        <div className="mb-8 space-y-4">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">anexos</p>
          {post.media.map(m => (
            <div key={m.id} className="border border-[var(--border)] rounded overflow-hidden">
              {m.fileType.startsWith("image/") ? (
                <img src={m.fileUrl} alt={m.fileName} className="max-w-full" />
              ) : (
                <a href={m.fileUrl} download={m.fileName} className="block p-3 text-xs text-[var(--text-secondary)] hover:text-white transition-colors">
                  {m.fileName}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-[var(--border)] pt-8">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-4">
          {post.comments.length} {post.comments.length === 1 ? "comentário" : "comentários"}
        </p>

        {currentUser && (
          <form onSubmit={handleComment} className="mb-6">
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm min-h-[80px] resize-y mb-2"
              placeholder="comentar..."
            />
            <button
              type="submit"
              disabled={commentLoading || !comment.trim()}
              className="px-4 py-1.5 bg-[var(--accent-dim)] text-xs text-[var(--text-primary)] rounded hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
            >
              {commentLoading ? "enviando..." : "comentar"}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {post.comments.map(c => (
            <div key={c.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Link href={`/profile/${c.user.id}`} className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors">
                  @{c.user.displayName || c.user.username}
                </Link>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="text-sm text-[var(--text-primary)]">{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
