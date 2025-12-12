-- Extensión opcional para búsquedas más cómodas por descripción
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1) Tabla de tipos de producto
CREATE TABLE product_types (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) Tabla de productos
CREATE TABLE products (
    id              SERIAL PRIMARY KEY,
    code            INTEGER NOT NULL UNIQUE,
    description     TEXT NOT NULL,
    product_type_id INTEGER NOT NULL REFERENCES product_types(id),
    cost_price      NUMERIC(12,2) NOT NULL,
    public_price    NUMERIC(12,2) NOT NULL,
    stock           INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices útiles para búsquedas
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_description_trgm ON products USING gin (description gin_trgm_ops);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_product_type_id ON products(product_type_id);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);

-- Habilitar RLS en ambas tablas
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- NOTA: Las políticas RLS se crean en database-setup.sql
-- Ejecuta ese script en Supabase SQL Editor después de esta migración

