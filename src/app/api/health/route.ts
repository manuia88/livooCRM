import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const startTime = performance.now()

  const checks: Record<string, string> = {
    api: 'healthy',
    database: 'unknown',
  }

  // Check database connection
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { error } = await supabase.from('properties').select('id').limit(1)

      checks.database = error ? 'degraded' : 'healthy'
    } else {
      checks.database = 'not_configured'
    }
  } catch {
    checks.database = 'unhealthy'
  }

  const responseTime = `${(performance.now() - startTime).toFixed(2)}ms`
  const allHealthy = Object.values(checks).every(
    (v) => v === 'healthy' || v === 'not_configured'
  )

  const status = allHealthy ? 'healthy' : 'degraded'
  const httpStatus = allHealthy ? 200 : 503

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      checks,
      responseTime,
      version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'dev',
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
    },
    { status: httpStatus }
  )
}
