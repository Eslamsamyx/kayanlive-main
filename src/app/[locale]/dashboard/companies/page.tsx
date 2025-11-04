'use client';

import { useTranslations } from 'next-intl';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Building2, Users, FolderKanban, Package, Shield, CheckCircle2, XCircle } from 'lucide-react';

export default function ClientCompaniesPage() {
  const t = useTranslations('dashboard');
  const { data: session, status } = useSession();

  const { data: companiesData, isLoading, error } = api.company.getMyCompanies.useQuery();

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your companies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Companies</h3>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const companies = companiesData || [];

  // Calculate stats
  const totalCompanies = companies.length;
  const organizationCount = companies.filter(c => c.type === 'ORGANIZATION').length;
  const personalCount = companies.filter(c => c.type === 'PERSONAL').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Companies</h1>
          <p className="text-gray-600 mt-2">
            View companies you belong to and your roles
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Companies</div>
              <div className="text-3xl font-bold text-gray-900">{totalCompanies}</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Organizations</div>
              <div className="text-3xl font-bold text-purple-600">{organizationCount}</div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Personal</div>
              <div className="text-3xl font-bold text-green-600">{personalCount}</div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Companies List */}
      {companies.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Building2 className="mx-auto h-16 w-16" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No companies yet
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't been assigned to any companies yet. Contact your administrator.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {companies.map((companyUser) => (
            <div
              key={companyUser.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Company Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {companyUser.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {companyUser.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          companyUser.myRole === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                          companyUser.myRole === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                          companyUser.myRole === 'MEMBER' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {companyUser.myRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {companyUser.industry && (
                      <div>
                        <p className="text-sm text-gray-500">Industry</p>
                        <p className="text-gray-900 font-medium">{companyUser.industry}</p>
                      </div>
                    )}
                    {companyUser.email && (
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-900 font-medium">{companyUser.email}</p>
                      </div>
                    )}
                    {companyUser.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900 font-medium">{companyUser.phone}</p>
                      </div>
                    )}
                    {companyUser.city && (
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-gray-900 font-medium">
                          {companyUser.city}, {companyUser.country}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Permissions */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Your Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        companyUser.permissions.canCreateProjects
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {companyUser.permissions.canCreateProjects ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>Create Projects</span>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        companyUser.permissions.canManageUsers
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {companyUser.permissions.canManageUsers ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>Manage Users</span>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        companyUser.permissions.canManageAssets
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {companyUser.permissions.canManageAssets ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>Manage Assets</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-500 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{companyUser._count.users} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4" />
                      <span>{companyUser._count.projects} projects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>{companyUser._count.assets} assets</span>
                    </div>
                  </div>
                </div>

                {/* View Projects Button */}
                <Link
                  href={`/dashboard/projects?companyId=${companyUser.id}`}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  View Projects →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
