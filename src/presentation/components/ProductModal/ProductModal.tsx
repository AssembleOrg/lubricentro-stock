'use client';

import { useState, useEffect } from 'react';
import { Modal, Title } from '@mantine/core';
import { ProductForm } from '../ProductForm/ProductForm';
import { CreateProductDto, UpdateProductDto, ProductResponseDto } from '@/presentation/dto/product.dto';
import { ProductTypeResponseDto } from '@/presentation/dto/product-type.dto';
import { notifications } from '@mantine/notifications';

interface ProductModalProps {
  opened: boolean;
  onClose: () => void;
  productTypes: ProductTypeResponseDto[];
  product?: ProductResponseDto;
  onSubmit: (values: CreateProductDto | UpdateProductDto) => Promise<void>;
  onProductTypesChange?: () => void;
  isLoading?: boolean;
}

export function ProductModal({
  opened,
  onClose,
  productTypes: initialProductTypes,
  product,
  onSubmit,
  onProductTypesChange,
  isLoading = false,
}: ProductModalProps) {
  const [productTypes, setProductTypes] = useState<ProductTypeResponseDto[]>(initialProductTypes);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Fetch product types when modal opens
  useEffect(() => {
    if (opened) {
      fetchProductTypes();
    }
  }, [opened]);

  const fetchProductTypes = async () => {
    setLoadingTypes(true);
    try {
      const response = await fetch('/api/product-types', {
        credentials: 'include',
      });
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
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleSubmit = async (values: CreateProductDto | UpdateProductDto) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={3}>{product ? 'Editar Producto' : 'Nuevo Producto'}</Title>}
      size="lg"
    >
      <ProductForm
        productTypes={productTypes}
        initialValues={product}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading || loadingTypes}
      />
    </Modal>
  );
}

