import { WebSocketMessage, PriceUpdate, OrderUpdate } from '@/types';

type MessageHandler = (message: any) => void;
type ErrorHandler = (error: Event) => void;
type ConnectionHandler = () => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000; // 1 second
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private onErrorHandler: ErrorHandler | null = null;
  private onConnectHandler: ConnectionHandler | null = null;
  private onDisconnectHandler: ConnectionHandler | null = null;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.onConnectHandler?.();
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.onDisconnectHandler?.();
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onErrorHandler?.(error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        const handlers = this.messageHandlers.get(message.type) || [];
        handlers.forEach((handler) => handler(message.data));
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts));
  }

  subscribe<T>(type: string, handler: (data: T) => void): () => void {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.push(handler as MessageHandler);
    this.messageHandlers.set(type, handlers);

    return () => {
      const updatedHandlers = this.messageHandlers.get(type) || [];
      this.messageHandlers.set(
        type,
        updatedHandlers.filter((h) => h !== handler)
      );
    };
  }

  subscribeToPrice(handler: (update: PriceUpdate) => void): () => void {
    return this.subscribe<PriceUpdate>('price_update', handler);
  }

  subscribeToOrders(handler: (update: OrderUpdate) => void): () => void {
    return this.subscribe<OrderUpdate>('order_update', handler);
  }

  onError(handler: ErrorHandler) {
    this.onErrorHandler = handler;
  }

  onConnect(handler: ConnectionHandler) {
    this.onConnectHandler = handler;
  }

  onDisconnect(handler: ConnectionHandler) {
    this.onDisconnectHandler = handler;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const ws = new WebSocketClient();