import { NextResponse } from 'next/server';

// GET /api/users - Get all users
export async function GET(request) {
  try {
    // TODO: Fetch users from database
    
    return NextResponse.json({
      users: [
        { id: '1', name: 'John Developer', email: 'john@example.com', role: 'Owner' },
        { id: '2', name: 'Alex Chen', email: 'alex@example.com', role: 'Member' },
        { id: '3', name: 'Jordan Smith', email: 'jordan@example.com', role: 'Member' }
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
