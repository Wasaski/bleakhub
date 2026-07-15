import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 })

    const adminUser = await prisma.user.findUnique({ where: { id: user.userId } })
    if (!adminUser || adminUser.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { username, password, role } = await req.json()

    if (!username || !password) {
      return Response.json({ error: "Username and password required" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { username: username.toLowerCase() } })
    if (existing) {
      return Response.json({ error: "Username already exists" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const newUser = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        passwordHash,
        role: role || "user",
      },
    })

    return Response.json({ user: { id: newUser.id, username: newUser.username, role: newUser.role } })
  } catch (error) {
    console.error("Admin seed error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
