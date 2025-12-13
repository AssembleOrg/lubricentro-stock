'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Algo salió mal</h1>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1ab01a',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}

