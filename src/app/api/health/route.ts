import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()

  const checks: Record<string, string> = {
    api: 'ok',
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error: dbError } = await supabase
      .from('properties')
      .select('id')
      .limit(1)

    if (dbError) {
      throw new Error(`Database check failed: ${dbError.message}`)
    }

    checks.database = 'ok'

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks,
      responseTime: `${responseTime}ms`,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev',
    }, { status: 200 })
  } catch (error) {
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${responseTime}ms`,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev',
    }, { status: 503 })
  }
}
