'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter, useParams } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Users,
  Building2,
  Globe,
  Edit2,
  Trash2,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Download,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import ExhibitionFormModal from '@/components/exhibitions/exhibition-form-modal';

type TabType = 'overview' | 'assets' | 'leads' | 'analytics';

export default function ExhibitionDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const exhibitionId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  // Fetch exhibition details
  const {
    data: exhibitionData,
    isLoading,
    error,
    refetch,
  } = api.exhibition.getExhibitionById.useQuery({ id: exhibitionId });

  const exhibition = exhibitionData?.exhibition;

  // TODO: Implement exhibition assets endpoint
  // const { data: assetsData } = api.exhibition.getExhibitionAssets.useQuery(
  //   { exhibitionId },
  //   { enabled: activeTab === 'assets' }
  // );
  const assetsData = { assets: [] };

  // TODO: Implement exhibition leads endpoint
  // const { data: leadsData } = api.exhibition.getExhibitionLeads.useQuery(
  //   { exhibitionId, page: 1, limit: 50 },
  //   { enabled: activeTab === 'leads' }
  // );
  const leadsData = { leads: [], pagination: { total: 0, pages: 0, currentPage: 1, perPage: 50 } };

  // Delete mutation
  const deleteMutation = api.exhibition.deleteExhibition.useMutation({
    onSuccess: () => {
      router.push('/dashboard/exhibitions');
    },
  });

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate({ id: exhibitionId });
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const getDaysUntil = (date: Date | string) => {
    const days = differenceInDays(new Date(date), new Date());
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `in ${days} days`;
  };

  const getStatusColor = (status: string) => {
    return status === 'CONFIRMED' ? 'emerald' : 'amber';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading exhibition details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !exhibition) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Exhibition</h3>
          <p className="text-red-600">{error?.message || 'Exhibition not found'}</p>
          <button
            onClick={() => router.push('/dashboard/exhibitions')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Exhibitions
          </button>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(exhibition.status);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard/exhibitions')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Exhibitions
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">{exhibition.name}</h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-100 text-${statusColor}-800`}
              >
                {exhibition.status}
              </span>
            </div>

            {exhibition.industry && (
              <p className="text-gray-600 mb-4">{exhibition.industry}</p>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <div>
                  <div className="text-xs text-gray-500">Dates</div>
                  <div className="font-medium">
                    {format(new Date(exhibition.startDate), 'MMM dd')} -{' '}
                    {format(new Date(exhibition.endDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <div>
                  <div className="text-xs text-gray-500">Starts</div>
                  <div className="font-medium">{getDaysUntil(exhibition.startDate)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Building2 size={18} />
                <div>
                  <div className="text-xs text-gray-500">Exhibitors</div>
                  <div className="font-medium">{0}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Users size={18} />
                <div>
                  <div className="text-xs text-gray-500">Leads</div>
                  <div className="font-medium">{exhibition?.leads?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit2 size={18} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showDeleteConfirm
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'border border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Trash2 size={18} />
              )}
              {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Venue Info */}
        {exhibition.venue && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-gray-400 mt-1" />
              <div>
                <div className="font-medium text-gray-900">{exhibition.venue.name}</div>
                <div className="text-gray-600 text-sm">
                  {exhibition.venue.address}
                  {exhibition.venue.city && `, ${exhibition.venue.city}`}
                  {exhibition.venue.country && `, ${exhibition.venue.country}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Website */}
        {exhibition.eventWebsite && (
          <div className="mt-4">
            <a
              href={exhibition.eventWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Globe size={18} />
              Visit Event Website
            </a>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 p-2">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'assets', label: 'Assets', icon: ImageIcon },
              { id: 'leads', label: 'Leads', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Exhibition Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Slug</div>
                    <div className="font-medium">{exhibition.slug}</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <div className="font-medium">{exhibition.status}</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Start Date</div>
                    <div className="font-medium">
                      {format(new Date(exhibition.startDate), 'MMMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">End Date</div>
                    <div className="font-medium">
                      {format(new Date(exhibition.endDate), 'MMMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </div>

              {exhibition.organizer && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Organizer</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="font-medium text-gray-900 mb-2">{exhibition.organizer.name}</div>
                    {exhibition.organizer.email && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                        <Mail size={16} />
                        {exhibition.organizer.email}
                      </div>
                    )}
                    {exhibition.organizer.phone && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Phone size={16} />
                        {exhibition.organizer.phone}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Assets Tab */}
          {activeTab === 'assets' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Exhibition Assets</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add Assets
                </button>
              </div>

              <div className="text-center py-12 border border-gray-200 rounded-lg">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600">No assets linked to this exhibition yet</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add First Asset
                </button>
              </div>
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Captured Leads</h3>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download size={18} />
                  Export CSV
                </button>
              </div>

              <div className="text-center py-12 border border-gray-200 rounded-lg">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600">No leads captured yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Share the public exhibition page to start capturing leads
                </p>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600">Analytics coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <ExhibitionFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        exhibitionId={exhibitionId}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
