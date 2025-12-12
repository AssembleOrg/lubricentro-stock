-- ============================================
-- ACTUALIZAR POLÍTICAS EXISTENTES
-- Ejecutar esto para agregar el rol 'postgres' a las políticas existentes
-- ============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "admin_only_product_types" ON product_types;
DROP POLICY IF EXISTS "admin_only_products" ON products;

-- Recrear con el rol 'postgres' incluido
CREATE POLICY "admin_only_product_types" ON product_types
    FOR ALL
    TO authenticated, anon, service_role, postgres
    USING (
        (auth.uid() = '81ebc211-7fa9-46b3-9315-771572c92939'::uuid)
        OR
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
        (auth.uid() = '81ebc211-7fa9-46b3-9315-771572c92939'::uuid)
        OR
        (auth.uid() IS NULL)
    )
    WITH CHECK (
        (auth.uid() = '81ebc211-7fa9-46b3-9315-771572c92939'::uuid)
        OR
        (auth.uid() IS NULL)
    );

-- Verificar
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('product_types', 'products');

