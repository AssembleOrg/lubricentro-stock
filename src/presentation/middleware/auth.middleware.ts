import { NextRequest } from 'next/server';
import { createErrorResponse } from '@/presentation/utils/api-response.util';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const adminUID = '81ebc211-7fa9-46b3-9315-771572c92939';

export async function verifyAuth(request: NextRequest): Promise<{ user: { email: string; uid: string } } | null> {
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
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    // Verify it's the admin user
    if (user.id !== adminUID) {
      return null;
    }

    return {
      user: {
        email: user.email!,
        uid: user.id,
      },
    };
  } catch {
    return null;
  }
}

export function requireAuth(request: NextRequest) {
  return async (): Promise<{ user: { email: string; uid: string } }> => {
    const auth = await verifyAuth(request);
    if (!auth) {
      throw new Error('Unauthorized');
    }
    return auth;
  };
}

