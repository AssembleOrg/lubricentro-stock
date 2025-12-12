import { create } from 'zustand';
import { ProductResponseDto } from '../dto/product.dto';

interface ProductFilters {
  code?: number;
  description?: string;
  productTypeId?: number;
  isActive?: boolean;
  includeDeleted?: boolean;
  search?: string;
}

interface ProductState {
  products: ProductResponseDto[];
  selectedProduct: ProductResponseDto | null;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  currentRequestId: number;
  abortController: AbortController | null;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProductById: (id: number, includeDeleted?: boolean) => Promise<void>;
  addProduct: (product: ProductResponseDto) => void;
  updateProduct: (id: number, product: ProductResponseDto) => void;
  removeProduct: (id: number) => void;
  setFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;
  setSelectedProduct: (product: ProductResponseDto | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Debounce utility
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  filters: {},
  currentRequestId: 0,
  abortController: null,

  fetchProducts: async (filters?: ProductFilters) => {
    // Cancel previous request if still pending
    const currentController = get().abortController;
    if (currentController) {
      currentController.abort();
    }

    // Create new abort controller for this request
    const controller = new AbortController();
    const requestId = get().currentRequestId + 1;

    set({
      isLoading: true,
      error: null,
      abortController: controller,
      currentRequestId: requestId,
    });

    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        signal: controller.signal,
        credentials: 'include', // Include cookies
      });

      // Check if this request is still the latest
      if (get().currentRequestId !== requestId) {
        return; // Ignore stale response
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch products');
      }

      // Only update if this is still the latest request
      if (get().currentRequestId === requestId) {
        set({
          products: result.data.data || result.data,
          isLoading: false,
          filters: filters || {},
          abortController: null,
        });
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      // Only update error if this is still the latest request
      if (get().currentRequestId === requestId) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        set({
          error: errorMessage,
          isLoading: false,
          abortController: null,
        });
      }
    }
  },

  fetchProductById: async (id: number, includeDeleted = false) => {
    // Cancel any pending product list request
    const currentController = get().abortController;
    if (currentController) {
      currentController.abort();
    }

    const controller = new AbortController();
    set({ isLoading: true, error: null, abortController: controller });

    try {
      const url = `/api/products/${id}${includeDeleted ? '?includeDeleted=true' : ''}`;
      const response = await fetch(url, {
        signal: controller.signal,
        credentials: 'include', // Include cookies
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch product');
      }

      set({ selectedProduct: result.data, isLoading: false, abortController: null });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false, abortController: null });
    }
  },

  addProduct: (product: ProductResponseDto) => {
    set((state) => ({
      products: [...state.products, product],
    }));
  },

  updateProduct: (id: number, product: ProductResponseDto) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? product : p)),
      selectedProduct:
        state.selectedProduct?.id === id ? product : state.selectedProduct,
    }));
  },

  removeProduct: (id: number) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      selectedProduct:
        state.selectedProduct?.id === id ? null : state.selectedProduct,
    }));
  },

  setFilters: (filters: ProductFilters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  setSelectedProduct: (product: ProductResponseDto | null) => {
    set({ selectedProduct: product });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));

