'use client';

import { Modal, Table, ActionIcon, Group, Text, Badge, Stack, Button } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { ProductTypeResponseDto } from '@/presentation/dto/product-type.dto';
import { notifications } from '@mantine/notifications';
import { openDeleteConfirmModal } from '../DeleteConfirmModal/DeleteConfirmModal';

interface ProductTypeListModalProps {
  opened: boolean;
  onClose: () => void;
  productTypes: ProductTypeResponseDto[];
  onEdit: (productType: ProductTypeResponseDto) => void;
  onRefresh: () => void;
}

export function ProductTypeListModal({
  opened,
  onClose,
  productTypes,
  onEdit,
  onRefresh,
}: ProductTypeListModalProps) {
  const handleDelete = async (productType: ProductTypeResponseDto) => {
    openDeleteConfirmModal({
      title: 'Eliminar Tipo de Producto',
      message: `¿Estás seguro de que deseas eliminar el tipo "${productType.name}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/product-types/${productType.id}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          const result = await response.json();

          if (result.success) {
            notifications.show({
              title: 'Éxito',
              message: 'Tipo de producto eliminado correctamente',
              color: 'green',
            });
            onRefresh();
          } else {
            notifications.show({
              title: 'Error',
              message: result.error || 'No se pudo eliminar el tipo de producto',
              color: 'red',
            });
          }
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Error al eliminar el tipo de producto',
            color: 'red',
          });
        }
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Gestionar Tipos de Producto"
      size="lg"
    >
      <Stack gap="md">
        {productTypes.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            No hay tipos de producto creados
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={500}>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Descripción</Table.Th>
                  <Table.Th>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {productTypes.map((productType) => (
                  <Table.Tr key={productType.id}>
                    <Table.Td>
                      <Text fw={500}>{productType.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {productType.description || 'Sin descripción'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => {
                            onEdit(productType);
                            onClose();
                          }}
                          title="Editar"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(productType)}
                          title="Eliminar"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cerrar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

