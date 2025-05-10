import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { tableId, name, type, isPrimaryKey, isRequired, defaultValue, validationRules } = await req.json();
    
    // Create a new column entry in your Neon database
    const result = await sql`
      INSERT INTO columns (table_id, name, type, is_primary_key, is_required, default_value, validation_rules)
      VALUES (${tableId}, ${name}, ${type}, ${isPrimaryKey}, ${isRequired}, ${defaultValue}, ${validationRules})
      RETURNING id, table_id, name, type, is_primary_key, is_required, default_value, validation_rules, created_at, updated_at
    `;
    
    if (result.length === 0) {
      throw new Error('Failed to create column');
    }
    
    return NextResponse.json({ 
      status: 'success', 
      column: result[0] 
    });
  } catch (error: any) {
    console.error('Column creation error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: error.message 
    }, { status: 500 });
  }
} 