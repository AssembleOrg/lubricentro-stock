'use client';

import { Table, Badge, ActionIcon, Group, Text } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { ProductResponseDto } from '@/presentation/dto/product.dto';
import { formatPrice } from '@/presentation/utils/price.util';

interface ProductTableProps {
  products: ProductResponseDto[];
  onEdit: (product: ProductResponseDto) => void;
  onDelete: (product: ProductResponseDto) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <Table.ScrollContainer minWidth={800}>
      <Table highlightOnHover verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Num. Producto</Table.Th>
            <Table.Th>Descripción</Table.Th>
            <Table.Th>Tipo de producto</Table.Th>
            <Table.Th>Precio</Table.Th>
            <Table.Th>Prec. Público</Table.Th>
            <Table.Th>Stock</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {products.map((product, index) => (
            <motion.tr
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Table.Td>
                <Text fw={600}>{product.code}</Text>
              </Table.Td>
              <Table.Td>
                <Text style={{ maxWidth: 400 }} lineClamp={2}>
                  {product.description}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {product.productType?.name || 'N/A'}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text fw={500}>${product.costPrice}</Text>
              </Table.Td>
              <Table.Td>
                <Text fw={600} c="green">
                  ${product.publicPrice}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge
                  color={product.stock > 10 ? 'green' : product.stock > 0 ? 'yellow' : 'red'}
                  variant="light"
                  size="lg"
                  p="sm"
                >
                  {product.stock}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => onEdit(product)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => onDelete(product)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </motion.tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

