import { useState } from 'react';
import { Order } from '@/types';
import { api, ApiClient } from '@/lib/api';

interface UseMarketOrderResult {
  placeMarketOrder: (symbol: string, quantity: number) => Promise<Order>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useMarketOrder(): UseMarketOrderResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeMarketOrder = async (symbol: string, quantity: number): Promise<Order> => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.createMarketOrder(symbol, quantity);
      return data;
    } catch (error) {
      const errorMessage = ApiClient.handleError(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    placeMarketOrder,
    isLoading,
    error,
    clearError,
  };
}