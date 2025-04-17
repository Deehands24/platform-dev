import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    
    return NextResponse.json({
      message: 'Database initialized successfully',
      success: true
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    
    return NextResponse.json({
      message: 'Error initializing database',
      error: (error as Error).message,
      success: false
    }, { status: 500 });
  }
} 