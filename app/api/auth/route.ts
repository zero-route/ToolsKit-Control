import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { password } = body

  if (password !== process.env.ADMIN_ACCESS_PASSWORD) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}
