import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const post = await prisma.post.findFirst({
    where: { OR: [{ slug: id }, { id }] },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true } },
      media: true,
      comments: {
        include: { user: { select: { id: true, username: true, displayName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!post) return Response.json({ error: "Post not found" }, { status: 404 })
  if (post.expiresAt < new Date()) return Response.json({ error: "Post has decayed" }, { status: 410 })
  if (post.visibility === "private") {
    const user = await getCurrentUser()
    if (!user || user.userId !== post.userId) {
      return Response.json({ error: "Private post" }, { status: 403 })
    }
  }

  return Response.json({ post })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 })

  const post = await prisma.post.findFirst({
    where: { OR: [{ slug: id }, { id }] },
  })

  if (!post) return Response.json({ error: "Post not found" }, { status: 404 })
  if (post.userId !== user.userId) return Response.json({ error: "Unauthorized" }, { status: 403 })

  await prisma.post.delete({ where: { id: post.id } })
  return Response.json({ ok: true })
}
