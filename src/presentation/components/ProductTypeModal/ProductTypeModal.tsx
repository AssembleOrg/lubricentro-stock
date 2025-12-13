'use client';

import { Modal, TextInput, Textarea, Stack, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { CreateProductTypeDto, UpdateProductTypeDto, ProductTypeResponseDto } from '@/presentation/dto/product-type.dto';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';

interface ProductTypeModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: CreateProductTypeDto | UpdateProductTypeDto) => Promise<void>;
  isLoading?: boolean;
  initialValues?: ProductTypeResponseDto | null;
}

export function ProductTypeModal({
  opened,
  onClose,
  onSubmit,
  isLoading = false,
  initialValues = null,
}: ProductTypeModalProps) {
  const isEditing = !!initialValues;
  
  const form = useForm<CreateProductTypeDto>({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'El nombre es requerido'),
    },
  });

  // Update form when initialValues change or modal opens
  useEffect(() => {
    if (opened) {
      if (initialValues) {
        form.setValues({
          name: initialValues.name,
          description: initialValues.description || '',
        });
      } else {
        form.reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await onSubmit(values);
      form.reset();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : `Error al ${isEditing ? 'actualizar' : 'crear'} el tipo de producto`,
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title={isEditing ? 'Editar Tipo de Producto' : 'Nuevo Tipo de Producto'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Nombre"
            placeholder="Ej: Filtros Aire Panel"
            required
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Descripción"
            placeholder="Descripción opcional del tipo"
            minRows={3}
            autosize
            {...form.getInputProps('description')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading}>
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

