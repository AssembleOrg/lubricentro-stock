'use client';

import { Modal, Text, Button, Group } from '@mantine/core';
import { modals } from '@mantine/modals';

interface DeleteConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function openDeleteConfirmModal({ title, message, onConfirm, isLoading = false }: DeleteConfirmModalProps) {
  modals.openConfirmModal({
    title,
    children: <Text size="sm">{message}</Text>,
    labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
    confirmProps: { color: 'red', loading: isLoading },
    onConfirm: async () => {
      await onConfirm();
      modals.closeAll();
    },
  });
}

