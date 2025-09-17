'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { BarChart3, Target, Users, FileText, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session && !pathname.includes('/login')) {
      router.push('/en/login');
      return;
    }

    if (session && pathname.includes('/login')) {
      router.push('/admin/dashboard');
      return;
    }
  }, [session, status, router, pathname]);

  // Login page is now handled in the locale structure
  // Admin layout only handles /admin/* routes

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar session={session} />
        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

interface AdminSidebarProps {
  session: {
    user?: {
      email?: string | null;
      role?: string | null;
    };
  };
}

function AdminSidebar({ session }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'BarChart3' },
    { name: 'Leads', href: '/admin/leads', icon: 'Target' },
    { name: 'Users', href: '/admin/users', icon: 'Users' },
    { name: 'Articles', href: '/admin/articles', icon: 'FileText' },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => {
    const userRole = session?.user?.role;

    if (userRole === 'ADMIN') {
      return true; // Admin can access everything
    }

    if (userRole === 'MODERATOR') {
      return item.name !== 'Users' || item.href === '/admin/users/profile';
    }

    if (userRole === 'CONTENT_CREATOR') {
      return item.name === 'Dashboard' || item.name === 'Articles';
    }

    return false;
  });

  const getIcon = (iconName: string) => {
    const iconProps = {
      size: 20,
      strokeWidth: 2,
    };

    switch (iconName) {
      case 'BarChart3':
        return <BarChart3 {...iconProps} />;
      case 'Target':
        return <Target {...iconProps} />;
      case 'Users':
        return <Users {...iconProps} />;
      case 'FileText':
        return <FileText {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-[#2c2c2b] shadow-lg h-screen">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
          KayanLive Admin
        </h1>
        <p className="text-sm text-[#888888] mt-1">{session?.user?.email}</p>
        <span className="inline-block px-2 py-1 mt-2 text-xs font-medium bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-full capitalize">
          {session?.user?.role?.toLowerCase()}
        </span>
      </div>

      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {filteredNavigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                router.push(item.href);
              }}
              className={`${
                pathname === item.href
                  ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                  : 'text-[#888888] hover:bg-gray-800 hover:text-white'
              } group flex items-center px-3 py-3 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200`}
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <span className="mr-3 flex-shrink-0">{getIcon(item.icon)}</span>
              {item.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
        <button
          onClick={() => {
            window.location.href = '/api/auth/signout';
          }}
          className="w-full flex items-center px-3 py-3 text-sm font-medium text-[#888888] hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          <LogOut size={20} strokeWidth={2} className="mr-3 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}