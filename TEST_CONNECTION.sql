-- ============================================
-- TEST CONNECTION - Verificar acceso a las tablas
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Verificar políticas actuales
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

-- Verificar RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('product_types', 'products');

-- Intentar leer datos (esto debería funcionar)
SELECT COUNT(*) as product_types_count FROM product_types;
SELECT COUNT(*) as products_count FROM products;

-- Verificar el rol actual
SELECT current_user, session_user;

-- Verificar si auth.uid() está disponible
SELECT auth.uid() as current_auth_uid;

