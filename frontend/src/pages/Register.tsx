import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, Mail, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { registerSchema, RegisterInput } from '../lib/validations';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Button from '../components/ui/Button';

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    },
    shouldUnregister: false,
    mode: 'onSubmit',
  });

  const onSubmit = async (data: RegisterInput) => {
    console.log('onSubmit called with:', data); // Debug log
    setIsLoading(true);
    
    try {
      console.log('Attempting registration...'); // Debug log
      await registerUser(data.name, data.email, data.password);
      console.log('Registration successful'); // Debug log
      toast.success('✓ Account created successfully! Welcome to TaskFlow.', {
        duration: 3000,
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.log('Registration error:', error); // Debug log
      
      const errorMessage = error.response?.data?.error || 'Unable to create account. Please try again.';
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
      console.log('NOT calling setValue - form should keep values automatically');
    } finally {
      setIsLoading(false);
      console.log('Finally block executed'); // Debug log
    }
  };

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors); // Debug log
  };

  const features = [
    { text: 'Real-time collaboration' },
    { text: 'Smart task assignments' },
    { text: 'Progress tracking' },
    { text: 'Instant notifications' }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
        
        <div className="max-w-lg text-white relative z-10">
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Join Thousands of Productive Teams
          </h2>
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            Create your account and unlock powerful features designed to streamline 
            your workflow and boost team productivity.
          </p>
          <div className="space-y-4 mb-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">{feature.text}</span>
              </div>
            ))}
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

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600">Start managing tasks efficiently today</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Form onSubmit triggered');
                handleSubmit(onSubmit, onError)(e);
              }} 
              className="space-y-5" 
              noValidate
            >
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                autoComplete="name"
                error={errors.name?.message}
                icon={<User className="w-5 h-5" />}
                {...register('name')}
              />

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
                placeholder="Create a strong password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />

              <Button type="submit" variant="gradient" className="w-full" size="lg" isLoading={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-8 px-4">
            Protected by enterprise-grade security. Your data is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
