import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return Response.json({ error: "Username and password required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  })

  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const token = await signToken({ userId: user.id, username: user.username })

  const cookieStore = await cookies()
  cookieStore.set("bleakhub_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return Response.json({ user: { id: user.id, username: user.username } })
}
