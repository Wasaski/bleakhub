import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) return null
  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } })
  if (!dbUser || dbUser.role !== "admin") return null
  return dbUser
}

export async function GET(_req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 })

    const now = new Date()

    const [totalUsers, totalPosts, activePosts, expiredPosts, totalComments, bannedUsers, recentPosts] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.post.count({ where: { expiresAt: { gt: now } } }),
      prisma.post.count({ where: { expiresAt: { lte: now } } }),
      prisma.comment.count(),
      prisma.user.count({ where: { banned: true } }),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { id: true, username: true, role: true } } },
      }),
    ])

    return Response.json({
      stats: { totalUsers, totalPosts, activePosts, expiredPosts, totalComments, bannedUsers },
      recentPosts,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
