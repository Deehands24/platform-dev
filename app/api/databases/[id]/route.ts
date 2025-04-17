import { NextResponse } from 'next/server';
import { 
  getDatabaseById, 
  updateDatabase, 
  deleteDatabase 
} from '@/lib/services/database-service';

interface RequestParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RequestParams) {
  try {
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid database ID' },
        { status: 400 }
      );
    }
    
    const database = await getDatabaseById(id);
    
    if (!database) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(database);
  } catch (error) {
    console.error(`Error fetching database with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch database' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RequestParams) {
  try {
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid database ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Database name is required' },
        { status: 400 }
      );
    }
    
    const database = await updateDatabase(id, name, description || '');
    return NextResponse.json(database);
  } catch (error) {
    console.error(`Error updating database with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update database' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RequestParams) {
  try {
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid database ID' },
        { status: 400 }
      );
    }
    
    const success = await deleteDatabase(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting database with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete database' },
      { status: 500 }
    );
  }
} 