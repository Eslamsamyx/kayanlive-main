'use client';

import { useParams, useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Building, Calendar, CheckCircle, Clock, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const { data: submission, isLoading, error } = api.questionnaire.getSubmission.useQuery(
    { id: submissionId },
    { enabled: !!submissionId }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7afdd6] mx-auto mb-4"></div>
          <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Loading submission...
          </p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="space-y-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/submissions')}
          className="flex items-center gap-2 text-[#888888] hover:text-[#7afdd6] transition-colors"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          <ArrowLeft size={20} />
          Back to Submissions
        </button>

        <div
          className="rounded-[25px] p-12 text-center"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <FileText className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Submission Not Found
          </h3>
          <p className="text-red-400">The requested submission could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={() => router.push('/admin/submissions')}
          className="flex items-center gap-2 text-[#888888] hover:text-[#7afdd6] transition-colors mb-6"
          style={{ fontFamily: '"Poppins", sans-serif' }}
        >
          <ArrowLeft size={20} />
          Back to Submissions
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-4xl md:text-6xl font-normal mb-4 capitalize"
              style={{
                background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Poppins", sans-serif',
                lineHeight: '1.1',
              }}
            >
              Submission Details
            </h1>
            <p className="text-[#888888] text-lg">
              Submitted {format(new Date(submission.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>

          <div>
            <span
              className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${
                submission.isComplete
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {submission.isComplete ? (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Complete
                </>
              ) : (
                <>
                  <Clock size={16} className="mr-2" />
                  Draft
                </>
              )}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div
            className="rounded-[25px] p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
            }}
          >
            <h3
              className="text-xl font-semibold text-[#7afdd6] mb-6"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Client Information
            </h3>

            <div className="space-y-4">
              {/* User Avatar and Name */}
              <div className="flex items-center gap-4">
                <div
                  className="h-16 w-16 flex-shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #7afdd6 0%, #b8a4ff 100%)',
                  }}
                >
                  <span className="text-[#1a1a19] font-bold text-2xl">
                    {submission.user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    {submission.user.name || 'Unknown User'}
                  </div>
                  <div className="text-sm text-[#888888]">{submission.user.role}</div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-[#7afdd6]" />
                  <div>
                    <div className="text-xs text-[#888888]">Email</div>
                    <div className="text-sm text-white">{submission.user.email}</div>
                  </div>
                </div>

                {submission.companyName && (
                  <div className="flex items-center gap-3">
                    <Building size={18} className="text-[#7afdd6]" />
                    <div>
                      <div className="text-xs text-[#888888]">Company</div>
                      <div className="text-sm text-white">{submission.companyName}</div>
                    </div>
                  </div>
                )}

                {submission.contactPerson && (
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-[#7afdd6]" />
                    <div>
                      <div className="text-xs text-[#888888]">Contact Person</div>
                      <div className="text-sm text-white">{submission.contactPerson}</div>
                    </div>
                  </div>
                )}

                {submission.industry && (
                  <div className="flex items-center gap-3">
                    <Building size={18} className="text-[#7afdd6]" />
                    <div>
                      <div className="text-xs text-[#888888]">Industry</div>
                      <div className="text-sm text-white">{submission.industry}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-[#7afdd6]" />
                  <div>
                    <div className="text-xs text-[#888888]">Submitted</div>
                    <div className="text-sm text-white">
                      {submission.submittedAt
                        ? format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')
                        : 'Not submitted yet'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Answers Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div
            className="rounded-[25px] p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(122, 253, 214, 0.3)',
            }}
          >
            <h3
              className="text-xl font-semibold text-[#7afdd6] mb-6"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              Questionnaire Responses
            </h3>

            <div className="space-y-6">
              {submission.answers.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-[#888888] mb-4" />
                  <p className="text-[#888888]">No answers provided yet</p>
                </div>
              ) : (
                submission.answers.map((answer, index) => (
                  <motion.div
                    key={answer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <span className="text-xs text-[#888888] uppercase tracking-wide">
                          {answer.section} - Q{answer.questionId}
                        </span>
                        <h4 className="text-sm font-medium text-[#7afdd6] mt-1">
                          {answer.questionType.replace(/-/g, ' ').toUpperCase()}
                        </h4>
                      </div>
                    </div>

                    <div className="text-white">
                      {/* Signature field - render as image */}
                      {answer.questionType === 'signature' && answer.textValue && (
                        <div className="p-4 bg-white rounded-xl border-2 border-dashed border-white/20">
                          <img
                            src={answer.textValue}
                            alt="Signature"
                            className="max-w-full h-auto"
                            style={{ maxHeight: '200px' }}
                          />
                        </div>
                      )}

                      {/* Regular text answer */}
                      {answer.questionType !== 'signature' && answer.textValue && (
                        <p className="whitespace-pre-wrap">{answer.textValue}</p>
                      )}

                      {/* JSON/Object answers */}
                      {answer.jsonValue && typeof answer.jsonValue === 'object' && (
                        <div className="space-y-2">
                          {Array.isArray(answer.jsonValue) ? (
                            <div className="flex flex-wrap gap-2">
                              {(answer.jsonValue as string[]).map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-[#7afdd6]/10 text-[#7afdd6] rounded-full text-sm"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {Object.entries(answer.jsonValue as Record<string, any>).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="text-[#888888]">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}:
                                  </span>{' '}
                                  <span className="text-white">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Empty state */}
                      {!answer.textValue && !answer.jsonValue && (
                        <p className="text-[#888888] italic">No answer provided</p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Uploaded Files Section */}
          {submission.uploadedFiles && submission.uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6"
            >
              <div
                className="rounded-[25px] p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  backdropFilter: 'blur(50.5px)',
                  WebkitBackdropFilter: 'blur(50.5px)',
                  border: '2px solid rgba(122, 253, 214, 0.3)',
                }}
              >
                <h3
                  className="text-xl font-semibold text-[#7afdd6] mb-6"
                  style={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  Uploaded Files ({submission.uploadedFiles.length})
                </h3>

                <div className="grid gap-4">
                  {submission.uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#7afdd6]/10">
                          <FileText size={24} className="text-[#7afdd6]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{file.originalName}</div>
                          <div className="text-xs text-[#888888] mt-1">
                            {(file.fileSize / 1024).toFixed(2)} KB • {file.mimeType}
                          </div>
                        </div>
                      </div>
                      <button
                        className="p-2 text-[#7afdd6] hover:bg-[#7afdd6]/10 rounded-lg transition-colors"
                        title="Download file"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
