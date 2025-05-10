import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function DELETE(req: Request) {
  try {
    const { tableId } = await req.json();
    
    // Delete the table entry from your Neon database
    const result = await sql`
      DELETE FROM tables 
      WHERE id = ${tableId}
      RETURNING id
    `;
    
    if (result.length === 0) {
      throw new Error('Failed to delete table or table not found');
    }
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Table deleted successfully'
    });
  } catch (error: any) {
    console.error('Table deletion error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: error.message 
    }, { status: 500 });
  }
} 