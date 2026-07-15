import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, generateSlug } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 20
    const offset = (page - 1) * limit

    const now = new Date()

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { visibility: "public", expiresAt: { gt: now } },
        include: {
          user: { select: { id: true, username: true, displayName: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.post.count({ where: { visibility: "public", expiresAt: { gt: now } } }),
    ])

    return Response.json({ posts, total, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error("Posts GET error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 })

    const { title, content, visibility } = await req.json()

    if (!title || !content) {
      return Response.json({ error: "Title and content required" }, { status: 400 })
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 10)

    const slug = generateSlug()

    const post = await prisma.post.create({
      data: {
        userId: user.userId,
        title,
        content,
        slug,
        visibility: visibility === "private" ? "private" : "public",
        expiresAt,
      },
      include: {
        user: { select: { id: true, username: true, displayName: true } },
      },
    })

    return Response.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Posts POST error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
