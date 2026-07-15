"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface User {
  userId: string
  username: string
  role?: string
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(setUser).catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    window.location.href = "/"
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse-dark" />
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)] group-hover:text-white transition-colors">
            BleakHub
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link
                href="/post/new"
                className={`transition-colors hover:text-white ${pathname === "/post/new" ? "text-white" : "text-[var(--text-secondary)]"}`}
              >
                exposar
              </Link>
              <Link
                href="/dashboard"
                className={`transition-colors hover:text-white ${pathname === "/dashboard" ? "text-white" : "text-[var(--text-secondary)]"}`}
              >
                painel
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className={`transition-colors hover:text-white ${pathname === "/admin" ? "text-white" : "text-[var(--accent)]"}`}
                >
                  admin
                </Link>
              )}
              <Link
                href={`/profile/${user.userId}`}
                className={`transition-colors hover:text-white ${pathname?.startsWith("/profile") ? "text-white" : "text-[var(--text-secondary)]"}`}
              >
                {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              >
                sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`transition-colors hover:text-white ${pathname === "/login" ? "text-white" : "text-[var(--text-secondary)]"}`}
              >
                entrar
              </Link>
              <Link
                href="/register"
                className="px-3 py-1 bg-[var(--accent-dim)] text-[var(--text-primary)] rounded hover:bg-[var(--accent)] transition-colors"
              >
                criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
