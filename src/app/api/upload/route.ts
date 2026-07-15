import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const postId = formData.get("postId") as string | null

  if (!file || !postId) {
    return Response.json({ error: "File and postId required" }, { status: 400 })
  }

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post || post.userId !== user.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 403 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString("base64")
  const dataUrl = `data:${file.type};base64,${base64}`

  const media = await prisma.postMedia.create({
    data: {
      postId,
      fileUrl: dataUrl,
      fileType: file.type,
      fileName: file.name,
    },
  })

  return Response.json({ media }, { status: 201 })
}
