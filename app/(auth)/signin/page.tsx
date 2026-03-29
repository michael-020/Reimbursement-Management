'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/useAuthStore';

const signinSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SigninFormData = z.infer<typeof signinSchema>;

export default function SigninPage() {
  const router = useRouter();
  const { signin, isLoading: authLoading, error: authError, clearError } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninFormData) => {
    try {
      clearError();
      const result = await signin(data);
      
      if (result.success) {
        toast.success('Signin successful! Redirecting...');
        router.push('/home');
      } else {
        toast.error(result.message || 'Signin failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-neutral-200 shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Sign In
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Email
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Password
            </label>
            <input
              {...register('password')}
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full mt-8 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-neutral-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-neutral-900 hover:text-neutral-700 font-semibold underline"
            >
              Signup
            </Link>
          </p>
          <p>
            <Link
              href="/forgot-password"
              className="text-neutral-600 hover:text-neutral-900 font-semibold underline"
            >
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
