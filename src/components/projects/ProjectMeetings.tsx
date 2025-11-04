'use client';

import { api } from '@/trpc/react';
import { Calendar, Clock, MapPin, Users, Video, CalendarDays } from 'lucide-react';

interface ProjectMeetingsProps {
  projectId: string;
}

export function ProjectMeetings({ projectId }: ProjectMeetingsProps) {
  const { data: meetings, isLoading } = api.meeting.list.useQuery({
    projectId,
  });

  const now = new Date();
  const upcomingMeetings = meetings?.filter(m => new Date(m.startTime) >= now) || [];
  const pastMeetings = meetings?.filter(m => new Date(m.startTime) < now) || [];

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
        year: 'numeric',
      });
    }
  };

  const isSoon = (date: Date) => {
    const diffInMinutes = (new Date(date).getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes > 0 && diffInMinutes <= 60;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7afdd6] mx-auto"></div>
        <p className="text-[#b2b2b2] mt-4">Loading meetings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Meetings */}
      <div className="bg-[#2c2c2b] rounded-xl p-6 border border-[#333]">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#7afdd6]" />
          Upcoming Meetings
        </h3>

        {upcomingMeetings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-[#666] mx-auto mb-3" />
            <p className="text-[#b2b2b2]">No upcoming meetings scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => {
              const soon = isSoon(meeting.startTime);

              return (
                <div
                  key={meeting.id}
                  className={`p-4 rounded-lg border transition-all ${
                    soon
                      ? 'border-[#7afdd6] bg-[#7afdd6]/5'
                      : 'border-[#333] bg-[#1a1a19] hover:border-[#7afdd6]/50'
                  }`}
                >
                  {soon && (
                    <div className="mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#7afdd6] rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-[#7afdd6] uppercase tracking-wide">
                        Starting Soon
                      </span>
                    </div>
                  )}

                  <h4 className="text-white font-semibold mb-3">{meeting.title}</h4>

                  {meeting.description && (
                    <p className="text-sm text-[#b2b2b2] mb-3">{meeting.description}</p>
                  )}

                  <div className="space-y-2 text-sm text-[#b2b2b2]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#7afdd6]" />
                      <span>
                        {formatDate(meeting.startTime)} at {formatTime(meeting.startTime)}
                      </span>
                    </div>

                    {meeting.endTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#7afdd6]" />
                        <span>Until {formatTime(meeting.endTime)}</span>
                      </div>
                    )}

                    {meeting.location && (
                      <div className="flex items-center gap-2">
                        {meeting.location.startsWith('http') ? (
                          <Video className="w-4 h-4 text-[#7afdd6]" />
                        ) : (
                          <MapPin className="w-4 h-4 text-[#7afdd6]" />
                        )}
                        <span className="truncate">{meeting.location}</span>
                      </div>
                    )}

                    {meeting._count && meeting._count.attendees > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#7afdd6]" />
                        <span>{meeting._count.attendees} attendees</span>
                      </div>
                    )}
                  </div>

                  {meeting.agenda && (
                    <div className="mt-3 pt-3 border-t border-[#333]">
                      <h5 className="text-xs font-semibold text-white mb-1">Agenda:</h5>
                      <p className="text-sm text-[#b2b2b2]">{meeting.agenda}</p>
                    </div>
                  )}

                  {soon && meeting.location?.startsWith('http') && (
                    <a
                      href={meeting.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#7afdd6] text-[#2c2c2b] rounded-lg hover:bg-[#6ee8c5] transition-all font-semibold text-sm"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting Now
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div className="bg-[#2c2c2b] rounded-xl p-6 border border-[#333]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#666]" />
            Past Meetings
          </h3>

          <div className="space-y-3">
            {pastMeetings.slice(0, 5).map((meeting) => (
              <div
                key={meeting.id}
                className="p-4 rounded-lg border border-[#333] bg-[#1a1a19] opacity-70"
              >
                <h4 className="text-white font-semibold mb-2">{meeting.title}</h4>
                <div className="flex items-center gap-4 text-sm text-[#b2b2b2]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(meeting.startTime)}</span>
                  </div>
                  {meeting._count && meeting._count.attendees > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{meeting._count.attendees} attendees</span>
                    </div>
                  )}
                </div>

                {meeting.minutes && (
                  <div className="mt-2 pt-2 border-t border-[#333]">
                    <p className="text-xs text-[#666]">
                      <span className="font-semibold">Minutes:</span> {meeting.minutes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pastMeetings.length > 5 && (
            <p className="text-center text-sm text-[#666] mt-4">
              +{pastMeetings.length - 5} more past meetings
            </p>
          )}
        </div>
      )}
    </div>
  );
}
