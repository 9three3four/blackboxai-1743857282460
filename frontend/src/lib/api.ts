import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiError, ApiResponse, MarketData, Order, User } from '@/types';

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<ApiResponse<{ token: string }>> {
    const response = await this.client.post('/api/auth/login', { username, password });
    return response.data;
  }

  async register(username: string, email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    const response = await this.client.post('/api/auth/register', { username, email, password });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/api/auth/logout');
  }

  // Market data endpoints
  async getMarketData(symbol: string): Promise<ApiResponse<MarketData>> {
    const response = await this.client.get(`/api/market/${symbol}`);
    return response.data;
  }

  // Order endpoints
  async createMarketOrder(symbol: string, quantity: number): Promise<ApiResponse<Order>> {
    const response = await this.client.post('/api/orders/market', { symbol, quantity });
    return response.data;
  }

  async createLimitOrder(symbol: string, quantity: number, price: number): Promise<ApiResponse<Order>> {
    const response = await this.client.post('/api/orders/limit', { symbol, quantity, price });
    return response.data;
  }

  async getOrders(): Promise<ApiResponse<Order[]>> {
    const response = await this.client.get('/api/orders');
    return response.data;
  }

  async cancelOrder(orderId: number): Promise<ApiResponse<Order>> {
    const response = await this.client.post(`/api/orders/${orderId}/cancel`);
    return response.data;
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/api/users/me');
    return response.data;
  }

  // Error handling helper
  static handleError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      return apiError?.message || 'An unexpected error occurred';
    }
    return 'An unexpected error occurred';
  }
}

export const api = new ApiClient();