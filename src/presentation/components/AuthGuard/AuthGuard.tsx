'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Loader, Center } from '@mantine/core';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, checkAuth, initialize } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize from cookies first (only user, not token)
    initialize();

    const verifyAuth = async () => {
      const authenticated = await checkAuth();
      if (!authenticated) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };

    // Verify auth immediately - server will read httpOnly cookies
    verifyAuth();
  }, [checkAuth, initialize, router]);

  // Intercept 401 responses
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        useAuthStore.getState().logout();
        router.push('/login');
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);

  if (loading || !isAuthenticated) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return <>{children}</>;
}

