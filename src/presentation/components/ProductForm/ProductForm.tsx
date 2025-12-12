'use client';

import { TextInput, Textarea, NumberInput, Select, Switch, Stack, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { CreateProductDto, UpdateProductDto, ProductResponseDto } from '@/presentation/dto/product.dto';
import { ProductTypeResponseDto } from '@/presentation/dto/product-type.dto';
import { parsePrice } from '@/presentation/utils/price.util';

interface ProductFormProps {
  productTypes: ProductTypeResponseDto[];
  initialValues?: Partial<CreateProductDto> | Partial<ProductResponseDto>;
  onSubmit: (values: CreateProductDto | UpdateProductDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({
  productTypes,
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) {
  // Parse prices if they come as formatted strings (from ProductResponseDto)
  const parseInitialPrice = (price: number | string | undefined): number => {
    if (price === undefined) return 0;
    if (typeof price === 'string') {
      // Remove $ and spaces, then parse
      const cleaned = price.replace(/\$/g, '').replace(/\s/g, '').trim();
      return parsePrice(cleaned);
    }
    return price;
  };

  const form = useForm<CreateProductDto>({
    initialValues: {
      code: initialValues?.code ?? 0,
      description: initialValues?.description ?? '',
      productTypeId: initialValues?.productTypeId ?? 0,
      costPrice: parseInitialPrice(initialValues?.costPrice),
      publicPrice: parseInitialPrice(initialValues?.publicPrice),
      stock: initialValues?.stock ?? 0,
      isActive: initialValues?.isActive ?? true,
    },
    validate: {
      code: (value) => (value > 0 ? null : 'El código debe ser mayor a 0'),
      description: (value) => (value.trim().length > 0 ? null : 'La descripción es requerida'),
      productTypeId: (value) => (value > 0 ? null : 'Debe seleccionar un tipo de producto'),
      costPrice: (value) => (value !== undefined && value >= 0 ? null : 'El precio de costo debe ser mayor o igual a 0'),
      publicPrice: (value) => (value !== undefined && value >= 0 ? null : 'El precio público debe ser mayor o igual a 0'),
      stock: (value) => (value !== undefined && value >= 0 ? null : 'El stock debe ser mayor o igual a 0'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await onSubmit(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <NumberInput
          label="Código"
          placeholder="Ej: 2070"
          required
          min={1}
          {...form.getInputProps('code')}
        />

        <Textarea
          label="Descripción"
          placeholder="Ej: Filtro Aire"
          required
          minRows={3}
          autosize
          {...form.getInputProps('description')}
        />

        <Select
          label="Tipo de Producto"
          placeholder="Seleccione un tipo"
          required
          data={productTypes.map((pt) => ({ value: String(pt.id), label: pt.name }))}
          value={form.values.productTypeId ? String(form.values.productTypeId) : null}
          onChange={(value) => form.setFieldValue('productTypeId', value ? Number(value) : 0)}
          error={form.errors.productTypeId}
        />

        <Group grow>
          <NumberInput
            label="Precio de Costo"
            placeholder="0.00"
            required
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix="$ "
            thousandSeparator="."
            decimalSeparator=","
            {...form.getInputProps('costPrice')}
          />

          <NumberInput
            label="Precio Público"
            placeholder="0.00"
            required
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix="$ "
            thousandSeparator="."
            decimalSeparator=","
            {...form.getInputProps('publicPrice')}
          />
        </Group>

        <NumberInput
          label="Stock"
          placeholder="0"
          required
          min={0}
          {...form.getInputProps('stock')}
        />

        <Switch
          label="Activo"
          {...form.getInputProps('isActive', { type: 'checkbox' })}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            Guardar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

