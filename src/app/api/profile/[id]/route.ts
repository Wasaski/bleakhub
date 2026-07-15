import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: { select: { posts: true, comments: true } },
    },
  })

  if (!user) return Response.json({ error: "User not found" }, { status: 404 })

  const now = new Date()
  const posts = await prisma.post.findMany({
    where: { userId: id, visibility: "public", expiresAt: { gt: now } },
    include: { _count: { select: { comments: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return Response.json({ user, posts })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.userId !== id) {
    return Response.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { displayName, bio, avatarUrl } = await req.json()

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
    select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true },
  })

  return Response.json({ user: updated })
}
