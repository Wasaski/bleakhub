import { prisma } from "./prisma"

export async function cleanupExpiredContent() {
  const now = new Date()

  const [deletedPosts, deletedComments, deletedSessions, deletedCodes] = await Promise.all([
    prisma.postMedia.deleteMany({
      where: { post: { expiresAt: { lte: now } } },
    }),
    prisma.comment.deleteMany({
      where: { expiresAt: { lte: now } },
    }),
    prisma.post.deleteMany({
      where: { expiresAt: { lte: now } },
    }),
    prisma.session.deleteMany({
      where: { expiresAt: { lte: now } },
    }),
  ])

  return {
    posts: deletedPosts.count,
    comments: deletedComments.count,
    media: deletedPosts.count,
    sessions: deletedSessions.count,
  }
}
