import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse } from '@/presentation/utils/api-response.util';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Clear all auth cookies
    cookieStore.delete('auth_token');
    cookieStore.delete('auth_user');
    
    // Also try to clear with different path options to ensure they're removed
    const response = createSuccessResponse({ message: 'Logged out successfully' }, 200);
    
    // Set cookies to expire immediately
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('auth_user', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    // Even if there's an error, try to clear cookies
    const response = createSuccessResponse({ message: 'Logged out' }, 200);
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });
    response.cookies.set('auth_user', '', {
      httpOnly: false,
      maxAge: 0,
      path: '/',
    });
    return response;
  }
}


