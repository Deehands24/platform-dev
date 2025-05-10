import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PUT(req: Request) {
  try {
    const { tableId, name, description } = await req.json();
    
    // Update the table entry in your Neon database
    const result = await sql`
      UPDATE tables 
      SET name = ${name}, description = ${description}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${tableId}
      RETURNING id, database_id, name, description, created_at, updated_at
    `;
    
    if (result.length === 0) {
      throw new Error('Failed to update table or table not found');
    }
    
    return NextResponse.json({ 
      status: 'success', 
      table: result[0] 
    });
  } catch (error: any) {
    console.error('Table update error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: error.message 
    }, { status: 500 });
  }
} 