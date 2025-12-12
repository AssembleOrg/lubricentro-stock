-- ============================================
-- FIX RLS POLICIES - Ejecutar en Supabase SQL Editor
-- ============================================

-- Primero, verificar el estado actual
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('product_types', 'products')
ORDER BY tablename, policyname;

-- Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "admin_only_product_types" ON product_types;
DROP POLICY IF EXISTS "admin_only_products" ON products;

-- Verificar que RLS está habilitado
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Crear políticas que permitan:
-- 1. Acceso desde cliente autenticado como admin
-- 2. Acceso desde servidor (cuando auth.uid() IS NULL - conexión directa con service_role)

-- IMPORTANTE: Si estás usando service_role, las políticas deben permitir acceso cuando auth.uid() IS NULL
-- Pero también necesitamos verificar que el DATABASE_URL use service_role

-- Opción 1: Política que permite acceso cuando auth.uid() IS NULL (para service_role)
CREATE POLICY "admin_only_product_types" ON product_types
    FOR ALL
    TO authenticated, anon, service_role, postgres
    USING (
        -- Permite si es el admin autenticado
        (auth.uid() = '81ebc211-7fa9-46b3-9315-771572c92939'::uuid)
        OR
        -- Permite si no hay contexto de auth (conexión directa desde servidor con service_role)
        (auth.uid() IS NULL)
    )
    WITH CHECK (
        (auth.uid() = '81ebc211-7fa9-46b3-9315-771572c92939'::uuid)
        OR
        (auth.uid() IS NULL)
    );

CREATE POLICY "admin_only_products" ON products
    FOR ALL
    TO authenticated, anon, service_role, postgres
    USING (
        -- Permite si es el admin autenticado
        (auth.uid() = '81ebc211-7fa9-46b3-9315-771572c92939'::uuid)
        OR
        -- Permite si no hay contexto de auth (conexión directa desde servidor con service_role)
        (auth.uid() IS NULL)
    )
    WITH CHECK (
        (auth.uid() = '81ebc211-7fa9-46b3-9315-771572c92939'::uuid)
        OR
        (auth.uid() IS NULL)
    );

-- Verificar que las políticas se crearon
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('product_types', 'products');

-- Test: Verificar que podemos leer (esto debería funcionar desde el servidor)
SELECT COUNT(*) as product_types_count FROM product_types;
SELECT COUNT(*) as products_count FROM products;

