'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Image,
  Box,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
      password: (value) => (value.length > 0 ? null : 'La contraseña es requerida'),
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check if already authenticated
    checkAuth().then((authenticated) => {
      if (authenticated) {
        router.replace('/');
      }
    });
  }, [mounted, checkAuth, router]);

  // Redirect when authenticated (fallback if handleSubmit doesn't redirect)
  useEffect(() => {
    if (isAuthenticated && mounted) {
      // Use window.location for full page reload to ensure cookies are read
      window.location.href = '/';
    }
  }, [isAuthenticated, mounted]);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      
      // Show success notification
      notifications.show({
        title: 'Éxito',
        message: 'Sesión iniciada correctamente',
        color: 'green',
      });
      
      // Wait a moment for httpOnly cookies to be set by server
      // Then redirect with full page reload
      setTimeout(() => {
        window.location.href = '/';
      }, 300);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al iniciar sesión',
        color: 'red',
      });
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Text>Cargando...</Text>
      </Center>
    );
  }

  if (isAuthenticated) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Text>Redirigiendo...</Text>
      </Center>
    );
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Container size="xs" style={{ width: '100%', maxWidth: '450px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ width: '100%' }}
        >
          <Paper
            shadow="xl"
            p="xl"
            radius="lg"
            withBorder
            style={{
              background: 'white',
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            }}
          >
            <Stack gap="xl">
              <Box ta="center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Image
                    src="/lubrizen.png"
                    alt="Lubrizen Logo"
                    h={120}
                    w="auto"
                    fit="contain"
                    style={{ margin: '0 auto 24px' }}
                  />
                </motion.div>
                <Title order={2} ta="center" c="green.6" fw={700} size="h1">
                  Iniciar Sesión
                </Title>
                <Text c="dimmed" ta="center" size="sm" mt="xs" mb="lg">
                  Ingrese sus credenciales para acceder
                </Text>
              </Box>

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <TextInput
                      label="Email"
                      placeholder="admin@lubricentro.com"
                      required
                      size="md"
                      radius="md"
                      {...form.getInputProps('email')}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <PasswordInput
                      label="Contraseña"
                      placeholder="Ingrese su contraseña"
                      required
                      size="md"
                      radius="md"
                      {...form.getInputProps('password')}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      loading={loading}
                      radius="md"
                      style={{
                        background: 'linear-gradient(135deg, #1ab01a 0%, #0d800d 100%)',
                        boxShadow: '0 4px 15px rgba(26, 176, 26, 0.3)',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(26, 176, 26, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(26, 176, 26, 0.3)';
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                  </motion.div>
                </Stack>
              </form>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

