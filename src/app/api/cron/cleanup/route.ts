import { NextRequest } from "next/server"
import { cleanupExpiredContent } from "@/lib/cleanup"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await cleanupExpiredContent()
  return Response.json({ cleaned: result, timestamp: new Date().toISOString() })
}

export async function POST(req: NextRequest) {
  return GET(req)
}
