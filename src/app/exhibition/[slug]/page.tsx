'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Globe,
  Loader2,
  Building2,
  Users,
  Mail,
  Phone,
  User,
  Briefcase,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';

export default function PublicExhibitionPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    interests: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch exhibition by slug
  const { data, isLoading, error } = api.exhibition.getExhibitionBySlug.useQuery({ slug });
  const exhibition = data?.exhibition;

  // Create lead mutation
  const createLeadMutation = api.exhibition.createLead.useMutation({
    onSuccess: () => {
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        interests: '',
      });
      setFormErrors({});
    },
    onError: (err) => {
      setFormErrors({ submit: err.message });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !exhibition) return;

    createLeadMutation.mutate({
      exhibitionId: exhibition.id,
      exhibitorId: exhibition.organizer?.id || exhibition.id, // Use organizer or exhibition ID as fallback
      contactName: formData.name.trim(),
      contactEmail: formData.email.trim(),
      contactPhone: formData.phone.trim(),
      contactRole: formData.jobTitle.trim() || undefined,
      notes: formData.interests.trim() || undefined,
      leadSource: 'PUBLIC_PAGE',
    });
  };

  const getDaysUntil = (date: Date | string) => {
    const days = differenceInDays(new Date(date), new Date());
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `in ${days} days`;
  };

  const getExhibitionStatus = () => {
    if (!exhibition) return null;
    const now = new Date();
    const start = new Date(exhibition.startDate);
    const end = new Date(exhibition.endDate);

    if (isPast(end)) {
      return { label: 'Ended', color: 'gray' };
    }
    if (isFuture(start)) {
      return { label: 'Upcoming', color: 'blue' };
    }
    return { label: 'Ongoing', color: 'green' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading exhibition...</p>
        </div>
      </div>
    );
  }

  if (error || !exhibition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Exhibition Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error?.message || 'The exhibition you are looking for does not exist or is no longer available.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const status = getExhibitionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-blue-600">
              KayanLive
            </a>
            <a
              href="/login"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            {/* Status Banner */}
            {status && (
              <div
                className={`px-6 py-3 text-center font-medium text-white ${
                  status.color === 'green'
                    ? 'bg-green-600'
                    : status.color === 'blue'
                    ? 'bg-blue-600'
                    : 'bg-gray-600'
                }`}
              >
                {status.label} Exhibition
              </div>
            )}

            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {exhibition.name}
                </h1>
                {exhibition.industry && (
                  <p className="text-xl text-gray-600">{exhibition.industry}</p>
                )}
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Dates</div>
                    <div className="font-semibold text-gray-900">
                      {format(new Date(exhibition.startDate), 'MMM dd')} -{' '}
                      {format(new Date(exhibition.endDate), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {getDaysUntil(exhibition.startDate)}
                    </div>
                  </div>
                </div>

                {exhibition.venue && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Location</div>
                      <div className="font-semibold text-gray-900">{exhibition.venue.name}</div>
                      <div className="text-sm text-gray-600">
                        {exhibition.venue.city}, {exhibition.venue.country}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Exhibitors</div>
                    <div className="font-semibold text-gray-900">
                      {(exhibition as any)._count?.exhibitors || 0}+ Companies
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Website */}
              {exhibition.eventWebsite && (
                <div className="text-center">
                  <a
                    href={exhibition.eventWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Globe size={20} />
                    Visit Official Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Lead Capture Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {submitSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Thank You!</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Your interest has been registered. We'll be in touch soon with more details.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Register Another Person
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Register Your Interest
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form below and we'll keep you updated about this exhibition
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={createLeadMutation.isPending}
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={createLeadMutation.isPending}
                        placeholder="john@company.com"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={createLeadMutation.isPending}
                        placeholder="+1 (555) 123-4567"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                          formErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        disabled={createLeadMutation.isPending}
                        placeholder="Company Name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        disabled={createLeadMutation.isPending}
                        placeholder="Marketing Manager"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What are you interested in?
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 text-gray-400" size={20} />
                      <textarea
                        value={formData.interests}
                        onChange={(e) => handleInputChange('interests', e.target.value)}
                        disabled={createLeadMutation.isPending}
                        placeholder="Tell us about your interests and what you're looking for..."
                        rows={4}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Submit Error */}
                  {formErrors.submit && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                      <p className="text-red-600 text-sm">{formErrors.submit}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={createLeadMutation.isPending}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {createLeadMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Register Interest
                        <ArrowRight size={24} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-600">
            <p className="mb-2">Powered by</p>
            <a href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              KayanLive
            </a>
            <p className="text-sm mt-2">Professional Exhibition & Lead Management</p>
          </div>
        </div>
      </div>
    </div>
  );
}
