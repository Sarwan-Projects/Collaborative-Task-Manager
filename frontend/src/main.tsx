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
                duration: 5000,
                style: {
                  background: 'linear-gradient(135deg, #FEE2E2 0%, #FEF2F2 100%)',
                  color: '#991B1B',
                  border: '2px solid #FCA5A5',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  padding: '14px 18px',
                  boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)',
                },
              },
              success: {
                duration: 4000,
                style: {
                  background: 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%)',
                  color: '#065F46',
                  border: '2px solid #6EE7B7',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  padding: '14px 18px',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
                },
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
