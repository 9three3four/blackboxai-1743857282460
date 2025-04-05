import { useState, useEffect, useCallback } from 'react';
import { MarketData, Order, PriceUpdate, OrderUpdate } from '@/types';
import { api, ApiClient } from '@/lib/api';
import { ws } from '@/lib/websocket';

interface UseTradeProps {
  symbol: string;
}

export function useTrade({ symbol }: UseTradeProps) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoadingMarketData(true);
        const { data } = await api.getMarketData(symbol);
        setMarketData(data);
      } catch (error) {
        setError(ApiClient.handleError(error));
      } finally {
        setIsLoadingMarketData(false);
      }
    };

    fetchMarketData();
  }, [symbol]);

  // Fetch initial orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoadingOrders(true);
        const { data } = await api.getOrders();
        setOrders(data);
      } catch (error) {
        setError(ApiClient.handleError(error));
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  // Subscribe to real-time price updates
  const subscribeToPrice = useCallback(() => {
    return ws.subscribeToPrice((update: PriceUpdate) => {
      if (update.symbol === symbol) {
        setMarketData((prev) =>
          prev
            ? {
                ...prev,
                current_price: update.price,
                last_updated: update.timestamp,
              }
            : null
        );
      }
    });
  }, [symbol]);

  // Subscribe to real-time order updates
  const subscribeToOrders = useCallback(() => {
    return ws.subscribeToOrders((update: OrderUpdate) => {
      setOrders((prevOrders) => {
        if (!prevOrders) return prevOrders;

        switch (update.type) {
          case 'created':
            return [...prevOrders, update.order];
          case 'updated':
            return prevOrders.map((order) =>
              order.id === update.order.id ? update.order : order
            );
          case 'cancelled':
            return prevOrders.map((order) =>
              order.id === update.order.id ? update.order : order
            );
          default:
            return prevOrders;
        }
      });
    });
  }, []);

  // Cancel order
  const cancelOrder = useCallback(async (orderId: number) => {
    try {
      await api.cancelOrder(orderId);
      // The order update will come through the WebSocket
    } catch (error) {
      setError(ApiClient.handleError(error));
      throw error;
    }
  }, []);

  return {
    marketData,
    orders,
    isLoadingMarketData,
    isLoadingOrders,
    error,
    cancelOrder,
    subscribeToPrice,
    subscribeToOrders,
  };
}