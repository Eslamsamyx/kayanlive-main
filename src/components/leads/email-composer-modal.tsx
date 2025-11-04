'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { X, Mail, Loader2, Send, FileText, Sparkles, Eye } from 'lucide-react';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
  leadIds?: string[];
  onSuccess?: () => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'initial',
    name: 'Initial Follow-up',
    subject: 'Great meeting you at {{exhibitionName}}!',
    body: `Hi {{leadName}},

It was great meeting you at {{exhibitionName}}. I wanted to follow up on our conversation about {{interests}}.

I'd love to schedule a call to discuss how we can help {{company}} achieve your goals.

Would you be available for a quick 15-minute call this week?

Best regards,
{{senderName}}`,
  },
  {
    id: 'second',
    name: 'Second Follow-up',
    subject: 'Following up - {{exhibitionName}}',
    body: `Hi {{leadName}},

I wanted to reach out again regarding our conversation at {{exhibitionName}}.

I understand you're busy, but I believe we have a solution that could benefit {{company}}.

Let me know if you'd like to schedule a brief call to explore this further.

Best regards,
{{senderName}}`,
  },
  {
    id: 'thank_you',
    name: 'Thank You',
    subject: 'Thank you for visiting us at {{exhibitionName}}',
    body: `Dear {{leadName}},

Thank you for visiting our booth at {{exhibitionName}}. It was a pleasure meeting you and learning about {{company}}.

I've attached some additional information about our solutions that might be of interest to you.

Please don't hesitate to reach out if you have any questions.

Best regards,
{{senderName}}`,
  },
  {
    id: 'custom',
    name: 'Custom Email',
    subject: '',
    body: '',
  },
];

export default function EmailComposerModal({
  isOpen,
  onClose,
  leadId,
  leadIds,
  onSuccess,
}: EmailComposerModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('initial');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const utils = api.useUtils();

  // Fetch lead data if single lead
  const { data } = api.exhibition.getLeadById.useQuery(
    { id: leadId! },
    { enabled: !!leadId && isOpen }
  );
  const lead = data?.lead;

  // Send email mutation
  const sendEmailMutation = api.exhibition.sendFollowUpEmail.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setSelectedTemplate('initial');
    setSubject('');
    setBody('');
    setShowPreview(false);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const replaceVariables = (text: string): string => {
    if (!lead) return text;

    return text
      .replace(/\{\{leadName\}\}/g, (lead as any).contactName || (lead as any).name || 'there')
      .replace(/\{\{company\}\}/g, (lead as any).companyName || (lead as any).company || 'your company')
      .replace(/\{\{exhibitionName\}\}/g, lead.exhibition?.name || 'the exhibition')
      .replace(/\{\{interests\}\}/g, (lead as any).notes || (lead as any).interests || 'your interests')
      .replace(/\{\{senderName\}\}/g, 'The Team'); // TODO: Replace with actual user name
  };

  const getPreviewSubject = () => replaceVariables(subject);
  const getPreviewBody = () => replaceVariables(body);

  const handleSend = () => {
    if (leadId) {
      sendEmailMutation.mutate({
        leadIds: [leadId],
        subject: getPreviewSubject(),
        body: getPreviewBody(),
      });
    } else if (leadIds && leadIds.length > 0) {
      // Batch send
      Promise.all(
        leadIds.map((id) =>
          sendEmailMutation.mutateAsync({
            leadIds: [id],
            subject: getPreviewSubject(),
            body: getPreviewBody(),
          })
        )
      ).then(() => {
        onSuccess?.();
        onClose();
        resetForm();
      });
    }
  };

  const handleClose = () => {
    if (!sendEmailMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Compose Follow-up Email</h2>
              {lead && <p className="text-sm text-gray-600">To: {(lead as any).contactName || (lead as any).name} ({(lead as any).contactEmail || (lead as any).email})</p>}
              {leadIds && leadIds.length > 1 && (
                <p className="text-sm text-gray-600">To: {leadIds.length} recipients</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={sendEmailMutation.isPending}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Template Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <FileText size={16} className="inline mr-1" />
              Select Template
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {EMAIL_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  disabled={sendEmailMutation.isPending}
                  className={`p-4 border-2 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                  {template.id !== 'custom' && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{template.subject}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sendEmailMutation.isPending}
              placeholder="Enter email subject..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use variables: {'{{'} leadName {'}}'}, {'{{'} company {'}}'}, {'{{'} exhibitionName {'}}'}, {'{{'} interests {'}}'}, {'{{'} senderName {'}}'}
            </p>
          </div>

          {/* Body */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={sendEmailMutation.isPending}
              placeholder="Enter email content..."
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Variables will be automatically replaced with lead-specific information
            </p>
          </div>

          {/* Preview */}
          {showPreview && lead && (
            <div className="mb-6 border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Hide Preview
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <div className="text-sm text-gray-600">Subject:</div>
                  <div className="font-semibold text-gray-900">{getPreviewSubject()}</div>
                </div>
                <div className="whitespace-pre-wrap text-gray-800">{getPreviewBody()}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={sendEmailMutation.isPending}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            {!showPreview && lead && (
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={sendEmailMutation.isPending || !subject || !body}
                className="px-6 py-3 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye size={20} />
                Preview
              </button>
            )}

            <button
              type="button"
              onClick={handleSend}
              disabled={sendEmailMutation.isPending || !subject || !body}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Email
                </>
              )}
            </button>
          </div>

          {/* AI Suggestion (Future Enhancement) */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="text-purple-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <div className="font-medium text-gray-900 mb-1">AI-Powered Suggestions (Coming Soon)</div>
                <div className="text-sm text-gray-600">
                  Get personalized email suggestions based on lead behavior and context
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
