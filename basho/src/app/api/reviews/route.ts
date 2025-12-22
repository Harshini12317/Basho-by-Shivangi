import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const who = String(body.who || 'Anonymous')
    const email = String(body.email || '')
    const text = String(body.text || '')
    const rating = Number(body.rating || 5)

    // In a production app you'd persist this to a DB or send an email.
    console.log('New review received', { who, email, text, rating })

    return NextResponse.json({ ok: true, review: { who, email, text, rating } })
  } catch (err) {
    console.error('Review API error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
