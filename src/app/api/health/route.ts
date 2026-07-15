import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const hasDbUrl = !!process.env.DATABASE_URL
    const hasJwtSecret = !!process.env.JWT_SECRET

    if (!hasDbUrl) {
      return Response.json({ status: "error", message: "DATABASE_URL not set", hasDbUrl, hasJwtSecret })
    }

    const userCount = await prisma.user.count()
    return Response.json({ status: "ok", db: "connected", userCount, hasDbUrl, hasJwtSecret })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("Health check error:", msg)
    return Response.json({ status: "error", message: msg }, { status: 500 })
  }
}
