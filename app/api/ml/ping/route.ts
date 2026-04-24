import { NextResponse } from 'next/server'

const ML_API_URL = process.env.ML_API_URL || 'https://anilsuthar2004-health-buddy-ml.hf.space'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const startedAt = performance.now()

  try {
    const response = await fetch(`${ML_API_URL}/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })

    const latencyMs = Math.round(performance.now() - startedAt)

    return NextResponse.json(
      {
        ok: response.ok,
        statusCode: response.status,
        latencyMs,
        checkedAt: new Date().toISOString(),
        target: `${ML_API_URL}/health`,
      },
      {
        status: response.ok ? 200 : 503,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    )
  } catch (error) {
    const latencyMs = Math.round(performance.now() - startedAt)
    const message = error instanceof Error ? error.message : 'Unknown ML ping error'

    return NextResponse.json(
      {
        ok: false,
        statusCode: 0,
        latencyMs,
        checkedAt: new Date().toISOString(),
        target: `${ML_API_URL}/health`,
        error: message,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    )
  }
}