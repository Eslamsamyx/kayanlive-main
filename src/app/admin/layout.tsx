'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, Target, Users, FileText, LogOut, Building2, FolderKanban, FileQuestion, Package, FolderHeart, CalendarDays, TrendingUp, Shield, ArrowLeft, Download, Share2, HardDrive } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

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

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#2c2c2b] flex items-center justify-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#2c2c2b] relative overflow-hidden">
      {/* Simple Corner Decorations */}
      {/* Top Right Corner */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="absolute top-4 right-4 w-3 h-3 bg-[#7afdd6] rounded-full"></div>
        <div className="absolute top-8 right-12 w-2 h-2 bg-[#b8a4ff] rounded-full"></div>
        <div className="absolute top-16 right-8 w-1 h-1 bg-[#7afdd6] rounded-full"></div>
      </div>

      {/* Bottom Left Corner */}
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10">
        <div className="absolute bottom-4 left-4 w-3 h-3 bg-[#b8a4ff] rounded-full"></div>
        <div className="absolute bottom-8 left-12 w-2 h-2 bg-[#7afdd6] rounded-full"></div>
        <div className="absolute bottom-16 left-8 w-1 h-1 bg-[#b8a4ff] rounded-full"></div>
      </div>

      {/* Top Left Subtle Line */}
      <div className="absolute top-0 left-0 w-24 h-0.5 bg-gradient-to-r from-[#7afdd6] to-transparent opacity-20"></div>

      {/* Bottom Right Subtle Line */}
      <div className="absolute bottom-0 right-0 w-24 h-0.5 bg-gradient-to-l from-[#b8a4ff] to-transparent opacity-20"></div>

      <div className="flex relative z-10">
        <AdminSidebar session={session} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Header Bar */}
          <div
            className="px-4 md:px-8 py-4 border-b relative z-30"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'rgba(122, 253, 214, 0.2)',
            }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <NotificationCenter />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Detect if we're in the Assets Portal
  const isAssetsPortal = pathname.startsWith('/admin/assets') ||
                         pathname.startsWith('/admin/collections') ||
                         pathname.startsWith('/admin/analytics') ||
                         pathname.startsWith('/admin/download-requests') ||
                         pathname.startsWith('/admin/shared-links') ||
                         pathname.startsWith('/admin/storage');

  // Main navigation (without Collections and Analytics - they're in Assets Portal)
  const mainNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'BarChart3' },
    { name: 'Companies', href: '/admin/companies', icon: 'Building2' },
    { name: 'Projects', href: '/admin/projects', icon: 'FolderKanban' },
    { name: 'Users', href: '/admin/users', icon: 'Users' },
    { name: 'Permissions', href: '/admin/permissions', icon: 'Shield' },
    { name: 'Assets', href: '/admin/assets', icon: 'Package' },
    { name: 'Exhibitions', href: '/admin/exhibitions', icon: 'CalendarDays' },
    { name: 'Leads', href: '/admin/leads', icon: 'Target' },
    { name: 'Submissions', href: '/admin/submissions', icon: 'FileQuestion' },
    { name: 'Articles', href: '/admin/articles', icon: 'FileText' },
  ];

  // Assets Portal navigation
  const assetsNavigation = [
    { name: 'Assets Overview', href: '/admin/assets', icon: 'Package' },
    { name: 'Collections', href: '/admin/collections', icon: 'FolderHeart' },
    { name: 'Analytics', href: '/admin/analytics', icon: 'TrendingUp' },
    { name: 'Download Requests', href: '/admin/download-requests', icon: 'Download' },
    { name: 'Shared Links', href: '/admin/shared-links', icon: 'Share2' },
    { name: 'Storage & Settings', href: '/admin/storage', icon: 'HardDrive' },
  ];

  // Choose navigation based on current portal
  const navigation = isAssetsPortal ? assetsNavigation : mainNavigation;

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => {
    const userRole = session?.user?.role;

    if (userRole === 'ADMIN') {
      return true; // Admin can access everything
    }

    // Permissions and Analytics are ADMIN-only
    if (item.name === 'Permissions' || item.name === 'Analytics') {
      return false;
    }

    if (userRole === 'MODERATOR') {
      return item.name !== 'Users' || item.href === '/admin/users/profile';
    }

    if (userRole === 'CONTENT_CREATOR') {
      return item.name === 'Dashboard' || item.name === 'Articles';
    }

    return false;
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getIcon = (iconName: string) => {
    const iconProps = {
      size: 20,
      strokeWidth: 2,
    };

    switch (iconName) {
      case 'BarChart3':
        return <BarChart3 {...iconProps} />;
      case 'Building2':
        return <Building2 {...iconProps} />;
      case 'FolderKanban':
        return <FolderKanban {...iconProps} />;
      case 'Target':
        return <Target {...iconProps} />;
      case 'Users':
        return <Users {...iconProps} />;
      case 'Shield':
        return <Shield {...iconProps} />;
      case 'FileQuestion':
        return <FileQuestion {...iconProps} />;
      case 'FileText':
        return <FileText {...iconProps} />;
      case 'Package':
        return <Package {...iconProps} />;
      case 'FolderHeart':
        return <FolderHeart {...iconProps} />;
      case 'CalendarDays':
        return <CalendarDays {...iconProps} />;
      case 'TrendingUp':
        return <TrendingUp {...iconProps} />;
      case 'Download':
        return <Download {...iconProps} />;
      case 'Share2':
        return <Share2 {...iconProps} />;
      case 'HardDrive':
        return <HardDrive {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="w-64 h-screen sticky top-0 relative overflow-hidden flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '1px solid rgba(122, 253, 214, 0.2)'
      }}
    >
      {/* Mouse-following effect overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: isHovered
            ? `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, rgba(122, 253, 214, 0.1) 0%, transparent 70%)`
            : 'transparent',
        }}
      />

      {/* Back Button - shown only in Assets Portal */}
      {isAssetsPortal && (
        <div className="p-4 border-b border-[#7afdd6]/20 relative z-10">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-sm text-[#888888] hover:text-[#7afdd6] transition-colors duration-300 group"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Admin</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-[#7afdd6]/20 relative z-10">
        <h1
          className="text-xl font-bold mb-2"
          style={{
            fontFamily: '"Poppins", sans-serif',
            background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {isAssetsPortal ? 'Assets Portal' : 'KayanLive'}
        </h1>
        <p className="text-sm text-[#888888] mb-3">
          {isAssetsPortal ? 'Manage your digital assets and collections' : session?.user?.email}
        </p>
        {!isAssetsPortal && (
          <span
            className="inline-block px-3 py-1 text-xs font-medium rounded-full capitalize"
            style={{
              background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
              color: '#2c2c2b'
            }}
          >
            {session?.user?.role?.toLowerCase()}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 relative z-10 overflow-y-auto">
        <div className="space-y-2 pb-4">
          {filteredNavigation.map((item, index) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                router.push(item.href);
              }}
              className={`${
                pathname === item.href
                  ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] shadow-lg'
                  : 'text-[#888888] hover:bg-white/10 hover:text-[#7afdd6]'
              } group flex items-center px-4 py-3 text-sm font-medium rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden`}
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {pathname !== item.href && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#7afdd6]/10 to-[#b8a4ff]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
              <span className="mr-3 flex-shrink-0 relative z-10">{getIcon(item.icon)}</span>
              <span className="relative z-10">{item.name}</span>
            </a>
          ))}

          {/* Sign Out Button - at the end of nav */}
          <div className="pt-4 mt-4 border-t border-[#7afdd6]/20">
            <button
              onClick={() => {
                router.push('/auth/signout');
              }}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-[#888888] hover:bg-white/10 hover:text-red-400 rounded-xl transition-all duration-300 group relative overflow-hidden"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <LogOut size={20} strokeWidth={2} className="mr-3 flex-shrink-0 relative z-10" />
              <span className="relative z-10">Sign out</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}