import Link from "next/link"
import { CountdownTimer } from "./CountdownTimer"

interface Post {
  id: string
  slug: string
  title: string
  content: string
  visibility: string
  createdAt: string
  expiresAt: string
  user: {
    id: string
    username: string
    displayName?: string | null
  }
  _count?: {
    comments: number
  }
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/post/${post.slug}`}>
      <article className="card-hover rounded-lg p-4 bg-[var(--bg-card)] animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="text-[var(--text-muted)]">@</span>
            <Link
              href={`/profile/${post.user.id}`}
              className="hover:text-white transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {post.user.displayName || post.user.username}
            </Link>
            <span className="text-[var(--text-muted)]">·</span>
            <span>{new Date(post.createdAt).toLocaleDateString("pt-BR")}</span>
          </div>
          <CountdownTimer expiresAt={post.expiresAt} compact />
        </div>

        <h2 className="text-base font-semibold mb-2 text-[var(--text-primary)]">{post.title}</h2>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
          {post.content}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
          {post.visibility === "private" ? (
            <span className="text-xs text-[var(--text-muted)] font-mono">privado</span>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">público</span>
          )}
          {post._count && (
            <span className="text-xs text-[var(--text-muted)]">
              {post._count.comments} {post._count.comments === 1 ? "comentário" : "comentários"}
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}
