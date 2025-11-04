'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { LeadStatus, Lead } from '@prisma/client';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Edit3, Calendar, Mail, Phone, Building } from 'lucide-react';
import Dropdown, { DropdownOption } from '@/components/ui/Dropdown';

export default function LeadsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: leadsData, refetch } = api.lead.getAll.useQuery({
    page: currentPage,
    limit: 10,
    status: statusFilter === 'ALL' ? undefined : (statusFilter as LeadStatus),
  });

  const { data: companiesData } = api.company.getAll.useQuery({
    page: 1,
    limit: 100,
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

  const handleCompanyUpdate = async (leadId: string, companyId: string | null) => {
    await updateLeadMutation.mutateAsync({ id: leadId, companyId });
  };

  const statusOptions: DropdownOption[] = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'NEW', label: 'New' },
    { value: 'CONTACTED', label: 'Contacted' },
    { value: 'QUALIFIED', label: 'Qualified' },
    { value: 'PROPOSAL_SENT', label: 'Proposal Sent' },
    { value: 'WON', label: 'Won' },
    { value: 'LOST', label: 'Lost' },
    { value: 'NURTURING', label: 'Nurturing' }
  ];

  const companyOptions: DropdownOption[] = [
    { value: 'ALL', label: 'All Companies' },
    { value: 'NONE', label: 'Unassigned' },
    ...(companiesData?.companies.map(company => ({
      value: company.id,
      label: company.name,
    })) || []),
  ];

  const filteredLeads = leadsData?.leads.filter(lead => {
    const matchesSearch = lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.organization && lead.organization.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCompany = companyFilter === 'ALL' ||
      (companyFilter === 'NONE' && !lead.companyId) ||
      lead.companyId === companyFilter;

    return matchesSearch && matchesCompany;
  }) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1
          className="text-4xl md:text-6xl font-normal mb-4 capitalize"
          style={{
            background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '"Poppins", sans-serif',
            lineHeight: '1.1'
          }}
        >
          Lead Management
        </h1>
        <p className="text-[#888888] text-lg">Manage and track your leads with precision</p>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888888]" size={20} />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent transition-all duration-300"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Dropdown
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
            options={statusOptions}
            placeholder="Filter by status"
            variant="filter"
            icon={<Filter size={20} />}
            className="min-w-[200px]"
          />
          <Dropdown
            value={companyFilter}
            onValueChange={(value) => setCompanyFilter(value)}
            options={companyOptions}
            placeholder="Filter by company"
            variant="filter"
            icon={<Building size={20} />}
            className="min-w-[200px]"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leads List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div
            className="rounded-[25px] overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)'
            }}
          >
            <div className="px-6 py-4 border-b border-[#7afdd6]/20">
              <h3 className="text-lg font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Leads ({filteredLeads.length})
              </h3>
            </div>
            <div className="divide-y divide-[#7afdd6]/10">
              {filteredLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <LeadItem
                    lead={lead}
                    isSelected={selectedLead === lead.id}
                    onSelect={() => setSelectedLead(lead.id)}
                    onStatusUpdate={handleStatusUpdate}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {leadsData && leadsData.pages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 flex justify-center"
            >
              <div className="flex gap-2">
                {Array.from({ length: leadsData.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] font-semibold'
                        : 'bg-white/10 text-[#888888] hover:bg-white/20 hover:text-[#7afdd6]'
                    }`}
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Lead Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-1"
        >
          {selectedLead && leadDetails ? (
            <LeadDetails
              lead={leadDetails}
              onNotesUpdate={handleNotesUpdate}
              onCompanyUpdate={handleCompanyUpdate}
              companies={companiesData?.companies || []}
            />
          ) : (
            <div
              className="rounded-[25px] p-8 text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                backdropFilter: 'blur(50.5px)',
                WebkitBackdropFilter: 'blur(50.5px)',
                border: '2px solid rgba(122, 253, 214, 0.3)'
              }}
            >
              <Eye className="mx-auto mb-4 text-[#7afdd6]" size={48} />
              <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                Select a lead to view details
              </p>
            </div>
          )}
        </motion.div>
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
    NEW: 'from-blue-400 to-blue-600',
    CONTACTED: 'from-yellow-400 to-yellow-600',
    QUALIFIED: 'from-purple-400 to-purple-600',
    PROPOSAL_SENT: 'from-indigo-400 to-indigo-600',
    WON: 'from-green-400 to-green-600',
    LOST: 'from-red-400 to-red-600',
    NURTURING: 'from-orange-400 to-orange-600',
  };

  const leadStatusOptions: DropdownOption[] = [
    { value: 'NEW', label: 'New' },
    { value: 'CONTACTED', label: 'Contacted' },
    { value: 'QUALIFIED', label: 'Qualified' },
    { value: 'PROPOSAL_SENT', label: 'Proposal Sent' },
    { value: 'WON', label: 'Won' },
    { value: 'LOST', label: 'Lost' },
    { value: 'NURTURING', label: 'Nurturing' }
  ];

  return (
    <div
      className={`p-6 cursor-pointer transition-all duration-300 relative overflow-hidden ${
        isSelected ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7afdd6] to-[#b8a4ff]" />
      )}

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-medium text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {lead.fullName}
            </h4>
            {lead.isUrgent && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Urgent" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-[#888888]">
              <Mail size={14} />
              <span>{lead.email}</span>
            </div>

            {lead.phone && (
              <div className="flex items-center gap-2 text-sm text-[#888888]">
                <Phone size={14} />
                <span>{lead.phone}</span>
              </div>
            )}

            {lead.organization && (
              <div className="flex items-center gap-2 text-sm text-[#888888]">
                <Building size={14} />
                <span>{lead.organization}</span>
              </div>
            )}

            {(lead as any).company && (
              <div className="flex items-center gap-2 text-sm text-[#7afdd6]">
                <Building size={14} />
                <span>Company: {(lead as any).company.name}</span>
              </div>
            )}

            {lead.eventType && (
              <div className="text-sm text-[#7afdd6]">
                Event: {lead.eventType}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 text-xs text-[#888888]">
            <Calendar size={12} />
            <span>{format(new Date(lead.createdAt), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        <div className="ml-4">
          <div
            className={`bg-gradient-to-r ${
              statusColors[lead.status as keyof typeof statusColors]
            } rounded-full p-[1px]`}
            onClick={(e) => e.stopPropagation()}
          >
            <Dropdown
              value={lead.status}
              onValueChange={(value) => {
                onStatusUpdate(lead.id, value as LeadStatus);
              }}
              options={leadStatusOptions}
              variant="status"
              size="sm"
              className="bg-transparent border-0 text-white rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadDetails({ lead, onNotesUpdate, onCompanyUpdate, companies }: {
  lead: Lead & { company?: { id: string; name: string; type: string } | null };
  onNotesUpdate: (id: string, notes: string) => void;
  onCompanyUpdate: (id: string, companyId: string | null) => void;
  companies: Array<{ id: string; name: string }>;
}) {
  const [notes, setNotes] = useState(lead.notes || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveNotes = () => {
    onNotesUpdate(lead.id, notes);
    setIsEditing(false);
  };

  const handleCompanyChange = (companyId: string) => {
    onCompanyUpdate(lead.id, companyId === 'NONE' ? null : companyId);
  };

  return (
    <div
      className="rounded-[25px] p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(50.5px)',
        WebkitBackdropFilter: 'blur(50.5px)',
        border: '2px solid rgba(122, 253, 214, 0.3)'
      }}
    >
      <h3 className="text-lg font-medium text-[#7afdd6] mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
        Lead Details
      </h3>

      <div className="space-y-4">
        <DetailField label="Name" value={lead.fullName} />
        <DetailField label="Email" value={lead.email} />

        {lead.phone && <DetailField label="Phone" value={lead.phone} />}
        {lead.organization && <DetailField label="Organization" value={lead.organization} />}

        {/* Company Assignment */}
        <div>
          <label className="text-sm font-medium text-[#7afdd6] block mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Assigned Company
          </label>
          <select
            value={lead.company?.id || 'NONE'}
            onChange={(e) => handleCompanyChange(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent transition-all duration-300"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            <option value="NONE" className="bg-[#2c2c2b]">No Company Assigned</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id} className="bg-[#2c2c2b]">
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {lead.eventType && <DetailField label="Event Type" value={lead.eventType} />}
        {lead.budget && <DetailField label="Budget" value={lead.budget} />}
        {lead.goals && <DetailField label="Goals" value={lead.goals} />}

        <DetailField label="Urgent" value={lead.isUrgent ? 'Yes' : 'No'} />
        <DetailField label="Source" value={lead.source} />
        <DetailField
          label="Created"
          value={format(new Date(lead.createdAt), 'MMM dd, yyyy HH:mm')}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-[#7afdd6]" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Notes
            </label>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs text-[#888888] hover:text-[#7afdd6] transition-colors duration-200"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                <Edit3 size={12} />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent transition-all duration-300"
                rows={4}
                placeholder="Add notes about this lead..."
                style={{ fontFamily: '"Poppins", sans-serif' }}
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] text-xs rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setNotes(lead.notes || '');
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-white/10 text-[#888888] text-xs rounded-xl hover:bg-white/20 hover:text-white transition-all duration-300"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white whitespace-pre-wrap p-3 bg-white/5 rounded-xl border border-white/10" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {lead.notes || 'No notes added yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-[#7afdd6] block mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
        {label}
      </label>
      <p className="text-sm text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
        {value}
      </p>
    </div>
  );
}