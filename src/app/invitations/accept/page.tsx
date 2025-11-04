'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { api } from '@/trpc/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Mail,
  Building2,
  FolderKanban,
  User,
  Calendar,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

function InvitationAcceptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = searchParams?.get('token');

  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // Get invitation by token (public endpoint)
  const {
    data: invitation,
    isLoading: loadingInvitation,
    error: invitationError,
  } = api.invitation.getByToken.useQuery(
    { token: token! },
    {
      enabled: !!token,
      retry: false,
    }
  );

  // Accept invitation mutation
  const acceptMutation = api.invitation.accept.useMutation({
    onSuccess: (data) => {
      // Redirect to project page
      router.push(`/en/dashboard/projects/${data.projectId}`);
    },
    onError: (error) => {
      setAcceptError(error.message);
      setAccepting(false);
    },
  });

  const handleAccept = async () => {
    if (!token || !session) return;

    setAccepting(true);
    setAcceptError(null);

    try {
      await acceptMutation.mutateAsync({ token });
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return;

    if (!session && token) {
      const returnUrl = `/invitations/accept?token=${token}`;
      signIn(undefined, { callbackUrl: returnUrl });
    }
  }, [session, status, token]);

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 rounded-lg max-w-md w-full p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
          <p className="text-gray-400 mb-6">
            This invitation link is invalid or incomplete.
          </p>
          <button
            onClick={() => router.push('/en/dashboard')}
            className="px-6 py-3 bg-[#7afdd6] text-black font-semibold rounded-lg hover:bg-[#6be5c5] transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Loading invitation
  if (loadingInvitation || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-[#7afdd6] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading invitation...</p>
        </motion.div>
      </div>
    );
  }

  // Error loading invitation
  if (invitationError || !invitation) {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 rounded-lg max-w-md w-full p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Invitation Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            {invitationError?.message || 'This invitation could not be found.'}
          </p>
          <button
            onClick={() => router.push('/en/dashboard')}
            className="px-6 py-3 bg-[#7afdd6] text-black font-semibold rounded-lg hover:bg-[#6be5c5] transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Invitation already accepted
  if (invitation.status === 'ACCEPTED') {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 rounded-lg max-w-md w-full p-8 text-center"
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Already Accepted
          </h1>
          <p className="text-gray-400 mb-6">
            This invitation has already been accepted.
          </p>
          <button
            onClick={() =>
              router.push(`/en/dashboard/projects/${invitation.projectId}`)
            }
            className="px-6 py-3 bg-[#7afdd6] text-black font-semibold rounded-lg hover:bg-[#6be5c5] transition-colors"
          >
            Go to Project
          </button>
        </motion.div>
      </div>
    );
  }

  // Invitation cancelled
  if (invitation.status === 'CANCELLED') {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 rounded-lg max-w-md w-full p-8 text-center"
        >
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Invitation Cancelled
          </h1>
          <p className="text-gray-400 mb-6">
            This invitation has been cancelled by the sender.
          </p>
          <button
            onClick={() => router.push('/en/dashboard')}
            className="px-6 py-3 bg-[#7afdd6] text-black font-semibold rounded-lg hover:bg-[#6be5c5] transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Invitation expired
  if (invitation.isExpired) {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 rounded-lg max-w-md w-full p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Invitation Expired
          </h1>
          <p className="text-gray-400 mb-2">
            This invitation expired on{' '}
            {format(new Date(invitation.expires), 'PPP p')}
          </p>
          <p className="text-gray-400 mb-6">
            Please contact {invitation.invitedBy.name || invitation.invitedBy.email}{' '}
            to request a new invitation.
          </p>
          <button
            onClick={() => router.push('/en/dashboard')}
            className="px-6 py-3 bg-[#7afdd6] text-black font-semibold rounded-lg hover:bg-[#6be5c5] transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Email mismatch
  if (session && session.user.email !== invitation.email) {
    return (
      <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 rounded-lg max-w-md w-full p-8 text-center"
        >
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Wrong Account</h1>
          <p className="text-gray-400 mb-2">
            This invitation was sent to{' '}
            <span className="text-[#7afdd6] font-semibold">
              {invitation.email}
            </span>
          </p>
          <p className="text-gray-400 mb-6">
            You are currently logged in as{' '}
            <span className="text-[#7afdd6] font-semibold">
              {session.user.email}
            </span>
          </p>
          <p className="text-gray-400 mb-6">
            Please log in with the correct account to accept this invitation.
          </p>
          <button
            onClick={() => signIn()}
            className="px-6 py-3 bg-[#7afdd6] text-black font-semibold rounded-lg hover:bg-[#6be5c5] transition-colors"
          >
            Switch Account
          </button>
        </motion.div>
      </div>
    );
  }

  // Valid invitation - show accept UI
  return (
    <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-lg max-w-2xl w-full overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8 text-center">
          <Shield className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Project Invitation
          </h1>
          <p className="text-white/80">
            You've been invited to collaborate on a project
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Project Details */}
          <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#7afdd6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FolderKanban className="w-6 h-6 text-[#7afdd6]" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {invitation.project.name}
                </h2>
                {invitation.project.description && (
                  <p className="text-gray-400">
                    {invitation.project.description}
                  </p>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Company
                  </p>
                  <p className="text-white font-medium">
                    {invitation.project.company.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Your Role
                  </p>
                  <p className="text-[#7afdd6] font-medium uppercase text-sm">
                    {invitation.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Invited By
                  </p>
                  <p className="text-white font-medium">
                    {invitation.invitedBy.name || invitation.invitedBy.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Expires
                  </p>
                  <p className="text-white font-medium">
                    {format(new Date(invitation.expires), 'PPP')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Accept Error */}
          <AnimatePresence>
            {acceptError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-400 font-medium mb-1">Error</p>
                  <p className="text-red-400/80 text-sm">{acceptError}</p>
                </div>
                <button
                  onClick={() => setAcceptError(null)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/en/dashboard')}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              disabled={accepting}
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5568d3] to-[#6941a5] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Accept Invitation
                </>
              )}
            </button>
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> By accepting this invitation, you will become
              a {invitation.role.toLowerCase()} on this project and will be able to
              access project resources according to your role permissions.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function InvitationAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1a1a19] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#7afdd6] animate-spin" />
        </div>
      }
    >
      <InvitationAcceptContent />
    </Suspense>
  );
}
