'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/trpc/react';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  Edit3,
  Trash2,
  X,
  Loader2,
  FileText,
  Check,
  Video,
} from 'lucide-react';
import { format, isFuture, isPast, isToday } from 'date-fns';

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  location: string | null;
  agenda: string | null;
  minutes: string | null;
  attendees: Array<{
    id: string;
    name: string | null;
    email: string;
  }>;
  _count: {
    attendees: number;
  };
}

export function MeetingsSection({ projectId }: { projectId: string }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const utils = api.useUtils();

  const { data: meetings = [], refetch } = api.meeting.list.useQuery({
    projectId,
    upcoming: false,
  });

  const deleteMutation = api.meeting.delete.useMutation({
    onSuccess: () => {
      utils.meeting.list.invalidate();
    },
  });

  const handleDelete = (meetingId: string) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      deleteMutation.mutate({ id: meetingId });
    }
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.startTime);
    if (viewFilter === 'upcoming') return isFuture(meetingDate) || isToday(meetingDate);
    if (viewFilter === 'past') return isPast(meetingDate) && !isToday(meetingDate);
    return true;
  });

  const getMeetingStatus = (meeting: Meeting) => {
    const now = new Date();
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);

    if (now >= start && now <= end) {
      return { label: 'In Progress', color: 'text-green-400', bg: 'bg-green-500/20' };
    } else if (isFuture(start)) {
      return { label: 'Upcoming', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    } else {
      return { label: 'Completed', color: 'text-gray-400', bg: 'bg-gray-500/20' };
    }
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Meetings
          </h2>
          <p className="text-[#888888] text-sm">
            {filteredMeetings.length} {filteredMeetings.length === 1 ? 'meeting' : 'meetings'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          <Plus size={16} />
          Schedule Meeting
        </button>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'upcoming', 'past'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setViewFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              viewFilter === filter
                ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b]'
                : 'bg-white/10 text-[#888888] hover:text-white'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[25px] p-12 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(122, 253, 214, 0.2)',
            }}
          >
            <Calendar className="mx-auto mb-4 text-[#7afdd6]" size={48} />
            <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
              No {viewFilter === 'all' ? '' : viewFilter} meetings scheduled
            </p>
          </motion.div>
        ) : (
          filteredMeetings.map((meeting, index) => {
            const status = getMeetingStatus(meeting);

            return (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-[25px] p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(122, 253, 214, 0.2)',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{meeting.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    {meeting.description && (
                      <p className="text-sm text-white/60">{meeting.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingMeeting(meeting)}
                      className="p-2 text-[#888888] hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(meeting.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Calendar size={16} className="text-[#7afdd6]" />
                    <span>{format(new Date(meeting.startTime), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Clock size={16} className="text-[#7afdd6]" />
                    <span>
                      {format(new Date(meeting.startTime), 'HH:mm')} -{' '}
                      {format(new Date(meeting.endTime), 'HH:mm')}
                    </span>
                  </div>
                  {meeting.location && (
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      {meeting.location.toLowerCase().includes('zoom') ||
                      meeting.location.toLowerCase().includes('meet') ||
                      meeting.location.toLowerCase().includes('teams') ? (
                        <Video size={16} className="text-[#7afdd6]" />
                      ) : (
                        <MapPin size={16} className="text-[#7afdd6]" />
                      )}
                      <span>{meeting.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Users size={16} className="text-[#7afdd6]" />
                    <span>{meeting._count.attendees} attendees</span>
                  </div>
                </div>

                {/* Attendees */}
                {meeting.attendees && meeting.attendees.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Attendees:</h4>
                    <div className="flex flex-wrap gap-2">
                      {meeting.attendees.slice(0, 5).map((attendee) => (
                        <div
                          key={attendee.id}
                          className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full"
                        >
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7afdd6] to-[#b8a4ff] flex items-center justify-center text-xs font-semibold text-[#2c2c2b]">
                            {attendee.name?.[0] || attendee.email[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-white">{attendee.name || attendee.email}</span>
                        </div>
                      ))}
                      {meeting.attendees.length > 5 && (
                        <div className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/60">
                          +{meeting.attendees.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Agenda */}
                {meeting.agenda && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <FileText size={14} />
                      Agenda:
                    </h4>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm text-white/80 whitespace-pre-wrap">{meeting.agenda}</p>
                    </div>
                  </div>
                )}

                {/* Minutes */}
                {meeting.minutes && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Check size={14} className="text-green-400" />
                      Meeting Minutes:
                    </h4>
                    <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                      <p className="text-sm text-white/80 whitespace-pre-wrap">{meeting.minutes}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create/Edit Meeting Modal */}
      {(isCreateModalOpen || editingMeeting) && (
        <CreateMeetingModal
          isOpen={isCreateModalOpen || !!editingMeeting}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingMeeting(null);
          }}
          projectId={projectId}
          meeting={editingMeeting}
          onSuccess={() => {
            utils.meeting.list.invalidate();
            setIsCreateModalOpen(false);
            setEditingMeeting(null);
          }}
        />
      )}
    </div>
  );
}

// Create Meeting Modal Component
function CreateMeetingModal({
  isOpen,
  onClose,
  projectId,
  meeting,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  meeting: Meeting | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: meeting?.title || '',
    description: meeting?.description || '',
    startTime: meeting?.startTime ? new Date(meeting.startTime) : new Date(),
    endTime: meeting?.endTime ? new Date(meeting.endTime) : new Date(Date.now() + 3600000),
    location: meeting?.location || '',
    agenda: meeting?.agenda || '',
    minutes: meeting?.minutes || '',
  });

  const createMutation = api.meeting.create.useMutation({
    onSuccess: () => onSuccess(),
  });

  const updateMutation = api.meeting.update.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (meeting) {
      updateMutation.mutate({
        id: meeting.id,
        ...formData,
      });
    } else {
      createMutation.mutate({
        projectId,
        ...formData,
        attendeeIds: [], // You can add attendee selector later
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-[25px] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(44, 44, 43, 0.95)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {meeting ? 'Edit Meeting' : 'Schedule Meeting'}
              </h2>
              <button onClick={onClose} className="p-2 text-[#888888] hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#888888] mb-2">
                  Meeting Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Enter meeting title"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Enter meeting description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#888888] mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={format(formData.startTime, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setFormData({ ...formData, startTime: new Date(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#888888] mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={format(formData.endTime, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setFormData({ ...formData, endTime: new Date(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="e.g., Conference Room A or Zoom link"
                />
              </div>

              <div>
                <label className="block text-sm text-[#888888] mb-2">Agenda</label>
                <textarea
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                  placeholder="Enter meeting agenda..."
                />
              </div>

              {meeting && (
                <div>
                  <label className="block text-sm text-[#888888] mb-2">Meeting Minutes</label>
                  <textarea
                    value={formData.minutes}
                    onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7afdd6]"
                    placeholder="Enter meeting minutes..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-[#2c2c2b] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin mx-auto" />
                  ) : meeting ? (
                    'Save Changes'
                  ) : (
                    'Schedule Meeting'
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
