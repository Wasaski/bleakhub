import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signToken, generateRecoveryCodes } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return Response.json({ error: "Username and password required" }, { status: 400 })
  }

  if (username.length < 3 || username.length > 20) {
    return Response.json({ error: "Username must be 3-20 characters" }, { status: 400 })
  }

  if (password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { username: username.toLowerCase() } })
  if (existing) {
    return Response.json({ error: "Username already taken" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const recoveryCodes = generateRecoveryCodes()

  const user = await prisma.user.create({
    data: {
      username: username.toLowerCase(),
      passwordHash,
      recoveryCodes: {
        create: recoveryCodes.map(code => ({ code })),
      },
    },
  })

  const token = await signToken({ userId: user.id, username: user.username })

  const cookieStore = await cookies()
  cookieStore.set("bleakhub_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return Response.json({
    user: { id: user.id, username: user.username },
    recoveryCodes,
  })
}
