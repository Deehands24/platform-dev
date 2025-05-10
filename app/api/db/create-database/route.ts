import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();
    
    // Create a new database entry in your Neon database
    const result = await sql`
      INSERT INTO databases (name, description)
      VALUES (${name}, ${description})
      RETURNING id, name, description, created_at, updated_at
    `;
    
    if (result.length === 0) {
      throw new Error('Failed to create database');
    }
    
    return NextResponse.json({ 
      status: 'success', 
      database: result[0] 
    });
  } catch (error: any) {
    console.error('Database creation error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: error.message 
    }, { status: 500 });
  }
} 