'use client';

import { useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const verifyEmailSchema = z.object({
  email: z.email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
  });

  const emailValue = watch('email');
  const { data: session } = useSession();

  useEffect(() => { 
    if(session) {
        redirect("/home");
    }
  }, [session]);

  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailValue || !emailValue.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/initiate-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.msg?.includes('already exists')) {
          toast.error('Email already registered. Redirecting to sign in...');
          setTimeout(() => router.push('/signin'), 1500);
          return;
        }
        toast.error(data.msg || 'Failed to initiate signup');
        return;
      }

      toast.success('OTP sent to your email');
      setShowOtpInput(true);
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!emailValue) return;

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/initiate-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      });

      if (!response.ok) {
        toast.error('Failed to resend OTP');
        return;
      }

      toast.success('OTP resent to your email');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: VerifyEmailFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast.error(responseData.msg || 'Failed to verify email');
        return;
      }

      toast.success('Email verified successfully!');
      sessionStorage.setItem('verifiedEmail', data.email);
      setTimeout(() => router.push('/signup'), 1500);
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Verify Email</h1>
          <p className="text-gray-600 text-center mb-8">Enter your email to get started</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={showOtpInput}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {showOtpInput && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    OTP (6 digits)
                  </label>
                  <input
                    {...register('otp')}
                    id="otp"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition text-center text-lg tracking-widest"
                  />
                  {errors.otp && (
                    <p className="text-red-600 text-sm mt-1">{errors.otp.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending || isLoading}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? 'Sending...' : 'Resend'}
                  </button>
                </div>
              </div>
            )}

            {!showOtpInput && (
              <button
                type="button"
                onClick={handleInitiateSignup}
                disabled={isLoading || !emailValue}
                className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            )}
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
