import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    // Test query
    const result = await sql`SELECT 1`;
    console.log("DB URL:", process.env.DATABASE_URL); // Check server logs
    return NextResponse.json({ status: 'connected', result });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}
