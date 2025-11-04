'use client';

import { useState, useMemo } from 'react';
import { api } from '@/trpc/react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Loader2,
  Mail,
  Phone,
  Building2,
  Calendar,
  Filter,
  Download,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';

export default function LeadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterExhibition, setFilterExhibition] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  // Fetch leads
  const { data: leadsData, isLoading, error, refetch } = api.exhibition.listLeads.useQuery({
    exhibitionId: filterExhibition !== 'all' ? filterExhibition : undefined,
    status: filterStatus !== 'all' ? filterStatus as any : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Fetch exhibitions for filter
  const { data: exhibitionsData } = api.exhibition.listExhibitions.useQuery({
    limit: 100,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!leadsData) return { total: 0, new: 0, contacted: 0, qualified: 0 };

    return {
      total: leadsData.pagination.total,
      new: leadsData.leads.filter((l) => l.status === 'NEW').length,
      contacted: leadsData.leads.filter((l) => l.status === 'CONTACTED').length,
      qualified: leadsData.leads.filter((l) => l.status === 'QUALIFIED').length,
    };
  }, [leadsData]);

  // Update lead status mutation
  const updateStatusMutation = api.exhibition.updateLead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleStatusChange = (leadId: string, newStatus: string) => {
    updateStatusMutation.mutate({
      id: leadId,
      status: newStatus as any,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Star className="text-yellow-600" size={16} />;
      case 'CONTACTED':
        return <MessageSquare className="text-blue-600" size={16} />;
      case 'QUALIFIED':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'CONVERTED':
        return <UserCheck className="text-purple-600" size={16} />;
      case 'LOST':
        return <XCircle className="text-red-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONTACTED':
        return 'bg-blue-100 text-blue-800';
      case 'QUALIFIED':
        return 'bg-green-100 text-green-800';
      case 'CONVERTED':
        return 'bg-purple-100 text-purple-800';
      case 'LOST':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    if (!leadsData?.leads) return;

    const headers = ['Name', 'Email', 'Phone', 'Role', 'Exhibition', 'Status', 'Source', 'Created'];
    const rows = leadsData.leads.map((lead) => [
      lead.contactName || '',
      lead.contactEmail || '',
      lead.contactPhone || '',
      lead.contactRole || '',
      lead.exhibition?.name || '',
      lead.status,
      lead.leadSource || '',
      format(new Date(lead.createdAt), 'yyyy-MM-dd HH:mm'),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading leads...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Leads</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all your exhibition leads</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={!leadsData?.leads.length}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Leads</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Users className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">New</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.new}</div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Contacted</div>
              <div className="text-3xl font-bold text-blue-600">{stats.contacted}</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Qualified</div>
              <div className="text-3xl font-bold text-green-600">{stats.qualified}</div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter size={20} />
          Filter & Search
        </h3>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={filterExhibition}
            onChange={(e) => setFilterExhibition(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Exhibitions</option>
            {exhibitionsData?.exhibitions.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="PUBLIC_PAGE">Public Page</option>
            <option value="MANUAL">Manual Entry</option>
            <option value="IMPORT">Imported</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setFilterExhibition('all');
              setFilterStatus('all');
              setFilterSource('all');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Leads Table */}
      {leadsData && leadsData.leads.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Company</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Exhibition</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Captured</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leadsData.leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{lead.contactName}</div>
                      {lead.contactRole && <div className="text-sm text-gray-500">{lead.contactRole}</div>}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <a
                          href={`mailto:${lead.contactEmail}`}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Mail size={14} />
                          {lead.contactEmail}
                        </a>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone size={14} />
                          {lead.contactPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {lead.exhibitor?.name ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 size={14} className="text-gray-400" />
                          {lead.exhibitor?.name}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.exhibition?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        disabled={updateStatusMutation.isPending}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          lead.status
                        )} border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="QUALIFIED">Qualified</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="LOST">Lost</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar size={14} />
                        {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">{lead.leadSource}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedLead(lead.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <a
                          href={`mailto:${lead.contactEmail}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Send email"
                        >
                          <Mail size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {leadsData.pagination.total > itemsPerPage && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, leadsData.pagination.total)} of {leadsData.pagination.total} leads
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage * itemsPerPage >= leadsData.pagination.total}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterExhibition !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Leads will appear here as they are captured from exhibitions'}
          </p>
        </div>
      )}
    </div>
  );
}
