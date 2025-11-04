'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Package,
  FolderHeart,
  CalendarDays,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Share2,
  Home,
  FolderKanban,
  CheckSquare,
  FileText,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ locale: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (status === 'loading' || !resolvedParams) return;

    if (!session && !pathname.includes('/login')) {
      router.push(`/${resolvedParams.locale}/login`);
      return;
    }
  }, [session, status, router, pathname, resolvedParams]);

  // Show loading state
  if (status === 'loading' || !resolvedParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
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
        {/* Desktop Sidebar - Fixed Position */}
        <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-70">
          <DashboardSidebar
            session={session}
            locale={resolvedParams.locale}
            onNavigate={() => {}}
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
              />

              {/* Sidebar */}
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-70 z-50"
              >
                <DashboardSidebar
                  session={session}
                  locale={resolvedParams.locale}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 lg:ml-70">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

interface DashboardSidebarProps {
  session: {
    user?: {
      email?: string | null;
      name?: string | null;
      role?: string | null;
    };
  };
  locale: string;
  onNavigate: () => void;
}

// Helper function to get navigation based on user role
function getNavigationForRole(role: string | undefined | null, locale: string) {
  // CLIENT role gets a focused dashboard for their projects
  if (role === 'CLIENT') {
    return [
      {
        name: 'Dashboard',
        href: `/${locale}/dashboard`,
        icon: Home,
        description: 'Overview & updates',
      },
      {
        name: 'My Projects',
        href: `/${locale}/dashboard/projects`,
        icon: FolderKanban,
        description: 'Active projects',
      },
      {
        name: 'Deliverables',
        href: `/${locale}/dashboard/assets`,
        icon: Package,
        description: 'Files & assets',
      },
      {
        name: 'Approvals',
        href: `/${locale}/dashboard/approvals`,
        icon: CheckSquare,
        description: 'Pending reviews',
      },
      {
        name: 'Meetings',
        href: `/${locale}/dashboard/meetings`,
        icon: CalendarDays,
        description: 'Scheduled meetings',
      },
      {
        name: 'Briefs',
        href: `/${locale}/dashboard/briefs`,
        icon: FileText,
        description: 'Project briefs',
      },
      {
        name: 'Notifications',
        href: `/${locale}/dashboard/notifications`,
        icon: Bell,
        description: 'Activity updates',
      },
    ];
  }

  // Default/internal team navigation (ADMIN, MODERATOR, CONTENT_CREATOR, etc.)
  return [
    {
      name: 'Assets',
      href: `/${locale}/dashboard/assets`,
      icon: Package,
      description: 'Manage your digital assets',
    },
    {
      name: 'Collections',
      href: `/${locale}/dashboard/collections`,
      icon: FolderHeart,
      description: 'Organize assets into collections',
    },
    {
      name: 'Exhibitions',
      href: `/${locale}/dashboard/exhibitions`,
      icon: CalendarDays,
      description: 'Manage exhibitions',
    },
    {
      name: 'Leads',
      href: `/${locale}/dashboard/leads`,
      icon: Users,
      description: 'Track and manage leads',
    },
    {
      name: 'Analytics',
      href: `/${locale}/dashboard/analytics`,
      icon: BarChart3,
      description: 'View insights and reports',
    },
    {
      name: 'Projects',
      href: `/${locale}/dashboard/projects`,
      icon: FolderKanban,
      description: 'Manage all projects',
    },
    {
      name: 'Briefs',
      href: `/${locale}/dashboard/briefs`,
      icon: FileText,
      description: 'View all briefs',
    },
  ];
}

function DashboardSidebar({ session, locale, onNavigate }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Get navigation based on user role
  const navigation = getNavigationForRole(session?.user?.role, locale);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div
      className="w-70 h-screen bg-gradient-to-b from-[#2c2c2b] to-[#1a1a19] border-r border-[#333] flex flex-col relative overflow-hidden shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Mouse-following effect overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: isHovered
            ? `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, rgba(122, 253, 214, 0.08) 0%, transparent 70%)`
            : 'transparent',
        }}
      />

      {/* Header */}
      <div className="p-6 border-b border-[#333] relative z-10 bg-[#2c2c2b]/80 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-[#7afdd6] mb-1">
          KayanLive
        </h1>
        <p className="text-sm text-[#b2b2b2] truncate font-medium">{session?.user?.email}</p>
        {session?.user?.name && (
          <p className="text-xs text-[#999] mt-1 truncate">{session.user.name}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto relative z-10">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href);
                  onNavigate();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                  transition-all duration-200 text-left group relative
                  ${
                    active
                      ? 'bg-[#333] text-white font-semibold border border-[#444]'
                      : 'text-[#b2b2b2] hover:bg-[#333]/50 hover:text-white'
                  }
                `}
              >
                <Icon
                  size={20}
                  className={`
                    flex-shrink-0 transition-all duration-200
                    ${active ? 'text-[#7afdd6]' : 'text-[#666] group-hover:text-[#7afdd6]'}
                    ${active ? 'scale-110' : 'group-hover:scale-110'}
                  `}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm">{item.name}</div>
                  <div className={`text-xs truncate mt-0.5 ${active ? 'text-[#b2b2b2]' : 'text-[#666]'}`}>{item.description}</div>
                </div>
                {active && (
                  <div className="w-2 h-2 bg-[#7afdd6] rounded-full flex-shrink-0 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Actions - Only show for CLIENT role */}
        {session?.user?.role === 'CLIENT' && (
          <div className="mt-6 pt-6 border-t border-[#333]">
            <p className="text-xs font-semibold text-[#666] uppercase tracking-wider px-4 mb-3">
              Quick Actions
            </p>
            <button
              onClick={() => {
                router.push(`/${locale}/questionnaire/project-brief`);
                onNavigate();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[#b2b2b2] hover:bg-[#333]/50 hover:text-white transition-all duration-200 group"
            >
              <Share2 size={18} className="text-[#666] group-hover:text-[#7afdd6] flex-shrink-0 transition-colors" />
              <span className="text-sm font-medium">Start New Project</span>
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#333] relative z-10 bg-[#2c2c2b]/80 backdrop-blur-sm">
        <button
          onClick={() => {
            router.push('/auth/signout');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#b2b2b2] hover:bg-red-900/20 hover:text-red-400 hover:border hover:border-red-900/30 transition-all duration-200 group"
        >
          <LogOut size={20} className="flex-shrink-0 group-hover:text-red-400 transition-colors" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
