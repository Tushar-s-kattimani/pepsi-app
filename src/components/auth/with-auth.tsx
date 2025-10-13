
'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

const publicRoutes = ['/login', '/signup'];

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    
    useEffect(() => {
      if (isUserLoading) return; // Wait until user status is determined

      const isPublicRoute = publicRoutes.includes(pathname);

      if (!user && !isPublicRoute) {
        router.replace('/login');
      }
      if (user && isPublicRoute) {
        router.replace('/');
      }
    }, [user, isUserLoading, router, pathname]);

    if (isUserLoading || (!user && !publicRoutes.includes(pathname)) || (user && publicRoutes.includes(pathname))) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }
    
    // For public routes, render children immediately if user is not logged in.
    if (!user && publicRoutes.includes(pathname)) {
        return <WrappedComponent {...props} />;
    }

    if (user && !publicRoutes.includes(pathname)) {
        return <WrappedComponent {...props} />;
    }

    return null;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
