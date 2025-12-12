import { create } from 'zustand';
import { ProductTypeResponseDto } from '../dto/product-type.dto';

interface ProductTypeState {
  productTypes: ProductTypeResponseDto[];
  isLoading: boolean;
  error: string | null;
  fetchProductTypes: () => Promise<void>;
  addProductType: (productType: ProductTypeResponseDto) => void;
  updateProductType: (id: number, productType: ProductTypeResponseDto) => void;
  removeProductType: (id: number) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useProductTypeStore = create<ProductTypeState>((set) => ({
  productTypes: [],
  isLoading: false,
  error: null,

  fetchProductTypes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/product-types');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch product types');
      }

      set({ productTypes: result.data, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addProductType: (productType: ProductTypeResponseDto) => {
    set((state) => ({
      productTypes: [...state.productTypes, productType],
    }));
  },

  updateProductType: (id: number, productType: ProductTypeResponseDto) => {
    set((state) => ({
      productTypes: state.productTypes.map((pt) =>
        pt.id === id ? productType : pt
      ),
    }));
  },

  removeProductType: (id: number) => {
    set((state) => ({
      productTypes: state.productTypes.filter((pt) => pt.id !== id),
    }));
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));

