import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { registerSchema, RegisterInput } from '../lib/validations';
import Input from '../components/ui/Input';
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
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Real-time collaboration',
    'Task prioritization',
    'Due date tracking',
    'Team notifications'
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-6">
            Start your productivity journey
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Create an account and experience the power of organized task management.
          </p>
          <div className="space-y-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-1 bg-white/20 rounded-full">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h1>
            <p className="text-gray-500">Get started with TaskFlow today</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                icon={<User className="w-5 h-5" />}
                {...register('name')}
              />

              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                error={errors.email?.message}
                icon={<Mail className="w-5 h-5" />}
                {...register('email')}
              />

              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                error={errors.password?.message}
                icon={<Lock className="w-5 h-5" />}
                {...register('password')}
              />

              <Button type="submit" variant="gradient" className="w-full" size="lg" isLoading={isLoading}>
                Create Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
