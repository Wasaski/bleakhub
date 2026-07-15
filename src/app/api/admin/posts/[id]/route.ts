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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 })

    const { id } = await params

    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 })

    await prisma.postMedia.deleteMany({ where: { postId: id } })
    await prisma.comment.deleteMany({ where: { postId: id } })
    await prisma.post.delete({ where: { id } })

    return Response.json({ ok: true, message: "Post deleted" })
  } catch (error) {
    console.error("Admin post delete error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 })

    const { id } = await params
    const { action } = await req.json()

    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 })

    if (action === "toggleVisibility") {
      const newVis = post.visibility === "public" ? "private" : "public"
      await prisma.post.update({ where: { id }, data: { visibility: newVis } })
      return Response.json({ ok: true, visibility: newVis })
    }

    if (action === "extend") {
      const newExpiry = new Date(post.expiresAt)
      newExpiry.setDate(newExpiry.getDate() + 10)
      await prisma.post.update({ where: { id }, data: { expiresAt: newExpiry } })
      return Response.json({ ok: true, expiresAt: newExpiry })
    }

    return Response.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Admin post action error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
