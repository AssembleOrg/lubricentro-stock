import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/presentation/utils/api-response.util';
import { handleApiError } from '@/presentation/utils/request-handler.util';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Try to get token from cookie first, then from header
    const cookieStore = await cookies();
    let token = cookieStore.get('auth_token')?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return createErrorResponse('Missing or invalid authorization', 401);
    }

    // Create Supabase client with the token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get user from token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return createErrorResponse('Invalid or expired token', 401);
    }

    // Verify it's the admin user
    const adminUID = '81ebc211-7fa9-46b3-9315-771572c92939';
    if (user.id !== adminUID) {
      return createErrorResponse('Unauthorized access', 403);
    }

    return createSuccessResponse(
      {
        user: {
          email: user.email!,
          uid: user.id,
        },
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

