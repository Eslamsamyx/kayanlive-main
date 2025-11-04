'use client';

import { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { X, Calendar, Globe, Building2, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ExhibitionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  exhibitionId?: string;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  slug: string;
  industry: string;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'tentative';
  eventWebsite: string;
}

export default function ExhibitionFormModal({
  isOpen,
  onClose,
  exhibitionId,
  onSuccess,
}: ExhibitionFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    industry: '',
    startDate: '',
    endDate: '',
    status: 'tentative',
    eventWebsite: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  const utils = api.useUtils();

  // Fetch exhibition data if editing
  const { data, isLoading: loadingExhibition } = api.exhibition.getExhibitionById.useQuery(
    { id: exhibitionId! },
    { enabled: !!exhibitionId }
  );
  const exhibition = data?.exhibition;

  // Create mutation
  const createMutation = api.exhibition.createExhibition.useMutation({
    onSuccess: () => {
      utils.exhibition.listExhibitions.invalidate();
      onSuccess?.();
      onClose();
      resetForm();
    },
    onError: (error) => {
      setErrors({ name: error.message });
    },
  });

  // Update mutation
  const updateMutation = api.exhibition.updateExhibition.useMutation({
    onSuccess: () => {
      utils.exhibition.listExhibitions.invalidate();
      utils.exhibition.getExhibitionById.invalidate({ id: exhibitionId });
      onSuccess?.();
      onClose();
      resetForm();
    },
    onError: (error) => {
      setErrors({ name: error.message });
    },
  });

  // Load exhibition data for editing
  useEffect(() => {
    if (exhibition) {
      setFormData({
        name: exhibition.name,
        slug: exhibition.slug,
        industry: exhibition.industry || '',
        startDate: format(new Date(exhibition.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(exhibition.endDate), 'yyyy-MM-dd'),
        status: exhibition.status.toLowerCase() as 'confirmed' | 'tentative',
        eventWebsite: exhibition.eventWebsite || '',
      });
      setAutoGenerateSlug(false);
    }
  }, [exhibition]);

  // Auto-generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: autoGenerateSlug ? generateSlug(value) : prev.slug,
    }));
    setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleSlugChange = (value: string) => {
    setAutoGenerateSlug(false);
    setFormData((prev) => ({ ...prev, slug: value }));
    setErrors((prev) => ({ ...prev, slug: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Exhibition name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.eventWebsite && !isValidUrl(formData.eventWebsite)) {
      newErrors.eventWebsite = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      industry: formData.industry.trim() || undefined,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      status: formData.status as 'confirmed' | 'tentative',
      eventWebsite: formData.eventWebsite.trim() || undefined,
    };

    if (exhibitionId) {
      updateMutation.mutate({ id: exhibitionId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      industry: '',
      startDate: '',
      endDate: '',
      status: 'tentative',
      eventWebsite: '',
    });
    setErrors({});
    setAutoGenerateSlug(true);
  };

  const handleClose = () => {
    if (!createMutation.isPending && !updateMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending || loadingExhibition;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {exhibitionId ? 'Edit Exhibition' : 'Create New Exhibition'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Exhibition Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exhibition Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isLoading}
              placeholder="e.g., CES 2025"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                disabled={isLoading}
                placeholder="ces-2025"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {autoGenerateSlug && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Auto-generated
                </span>
              )}
            </div>
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.slug}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
            </p>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 size={16} className="inline mr-1" />
              Industry
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
              disabled={isLoading}
              placeholder="e.g., Technology, Healthcare, Automotive"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }));
                  setErrors((prev) => ({ ...prev, startDate: undefined }));
                }}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }));
                  setErrors((prev) => ({ ...prev, endDate: undefined }));
                }}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: 'tentative' }))}
                disabled={isLoading}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  formData.status === 'tentative'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-300 hover:border-amber-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Tentative
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: 'confirmed' }))}
                disabled={isLoading}
                className={`px-4 py-3 border-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  formData.status === 'confirmed'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-300 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Confirmed
                </div>
              </button>
            </div>
          </div>

          {/* Event Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe size={16} className="inline mr-1" />
              Event Website
            </label>
            <input
              type="url"
              value={formData.eventWebsite}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, eventWebsite: e.target.value }));
                setErrors((prev) => ({ ...prev, eventWebsite: undefined }));
              }}
              disabled={isLoading}
              placeholder="https://example.com"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.eventWebsite ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.eventWebsite && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.eventWebsite}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {exhibitionId ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{exhibitionId ? 'Update Exhibition' : 'Create Exhibition'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
