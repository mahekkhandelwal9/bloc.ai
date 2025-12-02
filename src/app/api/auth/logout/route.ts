import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: 'Logged out successfully' });

    // Clear the cookie
    response.cookies.delete('bloc_user_id');

    return response;
}
