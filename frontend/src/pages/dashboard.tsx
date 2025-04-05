import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/auth';
import { useTrade } from '@/hooks/useTrade';
import Layout from '@/components/layout/Layout';
import MarketDataCard from '@/components/trading/MarketDataCard';
import OrdersTable from '@/components/trading/OrdersTable';
import TradingForm from '@/components/trading/TradingForm';

const DEFAULT_SYMBOL = 'BTC/USD';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  
  const {
    marketData,
    orders,
    isLoadingMarketData,
    isLoadingOrders,
    error,
    cancelOrder,
    subscribeToPrice,
    subscribeToOrders,
  } = useTrade({ symbol: DEFAULT_SYMBOL });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trading Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor market data and manage your orders
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-error-50 p-4">
            <div className="text-sm text-error-700">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Market Data */}
          <div className="lg:col-span-4">
            <MarketDataCard
              marketData={marketData}
              isLoading={isLoadingMarketData}
              subscribeToPrice={subscribeToPrice}
            />
          </div>

          {/* Trading Form */}
          <div className="lg:col-span-8">
            <TradingForm
              symbol={DEFAULT_SYMBOL}
              currentPrice={marketData?.current_price || 0}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Orders</h2>
          <OrdersTable
            orders={orders}
            isLoading={isLoadingOrders}
            cancelOrder={cancelOrder}
            subscribeToOrders={subscribeToOrders}
          />
        </div>
      </div>
    </Layout>
  );
}