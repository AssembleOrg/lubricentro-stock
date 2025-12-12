# Lubricentro Stock System

A stock management system built with Next.js, Prisma, and Supabase following clean architecture principles.

## Architecture

The project follows clean architecture with the following layers:

- **Domain**: Entities and repository interfaces (business logic)
- **Application**: Use cases (application logic)
- **Infrastructure**: Repository implementations, database connections
- **Presentation**: DTOs, API routes, Zustand stores

## Project Structure

```
src/
├── domain/
│   ├── entities/          # Domain entities
│   └── repositories/      # Repository interfaces
├── application/
│   └── use-cases/         # Business use cases
├── infrastructure/
│   ├── database/          # Prisma client
│   └── repositories/      # Repository implementations
└── presentation/
    ├── api/              # API routes (moved to app/api)
    ├── dto/              # Data Transfer Objects
    ├── stores/           # Zustand stores
    └── utils/            # Utility functions

app/
└── api/                  # Next.js API routes
    ├── product-types/    # Product type endpoints
    └── products/         # Product endpoints

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

1. Run the migration SQL file in your Supabase SQL editor:
   ```bash
   # The migration file is located at:
   prisma/migrations/001_init/migration.sql
   ```

2. Generate Prisma client:
   ```bash
   pnpm db:generate
   ```

3. (Optional) Push schema changes:
   ```bash
   pnpm db:push
   ```

## Database Schema

### Product Types
- `id`: Serial primary key
- `name`: Unique text (e.g., 'Filtros Aire Panel')
- `description`: Optional text
- `created_at`, `updated_at`: Timestamps

### Products
- `id`: Serial primary key
- `code`: Unique integer (product code)
- `description`: Text
- `product_type_id`: Foreign key to product_types
- `cost_price`: Decimal(12,2) - Product cost
- `public_price`: Decimal(12,2) - Public price
- `stock`: Integer (default: 0)
- `is_active`: Boolean (default: true)
- `deleted_at`: Timestamp for soft deletes
- `created_at`, `updated_at`: Timestamps

## Row Level Security (RLS)

The database is configured with RLS policies that restrict access to only the admin user:
- User UID: `81ebc211-7fa9-46b3-9315-771572c92939`
- Email: `admin@lubricentro.com`

Both `product_types` and `products` tables have RLS enabled with policies that check `auth.uid()` matches the admin UID.

## API Endpoints

### Product Types

- `GET /api/product-types` - Get all product types
- `POST /api/product-types` - Create a product type
- `GET /api/product-types/[id]` - Get a product type by ID
- `PUT /api/product-types/[id]` - Update a product type
- `DELETE /api/product-types/[id]` - Delete a product type

### Products

- `GET /api/products` - Get all products (with optional filters)
  - Query params: `code`, `description`, `productTypeId`, `isActive`, `includeDeleted`
- `POST /api/products` - Create a product
- `GET /api/products/[id]` - Get a product by ID
  - Query params: `includeDeleted` (boolean)
- `PUT /api/products/[id]` - Update a product
- `DELETE /api/products/[id]` - Soft delete a product
- `POST /api/products/[id]/restore` - Restore a soft-deleted product
- `DELETE /api/products/[id]/hard-delete` - Permanently delete a product

## Features

- ✅ Clean Architecture
- ✅ TypeScript (strict mode, no `any` types)
- ✅ Prisma ORM with PostgreSQL
- ✅ Row Level Security (RLS) for single-user access
- ✅ Soft deletes for products
- ✅ DTOs with class-transformer
- ✅ Zustand for state management
- ✅ Price formatting with thousands separators (es-AR format)
- ✅ Input validation with class-validator
- ✅ Path aliases (@/domain, @/application, etc.)

## Price Formatting

Prices are automatically formatted with thousands separators using the `es-AR` locale format:
- Example: `1234.56` → `"1.234,56"`

The formatting is handled in:
- `src/presentation/utils/price.util.ts` - Utility functions
- `src/presentation/dto/product.dto.ts` - DTO transformation

## State Management

Zustand stores are available for:
- `useProductTypeStore` - Product type state management
- `useProductStore` - Product state management

## Development

```bash
# Start development server
pnpm dev

# Generate Prisma client
pnpm db:generate

# Open Prisma Studio
pnpm db:studio

# Run migrations
pnpm db:migrate
```

## Notes

- All prices use thousands separators in the format `1.234,56` (Argentine format)
- Products support soft deletes (can be restored)
- Product types use hard deletes
- The system is designed for single-user access via RLS policies
- All API responses follow a consistent format: `{ success: boolean, data?: T, error?: string }`
