import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useTrade } from './useTrade';

interface LimitOrderForm {
  quantity: number;
  price: number;
}

export function useLimitOrder(symbol: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createLimitOrder } = useTrade({ symbol });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<LimitOrderForm>();

  const onSubmit = async (data: LimitOrderForm) => {
    try {
      setIsSubmitting(true);
      await createLimitOrder(data.quantity, data.price);
      reset();
      toast.success('Limit order placed successfully');
    } catch (error) {
      toast.error('Failed to place limit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formProps = {
    quantity: register('quantity', {
      required: 'Quantity is required',
      min: {
        value: 0.0001,
        message: 'Quantity must be at least 0.0001',
      },
      pattern: {
        value: /^\d*\.?\d*$/,
        message: 'Please enter a valid number',
      },
    }),
    price: register('price', {
      required: 'Price is required',
      min: {
        value: 0.01,
        message: 'Price must be at least 0.01',
      },
      pattern: {
        value: /^\d*\.?\d*$/,
        message: 'Please enter a valid number',
      },
    }),
  };

  return {
    onSubmit: handleSubmit(onSubmit),
    formProps,
    errors,
    isSubmitting,
    control,
  };
}