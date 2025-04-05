import { useEffect } from 'react';
import { MarketData } from '@/types';

interface MarketDataCardProps {
  marketData: MarketData | null;
  isLoading: boolean;
  subscribeToPrice: () => () => void;
}

export default function MarketDataCard({
  marketData,
  isLoading,
  subscribeToPrice,
}: MarketDataCardProps) {
  useEffect(() => {
    const unsubscribe = subscribeToPrice();
    return () => unsubscribe();
  }, [subscribeToPrice]);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">No market data available</p>
      </div>
    );
  }

  const priceChangeClass = marketData.daily_change >= 0 ? 'text-success-600' : 'text-error-600';
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(marketData.current_price);
  const formattedChange = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(marketData.daily_change / 100);
  const formattedVolume = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(marketData.daily_volume);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{marketData.symbol}</h3>
        <span className="text-sm text-gray-500">
          Last updated: {new Date(marketData.last_updated).toLocaleTimeString()}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-3xl font-bold text-gray-900">{formattedPrice}</div>
          <div className={`text-sm font-medium ${priceChangeClass}`}>
            {formattedChange}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">24h Volume</span>
            <span className="text-sm font-medium text-gray-900">
              {formattedVolume}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}