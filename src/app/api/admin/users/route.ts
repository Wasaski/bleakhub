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

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const limit = 30
    const offset = (page - 1) * limit

    const where = search ? { username: { contains: search, mode: "insensitive" as const } } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          displayName: true,
          role: true,
          banned: true,
          createdAt: true,
          _count: { select: { posts: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return Response.json({ users, total, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error("Admin users error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
