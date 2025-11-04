'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Video,
  FolderKanban,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

type FilterType = 'ALL' | 'UPCOMING' | 'PAST' | 'TODAY';

export default function MeetingsPage() {
  const { data: session, status } = useSession();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('UPCOMING');

  // Fetch all meetings
  const { data: meetings, isLoading, error } = api.meeting.list.useQuery({ upcoming: false });

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7afdd6] mx-auto mb-4"></div>
          <p className="text-[#b2b2b2]">Loading meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a19] p-6">
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Meetings</h3>
          <p className="text-[#b2b2b2]">{error.message}</p>
        </div>
      </div>
    );
  }

  const allMeetings = meetings || [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  // Filter meetings
  const filteredMeetings = useMemo(() => {
    return allMeetings.filter((meeting) => {
      const meetingDate = new Date(meeting.startTime);

      switch (selectedFilter) {
        case 'UPCOMING':
          return meetingDate >= now;
        case 'PAST':
          return meetingDate < now;
        case 'TODAY':
          return meetingDate >= todayStart && meetingDate < todayEnd;
        case 'ALL':
        default:
          return true;
      }
    });
  }, [allMeetings, selectedFilter, now, todayStart, todayEnd]);

  // Calculate stats
  const stats = useMemo(() => {
    const upcoming = allMeetings.filter((m) => new Date(m.startTime) >= now).length;
    const today = allMeetings.filter((m) => {
      const meetingDate = new Date(m.startTime);
      return meetingDate >= todayStart && meetingDate < todayEnd;
    }).length;
    const past = allMeetings.filter((m) => new Date(m.startTime) < now).length;

    return {
      total: allMeetings.length,
      upcoming,
      today,
      past,
    };
  }, [allMeetings, now, todayStart, todayEnd]);

  const filterOptions: Array<{ label: string; value: FilterType; count: number }> = [
    { label: 'Upcoming', value: 'UPCOMING', count: stats.upcoming },
    { label: 'Today', value: 'TODAY', count: stats.today },
    { label: 'Past', value: 'PAST', count: stats.past },
    { label: 'All', value: 'ALL', count: stats.total },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a19] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meetings & Schedule</h1>
          <p className="text-[#b2b2b2] text-lg">
            View and manage your meetings calendar
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Meetings"
            value={stats.total}
            icon={<CalendarDays className="w-6 h-6" />}
            color="text-[#7afdd6]"
            bgColor="bg-[#7afdd6]/10"
          />
          <StatCard
            title="Today"
            value={stats.today}
            icon={<Calendar className="w-6 h-6" />}
            color="text-blue-400"
            bgColor="bg-blue-400/10"
          />
          <StatCard
            title="Upcoming"
            value={stats.upcoming}
            icon={<Clock className="w-6 h-6" />}
            color="text-green-400"
            bgColor="bg-green-400/10"
          />
          <StatCard
            title="Completed"
            value={stats.past}
            icon={<CheckCircle2 className="w-6 h-6" />}
            color="text-gray-400"
            bgColor="bg-gray-400/10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-[#7afdd6]" />
            <h3 className="text-sm font-semibold text-[#b2b2b2]">Filter Meetings</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedFilter === option.value
                    ? 'bg-[#7afdd6] text-[#2c2c2b]'
                    : 'bg-[#1a1a19] text-[#b2b2b2] hover:bg-[#333] border border-[#333]'
                }`}
              >
                {option.label}
                <span className="ml-2 opacity-75">({option.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Meetings List */}
        {filteredMeetings.length === 0 ? (
          <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-12 text-center">
            <CalendarDays className="w-16 h-16 text-[#666] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No meetings found</h3>
            <p className="text-[#b2b2b2]">
              {selectedFilter !== 'ALL'
                ? 'Try adjusting your filters to see more meetings'
                : 'You don\'t have any meetings scheduled'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6 hover:border-[#7afdd6] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <div className={color}>{icon}</div>
        </div>
      </div>
      <div>
        <p className="text-[#b2b2b2] text-sm font-semibold mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

// Meeting Card Component
function MeetingCard({ meeting }: { meeting: any }) {
  const meetingDate = new Date(meeting.startTime);
  const endDate = meeting.endTime ? new Date(meeting.endTime) : null;
  const now = new Date();
  const isPast = meetingDate < now;
  const isToday =
    meetingDate.getDate() === now.getDate() &&
    meetingDate.getMonth() === now.getMonth() &&
    meetingDate.getFullYear() === now.getFullYear();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-900/30 text-blue-400 border-blue-700';
      case 'COMPLETED':
        return 'bg-green-900/30 text-green-400 border-green-700';
      case 'CANCELLED':
        return 'bg-red-900/30 text-red-400 border-red-700';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Clock className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6 hover:shadow-xl hover:border-[#7afdd6] transition-all">
      <div className="flex items-start gap-4">
        {/* Date Badge */}
        <div className="flex-shrink-0">
          <div className="bg-[#1a1a19] border border-[#333] rounded-lg p-3 text-center min-w-[70px]">
            <div className="text-[#7afdd6] text-xs font-bold uppercase">
              {meetingDate.toLocaleDateString('en-US', { month: 'short' })}
            </div>
            <div className="text-white text-2xl font-bold">
              {meetingDate.getDate()}
            </div>
            <div className="text-[#666] text-xs">
              {meetingDate.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
          </div>
        </div>

        {/* Meeting Details */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                {meeting.title}
              </h3>
              {meeting.description && (
                <p className="text-[#b2b2b2] text-sm line-clamp-2">
                  {meeting.description}
                </p>
              )}
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border flex-shrink-0 flex items-center gap-1.5 ${getStatusColor(
                meeting.status
              )}`}
            >
              {getStatusIcon(meeting.status)}
              {meeting.status}
            </span>
          </div>

          {/* Meeting Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Time */}
            <div className="flex items-center gap-2 text-sm text-[#b2b2b2]">
              <Clock className="w-4 h-4 text-[#7afdd6]" />
              <span>
                {meetingDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
                {endDate && (
                  <>
                    {' - '}
                    {endDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </>
                )}
              </span>
              {isToday && !isPast && (
                <span className="ml-2 px-2 py-0.5 bg-[#7afdd6] text-[#2c2c2b] text-xs font-bold rounded">
                  TODAY
                </span>
              )}
            </div>

            {/* Attendees */}
            {meeting.attendees && meeting.attendees.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-[#b2b2b2]">
                <Users className="w-4 h-4 text-[#7afdd6]" />
                <span>
                  {meeting._count?.attendees || meeting.attendees.length} attendee
                  {(meeting._count?.attendees || meeting.attendees.length) !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Location */}
            {meeting.location && (
              <div className="flex items-center gap-2 text-sm text-[#b2b2b2]">
                {meeting.isVirtual ? (
                  <Video className="w-4 h-4 text-[#7afdd6]" />
                ) : (
                  <MapPin className="w-4 h-4 text-[#7afdd6]" />
                )}
                <span className="truncate">{meeting.location}</span>
              </div>
            )}

            {/* Project */}
            {meeting.project && (
              <Link
                href={`/en/dashboard/projects/${meeting.project.id}`}
                className="flex items-center gap-2 text-sm text-[#999] hover:text-[#7afdd6] transition-colors"
              >
                <FolderKanban className="w-4 h-4" />
                <span className="truncate">{meeting.project.name}</span>
              </Link>
            )}
          </div>

          {/* Attendees List (if small number) */}
          {meeting.attendees && meeting.attendees.length > 0 && meeting.attendees.length <= 3 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {meeting.attendees.map((attendee: any) => (
                <div
                  key={attendee.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a19] rounded-lg border border-[#333]"
                >
                  {attendee.image ? (
                    <img
                      src={attendee.image}
                      alt={attendee.name || attendee.email}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#7afdd6] flex items-center justify-center text-[#2c2c2b] text-xs font-bold">
                      {(attendee.name || attendee.email)[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-[#b2b2b2]">
                    {attendee.name || attendee.email}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Meeting Link */}
          {meeting.meetingLink && (
            <div className="mt-3">
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all font-semibold text-sm"
              >
                <Video className="w-4 h-4" />
                Join Meeting
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
