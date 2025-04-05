import { useForm } from 'react-hook-form';
import { OrderType } from '@/types';
import { useMarketOrder } from '@/hooks/useMarketOrder';
import { useLimitOrder } from '@/hooks/useLimitOrder';

interface TradingFormProps {
  symbol: string;
  currentPrice: number;
}

interface FormInputs {
  orderType: OrderType;
  quantity: string;
  price?: string;
}

export default function TradingForm({ symbol, currentPrice }: TradingFormProps) {
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormInputs>({
    defaultValues: {
      orderType: OrderType.MARKET,
      quantity: '',
      price: '',
    },
  });

  const { placeMarketOrder, isLoading: isMarketLoading, error: marketError } = useMarketOrder();
  const { placeLimitOrder, isLoading: isLimitLoading, error: limitError } = useLimitOrder();

  const orderType = watch('orderType');
  const isLoading = isMarketLoading || isLimitLoading;
  const error = marketError || limitError;

  const onSubmit = async (data: FormInputs) => {
    try {
      const quantity = parseFloat(data.quantity);
      
      if (data.orderType === OrderType.MARKET) {
        await placeMarketOrder(symbol, quantity);
      } else {
        const price = parseFloat(data.price || '0');
        if (!price) return;
        await placeLimitOrder(symbol, quantity, price);
      }
      
      reset();
    } catch (error) {
      // Error is handled by the hooks
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Place Order</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-error-50 p-4">
            <div className="text-sm text-error-700">{error}</div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Order Type
          </label>
          <select
            {...register('orderType')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value={OrderType.MARKET}>Market Order</option>
            <option value={OrderType.LIMIT}>Limit Order</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <div className="mt-1">
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('quantity', {
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity must be positive' },
              })}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter quantity"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-error-600">{errors.quantity.message}</p>
            )}
          </div>
        </div>

        {orderType === OrderType.LIMIT && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Limit Price
            </label>
            <div className="mt-1">
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', {
                  required: orderType === OrderType.LIMIT ? 'Price is required for limit orders' : false,
                  min: { value: 0, message: 'Price must be positive' },
                })}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter limit price"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-error-600">{errors.price.message}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Current Price:{' '}
            <span className="font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(currentPrice)}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isLoading || isSubmitting) ? (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}