import { NextResponse } from 'next/server';
import { 
  getAllDatabases, 
  createDatabase 
} from '@/lib/services/database-service';

export async function GET() {
  try {
    const databases = await getAllDatabases();
    return NextResponse.json(databases);
  } catch (error) {
    console.error('Error fetching databases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch databases' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Database name is required' },
        { status: 400 }
      );
    }
    
    const database = await createDatabase(name, description || '');
    return NextResponse.json(database);
  } catch (error) {
    console.error('Error creating database:', error);
    return NextResponse.json(
      { error: 'Failed to create database' },
      { status: 500 }
    );
  }
} 