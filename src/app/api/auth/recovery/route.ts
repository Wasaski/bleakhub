import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signToken, generateRecoveryCodes } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  const { username, recoveryCode, newPassword } = await req.json()

  if (!username || !recoveryCode || !newPassword) {
    return Response.json({ error: "All fields required" }, { status: 400 })
  }

  if (newPassword.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: { recoveryCodes: true },
  })

  if (!user) {
    return Response.json({ error: "Invalid recovery" }, { status: 401 })
  }

  const codeRecord = user.recoveryCodes.find(
    c => c.code === recoveryCode.toUpperCase() && !c.used
  )

  if (!codeRecord) {
    return Response.json({ error: "Invalid or used recovery code" }, { status: 401 })
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12)
  const newRecoveryCodes = generateRecoveryCodes()

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    }),
    prisma.recoveryCode.update({
      where: { id: codeRecord.id },
      data: { used: true },
    }),
    prisma.recoveryCode.deleteMany({ where: { userId: user.id } }),
    prisma.recoveryCode.createMany({
      data: newRecoveryCodes.map(code => ({ code, userId: user.id })),
    }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ])

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
    message: "Password recovered. Old recovery codes invalidated.",
    newRecoveryCodes,
  })
}
