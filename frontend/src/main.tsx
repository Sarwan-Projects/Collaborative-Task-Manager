import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <App />
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                error: {
                  duration: 10000, // Errors show for 10 seconds
                  style: {
                    background: '#FEE2E2',
                    color: '#991B1B',
                    border: '3px solid #DC2626',
                    fontWeight: '700',
                    fontSize: '15px',
                    padding: '20px',
                    minWidth: '350px',
                    boxShadow: '0 10px 40px rgba(220, 38, 38, 0.3)',
                  },
                  iconTheme: {
                    primary: '#DC2626',
                    secondary: '#FEE2E2',
                  },
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#D1FAE5',
                    color: '#065F46',
                    border: '2px solid #059669',
                    fontWeight: '600',
                    fontSize: '14px',
                    padding: '16px',
                  },
                  iconTheme: {
                    primary: '#059669',
                    secondary: '#D1FAE5',
                  },
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
