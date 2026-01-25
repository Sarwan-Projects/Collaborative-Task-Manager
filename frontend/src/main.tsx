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
              style: {
                borderRadius: '16px',
                fontWeight: '600',
              },
              error: {
                duration: 8000,
                style: {
                  background: 'linear-gradient(135deg, #FEE2E2 0%, #FEF2F2 100%)',
                  color: '#991B1B',
                  border: '2px solid #FCA5A5',
                  borderRadius: '16px',
                  fontWeight: '600',
                  fontSize: '15px',
                  padding: '16px 20px',
                  minWidth: '350px',
                  maxWidth: '450px',
                  boxShadow: '0 10px 40px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(239, 68, 68, 0.05)',
                },
                iconTheme: {
                  primary: '#DC2626',
                  secondary: '#FEE2E2',
                },
              },
              success: {
                duration: 4000,
                style: {
                  background: 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%)',
                  color: '#065F46',
                  border: '2px solid #6EE7B7',
                  borderRadius: '16px',
                  fontWeight: '600',
                  fontSize: '15px',
                  padding: '16px 20px',
                  boxShadow: '0 10px 40px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.05)',
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
);
