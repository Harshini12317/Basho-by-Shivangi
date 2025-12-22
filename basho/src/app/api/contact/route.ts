import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const name = (data.get('name') || '').toString()
    const email = (data.get('email') || '').toString()
    const message = (data.get('message') || '').toString()

    // Minimal handling: in a real app you'd persist or email this data.
    console.log('Contact form received:', { name, email, message })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact API error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
