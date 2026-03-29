'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

const authUser = useAuthStore((s) => s.authUser);
const isGettingSession = useAuthStore((s) => s.isGettingSession);
const hasCheckedSession = useAuthStore((s) => s.hasCheckedSession);
const getSession = useAuthStore((s) => s.getSession);

useEffect(() => {
  if (
    pathname === '/' ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    authUser ||
    hasCheckedSession 
  ) {
    return;
  }

  getSession();
}, [pathname, authUser, hasCheckedSession]);

  if (pathname !== '/' && isGettingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className='size-12 text-primary animate-spin' />
        </div>
      </div>
    );
  }

  return children;
}
