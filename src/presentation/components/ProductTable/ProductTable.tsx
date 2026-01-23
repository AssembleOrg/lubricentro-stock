'use client';

import { useState } from 'react';
import {
  Table,
  Badge,
  ActionIcon,
  Group,
  Text,
  Tooltip,
  Card,
  Stack,
  Box,
  Flex,
  Divider,
  SegmentedControl,
} from '@mantine/core';
import { IconEdit, IconTrash, IconList, IconLayoutGrid } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { ProductResponseDto } from '@/presentation/dto/product.dto';
import { formatPrice } from '@/presentation/utils/price.util';
import { formatDate } from '@/presentation/utils/date.util';

export type ViewMode = 'list' | 'cards';

interface ProductTableProps {
  products: ProductResponseDto[];
  onEdit: (product: ProductResponseDto) => void;
  onDelete: (product: ProductResponseDto) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

// Card view for each product
function ProductCard({
  product,
  index,
  onEdit,
  onDelete,
}: {
  product: ProductResponseDto;
  index: number;
  onEdit: (product: ProductResponseDto) => void;
  onDelete: (product: ProductResponseDto) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <Card
        shadow="sm"
        padding="md"
        radius="md"
        withBorder
        mb="sm"
        style={{
          borderLeft: `4px solid ${
            product.stock > 10 ? '#40c057' : product.stock > 0 ? '#fab005' : '#fa5252'
          }`,
        }}
      >
        {/* Header: Code and Actions */}
        <Flex justify="space-between" align="center" mb="xs">
          <Badge variant="filled" color="dark" size="lg" radius="sm">
            #{product.code}
          </Badge>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              size="lg"
              onClick={() => onEdit(product)}
            >
              <IconEdit size={18} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              size="lg"
              onClick={() => onDelete(product)}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        </Flex>

        {/* Description */}
        <Text fw={500} size="sm" lineClamp={2} mb="xs">
          {product.description}
        </Text>

        {/* Product Type */}
        <Text size="xs" c="dimmed" mb="sm">
          {product.productType?.name || 'Sin tipo'}
        </Text>

        <Divider my="xs" />

        {/* Prices and Stock Row */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="xs">
          <Box>
            <Text size="xs" c="dimmed">
              Costo
            </Text>
            <Text fw={500} size="md">
              ${formatPrice(product.costPrice)}
            </Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">
              Público
            </Text>
            <Text fw={700} size="lg" c="green.7">
              ${formatPrice(product.publicPrice)}
            </Text>
          </Box>
          <Box ta="center">
            <Text size="xs" c="dimmed" mb={4}>
              Stock
            </Text>
            <Badge
              color={product.stock > 10 ? 'green' : product.stock > 0 ? 'yellow' : 'red'}
              variant="filled"
              size="xl"
              radius="md"
              style={{ minWidth: 50 }}
            >
              {product.stock}
            </Badge>
          </Box>
        </Flex>

        {/* Dates */}
        <Divider my="xs" />
        <Flex justify="space-between" align="center" gap="xs">
          <Box>
            <Text size="xs" c="dimmed">
              Creado
            </Text>
            <Text size="xs" fw={500}>
              {formatDate(product.createdAt)}
            </Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">
              Actualizado
            </Text>
            <Text size="xs" fw={500}>
              {formatDate(product.updatedAt)}
            </Text>
          </Box>
        </Flex>
      </Card>
    </motion.div>
  );
}

// List/Table view
function ListView({
  products,
  onEdit,
  onDelete,
}: Omit<ProductTableProps, 'viewMode' | 'onViewModeChange'>) {
  return (
    <Table.ScrollContainer minWidth={700}>
      <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: '7%' }}>Código</Table.Th>
            <Table.Th style={{ width: '25%' }}>Descripción</Table.Th>
            <Table.Th style={{ width: '12%' }}>Tipo</Table.Th>
            <Table.Th style={{ width: '10%', textAlign: 'right' }}>Costo</Table.Th>
            <Table.Th style={{ width: '12%', textAlign: 'right' }}>Público</Table.Th>
            <Table.Th style={{ width: '8%', textAlign: 'center' }}>Stock</Table.Th>
            <Table.Th style={{ width: '8%', textAlign: 'center' }}>Creado</Table.Th>
            <Table.Th style={{ width: '8%', textAlign: 'center' }}>Actualizado</Table.Th>
            <Table.Th style={{ width: '10%', textAlign: 'center' }}>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {products.map((product, index) => (
            <motion.tr
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <Table.Td>
                <Text fw={600} size="sm">
                  {product.code}
                </Text>
              </Table.Td>
              <Table.Td>
                <Tooltip
                  label={product.description}
                  multiline
                  w={300}
                  position="top"
                  withArrow
                  disabled={!product.description || product.description.length <= 40}
                >
                  <Text size="sm" lineClamp={2} style={{ maxWidth: 280 }}>
                    {product.description}
                  </Text>
                </Tooltip>
              </Table.Td>
              <Table.Td>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {product.productType?.name || 'N/A'}
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>
                <Text fw={500} size="sm">
                  ${formatPrice(product.costPrice)}
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>
                <Text fw={700} size="md" c="green.7">
                  ${formatPrice(product.publicPrice)}
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Badge
                  color={product.stock > 10 ? 'green' : product.stock > 0 ? 'yellow' : 'red'}
                  variant="light"
                  size="lg"
                  style={{ minWidth: 45 }}
                >
                  {product.stock}
                </Badge>
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Tooltip label={`Creado: ${new Date(product.createdAt).toLocaleString('es-AR')}`}>
                  <Text size="xs" c="dimmed">
                    {formatDate(product.createdAt)}
                  </Text>
                </Tooltip>
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Tooltip label={`Actualizado: ${new Date(product.updatedAt).toLocaleString('es-AR')}`}>
                  <Text size="xs" c="dimmed">
                    {formatDate(product.updatedAt)}
                  </Text>
                </Tooltip>
              </Table.Td>
              <Table.Td>
                <Group gap="xs" justify="center">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="md"
                    onClick={() => onEdit(product)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="md"
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

// Cards grid view
function CardsView({
  products,
  onEdit,
  onDelete,
}: Omit<ProductTableProps, 'viewMode' | 'onViewModeChange'>) {
  return (
    <Stack gap="xs">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}

// View mode toggle component
export function ViewModeToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}) {
  return (
    <SegmentedControl
      value={value}
      onChange={(val) => onChange(val as ViewMode)}
      data={[
        {
          value: 'list',
          label: (
            <Tooltip label="Vista lista">
              <Flex align="center" gap={6}>
                <IconList size={16} />
                <Text size="xs" visibleFrom="sm">Lista</Text>
              </Flex>
            </Tooltip>
          ),
        },
        {
          value: 'cards',
          label: (
            <Tooltip label="Vista tarjetas">
              <Flex align="center" gap={6}>
                <IconLayoutGrid size={16} />
                <Text size="xs" visibleFrom="sm">Tarjetas</Text>
              </Flex>
            </Tooltip>
          ),
        },
      ]}
      size="sm"
    />
  );
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  viewMode: externalViewMode,
  onViewModeChange,
}: ProductTableProps) {
  // Internal state for view mode if not controlled externally
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('list');
  
  // Use external control if provided, otherwise use internal state
  const viewMode = externalViewMode ?? internalViewMode;
  const setViewMode = onViewModeChange ?? setInternalViewMode;

  return (
    <Stack gap="md">
      {/* View mode toggle - only show if not externally controlled */}
      {!externalViewMode && (
        <Flex justify="flex-end">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </Flex>
      )}

      {/* Render based on view mode */}
      {viewMode === 'cards' ? (
        <CardsView products={products} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <ListView products={products} onEdit={onEdit} onDelete={onDelete} />
      )}
    </Stack>
  );
}
