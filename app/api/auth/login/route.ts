import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/presentation/utils/api-response.util';
import { handleApiError } from '@/presentation/utils/request-handler.util';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return createErrorResponse(error.message, 401);
    }

    if (!data.user || !data.session) {
      return createErrorResponse('Authentication failed', 401);
    }

    // Verify it's the admin user
    const adminUID = '81ebc211-7fa9-46b3-9315-771572c92939';
    if (data.user.id !== adminUID) {
      await supabase.auth.signOut();
      return createErrorResponse('Unauthorized access', 403);
    }

    // Set cookie with token
    const cookieStore = await cookies();
    cookieStore.set('auth_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    cookieStore.set('auth_user', JSON.stringify({
      email: data.user.email!,
      uid: data.user.id,
    }), {
      httpOnly: false, // Needs to be accessible from client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Return user info and session token
    const response = createSuccessResponse(
      {
        user: {
          email: data.user.email!,
          uid: data.user.id,
        },
        token: data.session.access_token,
      },
      200
    );

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

