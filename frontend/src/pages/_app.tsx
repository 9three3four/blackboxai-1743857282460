import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import useAuthStore from '@/store/auth';
import '@/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  const { loadUser } = useAuthStore();

  // Load user on initial mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <>
      <Component {...pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}