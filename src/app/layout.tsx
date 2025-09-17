import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { TRPCReactProvider } from '@/trpc/react';
import { Providers } from '@/components/Providers';
import '@/styles/globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'KayanLive - Live Streaming Platform',
  description: 'Your premium live streaming platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} overflow-x-hidden`} suppressHydrationWarning>
        <Providers>
          <TRPCReactProvider>
            {children}
          </TRPCReactProvider>
        </Providers>
      </body>
    </html>
  );
}