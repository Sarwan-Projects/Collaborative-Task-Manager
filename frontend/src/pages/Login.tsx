import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { loginSchema, LoginInput } from '../lib/validations';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Button from '../components/ui/Button';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    shouldUnregister: false,
    mode: 'onSubmit',
  });

  // Watch form values to preserve them
  const emailValue = watch('email');
  const passwordValue = watch('password');

  const onSubmit = async (data: LoginInput) => {
    console.log('onSubmit called with:', data); // Debug log
    setIsLoading(true);
    
    try {
      console.log('Attempting login...'); // Debug log
      await login(data.email, data.password);
      console.log('Login successful'); // Debug log
      toast.success('✓ Welcome back! Redirecting to your dashboard...', {
        duration: 3000,
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.log('Login error:', error); // Debug log
      
      // Preserve form values after error
      setTimeout(() => {
        setValue('email', emailValue, { shouldValidate: false });
        setValue('password', passwordValue, { shouldValidate: false });
      }, 0);
      
      const errorMessage = error.response?.data?.error || 'Unable to sign in. Please check your credentials.';
      console.log('Error message:', errorMessage); // Debug log
      
      // Show persistent error toast
      const toastId = toast.error(errorMessage, {
        duration: Infinity,
        style: {
          background: '#FEE2E2',
          color: '#991B1B',
          border: '3px solid #DC2626',
          fontWeight: '700',
          fontSize: '16px',
          padding: '20px 24px',
          minWidth: '400px',
          maxWidth: '500px',
          boxShadow: '0 20px 50px rgba(220, 38, 38, 0.4)',
        },
        icon: '❌',
      });
      
      console.log('Toast ID:', toastId); // Debug log
    } finally {
      setIsLoading(false);
      console.log('Finally block executed'); // Debug log
    }
  };

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors); // Debug log
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your workspace</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5" noValidate>
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                autoComplete="email"
                error={errors.email?.message}
                icon={<Mail className="w-5 h-5" />}
                {...register('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />

              <Button type="submit" variant="gradient" className="w-full" size="lg" isLoading={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              {/* Debug button to test toast */}
              <button
                type="button"
                onClick={() => {
                  console.log('Test button clicked');
                  const testToastId = toast.error('Test error message - this should stay forever!', {
                    duration: Infinity,
                    style: {
                      background: '#FEE2E2',
                      color: '#991B1B',
                      border: '3px solid #DC2626',
                      fontWeight: '700',
                      fontSize: '16px',
                      padding: '20px 24px',
                      minWidth: '400px',
                      maxWidth: '500px',
                      boxShadow: '0 20px 50px rgba(220, 38, 38, 0.4)',
                    },
                    icon: '❌',
                  });
                  console.log('Test Toast ID:', testToastId);
                }}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                🧪 Test Toast (Debug)
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-8 px-4">
            Protected by enterprise-grade security. Your data is encrypted and secure.
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        <div className="max-w-lg text-white relative z-10">
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Streamline Your Workflow
          </h2>
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            TaskFlow empowers teams to collaborate seamlessly with real-time updates, 
            smart notifications, and intuitive task management. Stay organized and achieve more.
          </p>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white/90">Real-time collaboration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white/90">Smart task assignments</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white/90">Advanced analytics</span>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-6 border-t border-white/20">
            <div className="flex -space-x-3">
              {['A', 'B', 'C', 'D'].map((letter, i) => (
                <div 
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center text-sm font-semibold shadow-lg"
                >
                  {letter}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Trusted by teams worldwide</p>
              <p className="text-xs text-white/70">Join thousands of productive users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
