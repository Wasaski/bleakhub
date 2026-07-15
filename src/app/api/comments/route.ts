import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 })

  const { postId, content } = await req.json()

  if (!postId || !content) {
    return Response.json({ error: "PostId and content required" }, { status: 400 })
  }

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 })

  const expiresAt = post.expiresAt

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: user.userId,
      content,
      expiresAt,
    },
    include: { user: { select: { id: true, username: true, displayName: true } } },
  })

  return Response.json({ comment }, { status: 201 })
}
