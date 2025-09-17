'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { LeadStatus, Lead } from '@prisma/client';
import { format } from 'date-fns';

export default function LeadsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(undefined);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const { data: leadsData, refetch } = api.lead.getAll.useQuery({
    page: currentPage,
    limit: 10,
    status: statusFilter,
  });

  const { data: leadDetails } = api.lead.getById.useQuery(
    { id: selectedLead! },
    { enabled: !!selectedLead }
  );

  const updateLeadMutation = api.lead.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleStatusUpdate = async (leadId: string, status: LeadStatus) => {
    await updateLeadMutation.mutateAsync({ id: leadId, status });
  };

  const handleNotesUpdate = async (leadId: string, notes: string) => {
    await updateLeadMutation.mutateAsync({ id: leadId, notes });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
        <p className="text-gray-600">Manage and track your leads</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus || undefined)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="PROPOSAL_SENT">Proposal Sent</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
          <option value="NURTURING">Nurturing</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leads List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Leads ({leadsData?.total || 0})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {leadsData?.leads.map((lead) => (
                <LeadItem
                  key={lead.id}
                  lead={lead}
                  isSelected={selectedLead === lead.id}
                  onSelect={() => setSelectedLead(lead.id)}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {leadsData && leadsData.pages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                {Array.from({ length: leadsData.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lead Details */}
        <div className="lg:col-span-1">
          {selectedLead && leadDetails ? (
            <LeadDetails lead={leadDetails} onNotesUpdate={handleNotesUpdate} />
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-500 text-center">Select a lead to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LeadItem({ lead, isSelected, onSelect, onStatusUpdate }: {
  lead: Lead;
  isSelected: boolean;
  onSelect: () => void;
  onStatusUpdate: (id: string, status: LeadStatus) => void;
}) {
  const statusColors = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-yellow-100 text-yellow-800',
    QUALIFIED: 'bg-purple-100 text-purple-800',
    PROPOSAL_SENT: 'bg-indigo-100 text-indigo-800',
    WON: 'bg-green-100 text-green-800',
    LOST: 'bg-red-100 text-red-800',
    NURTURING: 'bg-orange-100 text-orange-800',
  };

  return (
    <div
      className={`p-6 cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900">{lead.fullName}</h4>
          <p className="text-sm text-gray-600">{lead.email}</p>
          {lead.organization && (
            <p className="text-sm text-gray-500">{lead.organization}</p>
          )}
          {lead.eventType && (
            <p className="text-sm text-gray-500">Event: {lead.eventType}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="ml-4">
          <select
            value={lead.status}
            onChange={(e) => {
              e.stopPropagation();
              onStatusUpdate(lead.id, e.target.value as LeadStatus);
            }}
            className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${
              statusColors[lead.status as keyof typeof statusColors]
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
            <option value="NURTURING">Nurturing</option>
          </select>
          {lead.isUrgent && (
            <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full" title="Urgent"></span>
          )}
        </div>
      </div>
    </div>
  );
}

function LeadDetails({ lead, onNotesUpdate }: {
  lead: Lead;
  onNotesUpdate: (id: string, notes: string) => void;
}) {
  const [notes, setNotes] = useState(lead.notes || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveNotes = () => {
    onNotesUpdate(lead.id, notes);
    setIsEditing(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Details</h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="text-sm text-gray-900">{lead.fullName}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="text-sm text-gray-900">{lead.email}</p>
        </div>

        {lead.phone && (
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-sm text-gray-900">{lead.phone}</p>
          </div>
        )}

        {lead.organization && (
          <div>
            <label className="text-sm font-medium text-gray-500">Organization</label>
            <p className="text-sm text-gray-900">{lead.organization}</p>
          </div>
        )}

        {lead.eventType && (
          <div>
            <label className="text-sm font-medium text-gray-500">Event Type</label>
            <p className="text-sm text-gray-900">{lead.eventType}</p>
          </div>
        )}

        {lead.budget && (
          <div>
            <label className="text-sm font-medium text-gray-500">Budget</label>
            <p className="text-sm text-gray-900">{lead.budget}</p>
          </div>
        )}

        {lead.goals && (
          <div>
            <label className="text-sm font-medium text-gray-500">Goals</label>
            <p className="text-sm text-gray-900">{lead.goals}</p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-500">Urgent</label>
          <p className="text-sm text-gray-900">{lead.isUrgent ? 'Yes' : 'No'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Source</label>
          <p className="text-sm text-gray-900">{lead.source}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Created</label>
          <p className="text-sm text-gray-900">
            {format(new Date(lead.createdAt), 'MMM dd, yyyy HH:mm')}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-500">Notes</label>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
            )}
          </div>
          {isEditing ? (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={4}
                placeholder="Add notes about this lead..."
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleSaveNotes}
                  className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setNotes(lead.notes || '');
                    setIsEditing(false);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {lead.notes || 'No notes added yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}