'use client';

import { useState, useMemo } from 'react';
import { api } from '@/trpc/react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Users,
  Building2,
  Plus,
  Search,
  Loader2,
  CalendarDays,
  Globe,
  TrendingUp,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import ExhibitionFormModal from '@/components/exhibitions/exhibition-form-modal';

export default function ExhibitionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'tentative'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'leads'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const itemsPerPage = 12;

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  // Fetch exhibitions
  const { data: exhibitionsData, isLoading, error, refetch } = api.exhibition.listExhibitions.useQuery({
    search: searchQuery || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Filter and sort on client side for date range filtering
  const filteredAndSortedExhibitions = useMemo(() => {
    if (!exhibitionsData?.exhibitions) return [];

    let filtered = [...exhibitionsData.exhibitions];

    // Date range filter
    const now = new Date();
    if (filterDateRange !== 'all') {
      filtered = filtered.filter((exhibition) => {
        const startDate = new Date(exhibition.startDate);
        const endDate = new Date(exhibition.endDate);

        if (filterDateRange === 'upcoming') return startDate > now;
        if (filterDateRange === 'ongoing') return startDate <= now && endDate >= now;
        if (filterDateRange === 'past') return endDate < now;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'leads':
          return (b._count?.leads || 0) - (a._count?.leads || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [exhibitionsData?.exhibitions, filterDateRange, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!filteredAndSortedExhibitions) return { total: 0, upcoming: 0, ongoing: 0, totalLeads: 0 };

    const now = new Date();
    const total = filteredAndSortedExhibitions.length;
    const upcoming = filteredAndSortedExhibitions.filter((ex) => new Date(ex.startDate) > now).length;
    const ongoing = filteredAndSortedExhibitions.filter(
      (ex) => new Date(ex.startDate) <= now && new Date(ex.endDate) >= now
    ).length;
    const totalLeads = filteredAndSortedExhibitions.reduce((sum, ex) => sum + (ex._count?.leads || 0), 0);

    return { total, upcoming, ongoing, totalLeads };
  }, [filteredAndSortedExhibitions]);

  const getDaysUntil = (date: Date | string) => {
    const days = differenceInDays(new Date(date), new Date());
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'confirmed') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          Confirmed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        Tentative
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading exhibitions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Exhibitions</h3>
          <p className="text-red-600">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exhibitions</h1>
          <p className="text-gray-600 mt-2">Manage your exhibition calendar and leads</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          New Exhibition
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Upcoming</div>
              <div className="text-3xl font-bold text-blue-600">{stats.upcoming}</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Ongoing</div>
              <div className="text-3xl font-bold text-emerald-600">{stats.ongoing}</div>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Leads</div>
              <div className="text-3xl font-bold text-purple-600">{stats.totalLeads}</div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Filter & Search</h3>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search exhibitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Dates</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="past">Past</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="tentative">Tentative</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="leads">Sort by Leads</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setFilterDateRange('all');
              setFilterStatus('all');
              setSortBy('date');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Exhibitions Grid */}
      {filteredAndSortedExhibitions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No exhibitions found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterDateRange !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first exhibition to get started'}
          </p>
          {!searchQuery && filterDateRange === 'all' && filterStatus === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Create Exhibition
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedExhibitions.map((exhibition) => (
            <div
              key={exhibition.id}
              onClick={() => router.push(`/dashboard/exhibitions/${exhibition.id}`)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {exhibition.name}
                </h2>
                {getStatusBadge(exhibition.status)}
              </div>

              {exhibition.industry && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-1">{exhibition.industry}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>
                    {format(new Date(exhibition.startDate), 'MMM dd')} -{' '}
                    {format(new Date(exhibition.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <CalendarDays size={16} />
                  <span>{getDaysUntil(exhibition.startDate)}</span>
                </div>

                {exhibition.venue && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    <span className="truncate">
                      {exhibition.venue.city}, {exhibition.venue.country}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 size={16} />
                    <span className="font-medium">{exhibition._count?.exhibitors || 0} exhibitors</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} />
                    <span className="font-medium">{exhibition._count?.leads || 0} leads</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Exhibition Modal */}
      <ExhibitionFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
