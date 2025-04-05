export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface MarketData {
  symbol: string;
  current_price: number;
  daily_change: number;
  daily_volume: number;
  last_updated: string;
}

export interface Order {
  id: number;
  user_id: number;
  symbol: string;
  order_type: OrderType;
  status: OrderStatus;
  quantity: number;
  price?: number;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: string;
}

export interface OrderUpdate {
  order: Order;
  type: 'created' | 'updated' | 'cancelled';
}