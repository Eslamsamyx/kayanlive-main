'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      redirect('/en/login');
      return;
    }

    const userRole = session.user?.role;

    // Redirect based on role
    if (userRole === 'ADMIN' || userRole === 'MODERATOR' || userRole === 'CONTENT_CREATOR') {
      redirect('/admin/dashboard');
    } else if (userRole === 'CLIENT') {
      redirect('/en/dashboard/briefs');
    } else {
      // Fallback for unknown roles
      redirect('/en/login');
    }
  }, [session, status]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
