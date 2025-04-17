import { NextResponse } from 'next/server';
import { getNeonConnection } from '@/lib/db';

export async function GET() {
  try {
    const sql = getNeonConnection();
    const result = await sql`SELECT 1 as test`;
    
    return NextResponse.json({
      message: 'Database connection successful',
      result,
      success: true
    });
  } catch (error) {
    console.error('Error testing database connection:', error);
    
    return NextResponse.json({
      message: 'Error testing database connection',
      error: (error as Error).message,
      success: false
    }, { status: 500 });
  }
} 