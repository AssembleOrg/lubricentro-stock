'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/presentation/hooks/useDebounce';
import { AuthGuard } from '@/presentation/components/AuthGuard/AuthGuard';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Group,
  TextInput,
  Select,
  Button,
  Card,
  Pagination,
  Stack,
  Badge,
  ActionIcon,
  Flex,
  Image,
  Box,
  Text,
} from '@mantine/core';
import { IconPlus, IconSearch, IconFilter, IconLogout, IconCategory, IconEdit } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { notifications } from '@mantine/notifications';
import { ProductTable } from '@/presentation/components/ProductTable/ProductTable';
import { ProductModal } from '@/presentation/components/ProductModal/ProductModal';
import { ProductTypeModal } from '@/presentation/components/ProductTypeModal/ProductTypeModal';
import { ProductTypeListModal } from '@/presentation/components/ProductTypeListModal/ProductTypeListModal';
import { openDeleteConfirmModal } from '@/presentation/components/DeleteConfirmModal/DeleteConfirmModal';
import { ProductResponseDto } from '@/presentation/dto/product.dto';
import { ProductTypeResponseDto } from '@/presentation/dto/product-type.dto';
import { CreateProductDto, UpdateProductDto } from '@/presentation/dto/product.dto';

interface PaginatedResponse {
  data: ProductResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function HomePageContent() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [productTypeModalOpened, setProductTypeModalOpened] = useState(false);
  const [productTypeListModalOpened, setProductTypeListModalOpened] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponseDto | undefined>();
  const [editingProductType, setEditingProductType] = useState<ProductTypeResponseDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingType, setSubmittingType] = useState(false);
  
  // Filters and pagination
  const [search, setSearch] = useState('');
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // Debounce search input (500ms delay)
  const debouncedSearch = useDebounce(search, 500);

  // Fetch product types
  useEffect(() => {
    fetchProductTypes();
  }, []);

  // Fetch products with debounced search
  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearch, selectedProductType]);

  const fetchProductTypes = async () => {
    try {
      const response = await fetch('/api/product-types');
      const result = await response.json();
      if (result.success) {
        setProductTypes(result.data);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudieron cargar los tipos de producto',
        color: 'red',
      });
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(pageSize),
      });

      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim());
      }

      if (selectedProductType) {
        params.append('productTypeId', selectedProductType);
      }

      const response = await fetch(`/api/products?${params.toString()}`, {
        credentials: 'include', // Include cookies
      });
      const result = await response.json();

      if (result.success) {
        // Response is now flat: { data: [...], total, page, pageSize, totalPages }
        const paginatedData = result.data as PaginatedResponse;
        setProducts(paginatedData.data);
        setTotalPages(paginatedData.totalPages);
        setTotal(paginatedData.total);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'No se pudieron cargar los productos',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error al cargar los productos',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(undefined);
    setModalOpened(true);
  };

  const handleEdit = (product: ProductResponseDto) => {
    setEditingProduct(product);
    setModalOpened(true);
  };

  const handleDelete = (product: ProductResponseDto) => {
    openDeleteConfirmModal({
      title: 'Eliminar Producto',
      message: `¿Está seguro de eliminar el producto "${product.description}" (Código: ${product.code})?`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/products/${product.id}`, {
            method: 'DELETE',
            credentials: 'include', // Include cookies
          });
          const result = await response.json();

          if (result.success) {
            notifications.show({
              title: 'Éxito',
              message: 'Producto eliminado correctamente',
              color: 'green',
            });
            fetchProducts();
          } else {
            notifications.show({
              title: 'Error',
              message: result.error || 'No se pudo eliminar el producto',
              color: 'red',
            });
          }
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Error al eliminar el producto',
            color: 'red',
          });
        }
      },
    });
  };

  const handleSubmit = async (values: CreateProductDto | UpdateProductDto) => {
    setSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        notifications.show({
          title: 'Éxito',
          message: editingProduct ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
          color: 'green',
        });
        fetchProducts();
        setModalOpened(false);
        setEditingProduct(undefined);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'No se pudo guardar el producto',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error al guardar el producto',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleProductTypeChange = (value: string | null) => {
    setSelectedProductType(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedProductType(null);
    setCurrentPage(1);
  };

  const handleCreateProductType = async (values: { name: string; description?: string }) => {
    setSubmittingType(true);
    try {
      const isEditing = !!editingProductType;
      const url = isEditing ? `/api/product-types/${editingProductType.id}` : '/api/product-types';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        notifications.show({
          title: 'Éxito',
          message: `Tipo de producto ${isEditing ? 'actualizado' : 'creado'} correctamente`,
          color: 'green',
        });
        fetchProductTypes();
        setProductTypeModalOpened(false);
        setEditingProductType(null);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el tipo de producto`,
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Error al ${editingProductType ? 'actualizar' : 'crear'} el tipo de producto`,
        color: 'red',
      });
    } finally {
      setSubmittingType(false);
    }
  };

  const handleEditProductType = (productType: ProductTypeResponseDto) => {
    setEditingProductType(productType);
    setProductTypeModalOpened(true);
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Container size="xl" py="xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header Section */}
          <Card shadow="md" padding="xl" radius="lg" withBorder mb="xl" style={{ backgroundColor: 'white' }}>
            <Stack gap="lg">
              {/* Logo and Title */}
              <Group justify="space-between" align="center">
                <Group gap="lg">
                  <Image
                    src="/lubrizen.png"
                    alt="Lubrizen Logo"
                    h={80}
                    w="auto"
                    fit="contain"
                  />
                  <Box>
                    <Title order={1} c="green.6" size="h1" fw={700}>
                      Gestión de Stock
                    </Title>
                    <Text c="dimmed" size="sm" mt={4}>
                      Administración de inventario
                    </Text>
                  </Box>
                </Group>
                <Button
                  leftSection={<IconLogout size={18} />}
                  onClick={async () => {
                    await logout();
                    // Force full page reload to clear all state and cache
                    window.location.href = '/login';
                  }}
                  variant="light"
                  color="red"
                  size="lg"
                >
                  Salir
                </Button>
              </Group>

              {/* Search Bar */}
              <TextInput
                placeholder="Buscar por código o descripción..."
                leftSection={<IconSearch size={18} />}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                size="lg"
                radius="md"
              />
            </Stack>
          </Card>

          {/* Main Content Card */}
          <Card shadow="md" padding="xl" radius="lg" withBorder style={{ backgroundColor: 'white' }}>
            <Stack gap="xl">
              {/* Filters and Actions Bar */}
              <Group gap="md" align="flex-end" wrap="wrap">
                <Select
                  placeholder="Filtrar por tipo"
                  data={productTypes.map((pt) => ({ value: String(pt.id), label: pt.name }))}
                  value={selectedProductType}
                  onChange={handleProductTypeChange}
                  clearable
                  leftSection={<IconFilter size={18} />}
                  size="lg"
                  style={{ flex: 1, minWidth: 250 }}
                />
                {selectedProductType && (
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="lg"
                    onClick={() => {
                      const pt = productTypes.find((p) => String(p.id) === selectedProductType);
                      if (pt) {
                        handleEditProductType(pt);
                      }
                    }}
                    title="Editar tipo de producto seleccionado"
                  >
                    <IconEdit size={18} />
                  </ActionIcon>
                )}
                <Button
                  leftSection={<IconCategory size={18} />}
                  variant="light"
                  onClick={() => {
                    setEditingProductType(null);
                    setProductTypeModalOpened(true);
                  }}
                  size="lg"
                >
                  Agregar Tipo
                </Button>
                <Button
                  variant="subtle"
                  onClick={() => setProductTypeListModalOpened(true)}
                  size="lg"
                  title="Gestionar tipos de producto"
                >
                  Gestionar Tipos
                </Button>
                <Button
                  leftSection={<IconPlus size={18} />}
                  onClick={handleCreate}
                  size="lg"
                >
                  Nuevo Producto
                </Button>
                {(search || selectedProductType) && (
                  <Button 
                    variant="subtle" 
                    onClick={clearFilters}
                    size="lg"
                  >
                    Limpiar
                  </Button>
                )}
                <Badge size="xl" variant="light" color="green" p="md">
                  Total: {total} productos
                </Badge>
              </Group>

              {/* Table Section */}
              {loading ? (
                <Box py="xl">
                  <Text ta="center" size="lg" c="dimmed">
                    Cargando productos...
                  </Text>
                </Box>
              ) : products.length === 0 ? (
                <Box py="xl">
                  <Text ta="center" size="lg" c="dimmed">
                    No se encontraron productos
                  </Text>
                </Box>
              ) : (
                <>
                  <ProductTable
                    products={products}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                  {/* Pagination always visible */}
                  <Group justify="center" mt="xl">
                    <Pagination
                      value={currentPage}
                      onChange={setCurrentPage}
                      total={totalPages}
                      size="lg"
                      radius="md"
                    />
                  </Group>
                </>
              )}
            </Stack>
          </Card>
        </motion.div>

        <ProductModal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setEditingProduct(undefined);
          }}
          productTypes={productTypes}
          product={editingProduct}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />

        <ProductTypeModal
          opened={productTypeModalOpened}
          onClose={() => {
            setProductTypeModalOpened(false);
            setEditingProductType(null);
          }}
          onSubmit={handleCreateProductType}
          isLoading={submittingType}
          initialValues={editingProductType}
        />

        <ProductTypeListModal
          opened={productTypeListModalOpened}
          onClose={() => setProductTypeListModalOpened(false)}
          productTypes={productTypes}
          onEdit={(productType) => {
            setEditingProductType(productType);
            setProductTypeListModalOpened(false);
            setProductTypeModalOpened(true);
          }}
          onRefresh={fetchProductTypes}
        />
      </Container>
    </Box>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomePageContent />
    </AuthGuard>
  );
}
