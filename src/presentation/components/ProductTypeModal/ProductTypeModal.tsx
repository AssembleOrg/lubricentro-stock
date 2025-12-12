'use client';

import { Modal, Title, TextInput, Textarea, Stack, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { CreateProductTypeDto } from '@/presentation/dto/product-type.dto';
import { notifications } from '@mantine/notifications';

interface ProductTypeModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: CreateProductTypeDto) => Promise<void>;
  isLoading?: boolean;
}

export function ProductTypeModal({
  opened,
  onClose,
  onSubmit,
  isLoading = false,
}: ProductTypeModalProps) {
  const form = useForm<CreateProductTypeDto>({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'El nombre es requerido'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await onSubmit(values);
      form.reset();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al crear el tipo de producto',
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
      title={<Title order={3}>Nuevo Tipo de Producto</Title>}
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
              Guardar
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

