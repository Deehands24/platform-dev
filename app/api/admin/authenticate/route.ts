import { NextResponse } from 'next/server';
import { executeSQL } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Check if the admin exists
    const result = await executeSQL`
      SELECT * FROM admins 
      WHERE username = ${username} AND password = ${password}
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // In a real-world application, you would use a more secure authentication method
    // and generate a JWT token here instead of returning the admin object
    return NextResponse.json({
      authenticated: true,
      admin: {
        id: result[0].id,
        username: result[0].username,
      }
    });
  } catch (error) {
    console.error('Error authenticating admin:', error);
    return NextResponse.json(
      { error: 'An error occurred during authentication' },
      { status: 500 }
    );
  }
} 