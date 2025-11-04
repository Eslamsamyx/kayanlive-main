'use client';

import { api } from '@/trpc/react';
import Link from 'next/link';
import { CalendarDays, Clock, Users, MapPin, ArrowRight, Video } from 'lucide-react';

export function UpcomingMeetingsWidget() {
  const { data: meetings, isLoading } = api.meeting.list.useQuery({
    upcoming: true,
  });

  const displayMeetings = meetings?.slice(0, 3) || [];

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const meetingDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (meetingDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (meetingDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return meetingDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const isSoon = (date: Date) => {
    const now = new Date();
    const meetingTime = new Date(date);
    const diffInMinutes = (meetingTime.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes > 0 && diffInMinutes <= 60; // Within next hour
  };

  return (
    <div className="bg-[#2c2c2b] rounded-xl shadow-lg border border-[#333] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#7afdd6]" />
          Upcoming Meetings
        </h2>
        <Link
          href="/en/dashboard/meetings"
          className="text-[#7afdd6] hover:text-[#6ee8c5] text-sm font-semibold flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7afdd6] mx-auto"></div>
        </div>
      ) : displayMeetings.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="w-12 h-12 text-[#666] mx-auto mb-3" />
          <p className="text-[#b2b2b2]">No upcoming meetings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`p-4 rounded-lg border transition-all ${
                isSoon(meeting.startTime)
                  ? 'border-[#7afdd6] bg-[#7afdd6]/5'
                  : 'border-[#333] bg-[#1a1a19]'
              }`}
            >
              {isSoon(meeting.startTime) && (
                <div className="mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#7afdd6] rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-[#7afdd6] uppercase tracking-wide">
                    Starting Soon
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1 text-sm">
                    {meeting.title}
                  </h3>
                  {meeting.project && (
                    <p className="text-xs text-[#666]">{meeting.project.name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#b2b2b2]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-[#666]" />
                  <span>
                    {formatDate(meeting.startTime)} at {formatTime(meeting.startTime)}
                  </span>
                </div>

                {meeting.location && (
                  <div className="flex items-center gap-2">
                    {meeting.location.startsWith('http') ? (
                      <Video className="w-3 h-3 text-[#666]" />
                    ) : (
                      <MapPin className="w-3 h-3 text-[#666]" />
                    )}
                    <span className="truncate">{meeting.location}</span>
                  </div>
                )}

                {meeting._count && meeting._count.attendees > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-[#666]" />
                    <span>{meeting._count.attendees} attendees</span>
                  </div>
                )}
              </div>

              {isSoon(meeting.startTime) && meeting.location?.startsWith('http') && (
                <a
                  href={meeting.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all font-semibold text-xs"
                >
                  <Video className="w-4 h-4" />
                  Join Meeting
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
