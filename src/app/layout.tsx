
'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { withAuth } from '@/components/auth/with-auth';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/context/cart-context';

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { user } = useUser();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage || !user) {
    return <>{children}</>;
  }

  return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}

const AppLayoutWithAuth = withAuth(AppLayout);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PepsiConnect</title>
        <meta name="description" content="Digital Order Monitoring for Pepsi Distribution" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <FirebaseClientProvider>
          <CartProvider>
            <AppLayoutWithAuth>
              {children}
            </AppLayoutWithAuth>
          </CartProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
