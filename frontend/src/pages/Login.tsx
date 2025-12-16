import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { loginSchema, LoginInput } from '../lib/validations';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500">Sign in to continue to TaskFlow</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Create one
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-6">
            Manage your tasks with ease
          </h2>
          <p className="text-lg text-white/80 mb-8">
            TaskFlow helps you organize, track, and collaborate on tasks in real-time. 
            Stay productive and never miss a deadline.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {['A', 'B', 'C', 'D'].map((letter, i) => (
                <div 
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-sm font-semibold"
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/80">
              Join 10,000+ users managing their tasks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
