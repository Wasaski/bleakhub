import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'bleakhub-fallback-secret')

export interface TokenPayload {
  userId: string
  username: string
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('bleakhub_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export function generateRecoveryCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 3; i++) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let j = 0; j < 8; j++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    codes.push(code)
  }
  return codes
}

export function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let slug = ''
  for (let i = 0; i < 10; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)]
  }
  return slug
}
