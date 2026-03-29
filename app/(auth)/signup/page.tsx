'use client';

import { useState, useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const signupSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });
  const { data: session } = useSession();
  
  useEffect(() => { 
    if(session) {
      redirect("/home");
    }
  }, [session]);

  useEffect(() => {
    const email = sessionStorage.getItem('verifiedEmail');
    if (email) {
      setVerifiedEmail(email);
      setValue('email', email);
    } else {
      toast.error('Please verify your email first');
      router.push('/verify-email');
    }
  }, [setValue, router]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast.error(responseData.error || responseData.msg || 'Failed to create account');
        return;
      }

      toast.success('Account created successfully!');
      sessionStorage.removeItem('verifiedEmail');
      setTimeout(() => router.push('/signin'), 1500);
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!verifiedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Create Account</h1>
          <p className="text-gray-600 text-center mb-8">Set your password to complete signup</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email-display" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email-display"
                type="email"
                value={verifiedEmail}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed opacity-60"
              />
              <input {...register('email')} type="hidden" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-gray-600 text-center mt-6">
            Already have an account?{' '}
            <Link href="/signin" className="text-gray-900 hover:text-gray-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
