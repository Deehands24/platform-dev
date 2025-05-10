import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { databaseId, name, description } = await req.json();
    
    // Create a new table entry in your Neon database
    const result = await sql`
      INSERT INTO tables (database_id, name, description)
      VALUES (${databaseId}, ${name}, ${description})
      RETURNING id, database_id, name, description, created_at, updated_at
    `;
    
    if (result.length === 0) {
      throw new Error('Failed to create table');
    }
    
    return NextResponse.json({ 
      status: 'success', 
      table: result[0] 
    });
  } catch (error: any) {
    console.error('Table creation error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: error.message 
    }, { status: 500 });
  }
} 