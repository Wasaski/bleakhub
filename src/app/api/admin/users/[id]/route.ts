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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 })

    const { id } = await params
    const { action, role } = await req.json()

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) return Response.json({ error: "User not found" }, { status: 404 })
    if (target.id === admin.id) return Response.json({ error: "Cannot modify yourself" }, { status: 400 })

    if (action === "ban") {
      await prisma.user.update({ where: { id }, data: { banned: true } })
      return Response.json({ ok: true, message: "User banned" })
    }

    if (action === "unban") {
      await prisma.user.update({ where: { id }, data: { banned: false } })
      return Response.json({ ok: true, message: "User unbanned" })
    }

    if (action === "setRole" && role) {
      if (!["user", "admin"].includes(role)) {
        return Response.json({ error: "Invalid role" }, { status: 400 })
      }
      await prisma.user.update({ where: { id }, data: { role } })
      return Response.json({ ok: true, message: `Role set to ${role}` })
    }

    if (action === "delete") {
      await prisma.comment.deleteMany({ where: { userId: id } })
      await prisma.postMedia.deleteMany({ where: { post: { userId: id } } })
      await prisma.post.deleteMany({ where: { userId: id } })
      await prisma.recoveryCode.deleteMany({ where: { userId: id } })
      await prisma.session.deleteMany({ where: { userId: id } })
      await prisma.user.delete({ where: { id } })
      return Response.json({ ok: true, message: "User deleted" })
    }

    return Response.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Admin user action error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
