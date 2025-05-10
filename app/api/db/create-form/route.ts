import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { databaseId, name, description, isActive } = await req.json();
    
    // Create a new form entry in your Neon database
    const result = await sql`
      INSERT INTO forms (database_id, name, description, is_active)
      VALUES (${databaseId}, ${name}, ${description}, ${isActive})
      RETURNING id, database_id, name, description, is_active, created_at, updated_at
    `;
    
    if (result.length === 0) {
      throw new Error('Failed to create form');
    }
    
    return NextResponse.json({ 
      status: 'success', 
      form: result[0] 
    });
  } catch (error: any) {
    console.error('Form creation error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: error.message 
    }, { status: 500 });
  }
} 