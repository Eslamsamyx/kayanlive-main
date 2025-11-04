'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/trpc/react';
import {
  X,
  Copy,
  Check,
  Link2,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
  Download,
  Globe,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

interface ShareAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
}

const EXPIRATION_OPTIONS = [
  { label: '1 Hour', hours: 1 },
  { label: '1 Day', hours: 24 },
  { label: '1 Week', hours: 24 * 7 },
  { label: '1 Month', hours: 24 * 30 },
  { label: 'Never', hours: null },
];

export default function ShareAssetModal({
  isOpen,
  onClose,
  assetId,
}: ShareAssetModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [linkToRevoke, setLinkToRevoke] = useState<{id: string; token: string} | null>(null);

  // Form state
  const [expirationHours, setExpirationHours] = useState<number | null>(24 * 7); // 1 week default
  const [password, setPassword] = useState('');
  const [enablePassword, setEnablePassword] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);

  const utils = api.useUtils();

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch existing share links
  const { data: shareLinksData, isLoading } = api.assetShare.listByAsset.useQuery(
    { assetId },
    { enabled: isOpen }
  );
  const shareLinks = shareLinksData?.shareLinks || [];

  // Create share link mutation
  const createMutation = api.assetShare.create.useMutation({
    onSuccess: () => {
      utils.assetShare.listByAsset.invalidate({ assetId });
      resetForm();
      setShowCreateForm(false);
    },
  });

  // Revoke share link mutation
  const revokeMutation = api.assetShare.delete.useMutation({
    onSuccess: () => {
      utils.assetShare.listByAsset.invalidate({ assetId });
      setShowRevokeConfirm(false);
      setLinkToRevoke(null);
    },
  });

  const resetForm = () => {
    setExpirationHours(24 * 7);
    setPassword('');
    setEnablePassword(false);
    setAllowDownload(true);
    setShowPassword(false);
  };

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const array = new Uint8Array(12);
    crypto.getRandomValues(array);
    const generated = Array.from(array)
      .map((x) => charset[x % charset.length])
      .join('');
    setPassword(generated);
    setEnablePassword(true);
  };

  const handleCopyLink = async (token: string, linkId: string) => {
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleCreateLink = () => {
    const expiresAt = expirationHours
      ? new Date(Date.now() + expirationHours * 60 * 60 * 1000)
      : undefined;

    createMutation.mutate({
      assetId,
      expiresAt,
      password: enablePassword && password ? password : undefined,
      allowDownload,
    });
  };

  const handleRevoke = (shareLinkId: string, token: string) => {
    setLinkToRevoke({ id: shareLinkId, token });
    setShowRevokeConfirm(true);
  };

  const confirmRevoke = () => {
    if (linkToRevoke) {
      revokeMutation.mutate({ id: linkToRevoke.id });
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="rounded-[25px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{
          background: 'rgba(26, 26, 25, 0.95)',
          backdropFilter: 'blur(50.5px)',
          WebkitBackdropFilter: 'blur(50.5px)',
          border: '2px solid rgba(122, 253, 214, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 p-6 flex items-center justify-between border-b border-[#7afdd6]/20"
          style={{
            background: 'rgba(26, 26, 25, 0.98)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] flex items-center justify-center">
              <Link2 className="text-[#2c2c2b]" size={20} />
            </div>
            <h2
              className="text-2xl font-bold"
              style={{
                background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Share Asset
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Existing Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: '"Poppins", sans-serif' }}>
              Active Share Links
            </h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-[#7afdd6]" />
              </div>
            ) : shareLinks.length === 0 ? (
              <div
                className="rounded-[20px] p-6 text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(50.5px)',
                  WebkitBackdropFilter: 'blur(50.5px)',
                  border: '2px solid rgba(122, 253, 214, 0.1)',
                }}
              >
                <Link2 className="mx-auto h-12 w-12 text-[#7afdd6]/40 mb-3" />
                <p className="text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  No share links yet. Create one below.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {shareLinks.map((link) => (
                  <div
                    key={link.id}
                    className="rounded-[20px] p-4 hover:scale-[1.01] transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(50.5px)',
                      WebkitBackdropFilter: 'blur(50.5px)',
                      border: '2px solid rgba(122, 253, 214, 0.15)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* URL */}
                        <div className="flex items-center gap-2 mb-3">
                          <code className="text-sm bg-[#2c2c2b]/60 text-[#7afdd6] px-3 py-2 rounded-lg flex-1 truncate border border-[#7afdd6]/20 font-mono">
                            {window.location.origin}/share/{link.token}
                          </code>
                          <button
                            onClick={() => handleCopyLink(link.token, link.id)}
                            className="p-2 hover:bg-[#7afdd6]/10 rounded-lg transition-colors"
                            title="Copy link"
                          >
                            {copiedLinkId === link.id ? (
                              <Check size={16} className="text-green-400" />
                            ) : (
                              <Copy size={16} className="text-[#888888] hover:text-[#7afdd6]" />
                            )}
                          </button>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} className="text-[#7afdd6]" />
                            Created {format(new Date(link.createdAt), 'MMM dd, yyyy')}
                          </span>
                          {link.expiresAt ? (
                            <span className="flex items-center gap-1">
                              Expires {format(new Date(link.expiresAt), 'MMM dd, yyyy')}
                            </span>
                          ) : (
                            <span>Never expires</span>
                          )}
                          {link.hasPassword && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                              <Lock size={12} />
                              Protected
                            </span>
                          )}
                          {link.allowDownload && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#7afdd6]/10 border border-[#7afdd6]/20 text-[#7afdd6]">
                              <Download size={12} />
                              Download
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                          <span className="flex items-center gap-1">
                            <Download size={14} className="text-[#b8a4ff]" />
                            {link.currentDownloads || 0} downloads
                          </span>
                          {link.maxDownloads && (
                            <span>Max: {link.maxDownloads}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleRevoke(link.id, link.token)}
                        disabled={revokeMutation.isPending}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 border border-red-500/20"
                        title="Revoke link"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create New Link */}
          <div>
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full py-3 px-4 rounded-xl text-[#2c2c2b] font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                <Link2 size={20} />
                Create New Share Link
              </button>
            ) : (
              <div
                className="rounded-[20px] p-5 space-y-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(50.5px)',
                  WebkitBackdropFilter: 'blur(50.5px)',
                  border: '2px solid rgba(122, 253, 214, 0.15)',
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    New Share Link
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="text-[#888888] hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Expiration */}
                <div>
                  <label className="block text-sm font-semibold text-[#888888] mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Link Expiration
                  </label>
                  <select
                    value={expirationHours ?? 'never'}
                    onChange={(e) =>
                      setExpirationHours(
                        e.target.value === 'never' ? null : parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2.5 bg-[#2c2c2b]/60 border border-[#7afdd6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7afdd6] text-white appearance-none cursor-pointer hover:bg-[#2c2c2b]/80 hover:border-[#7afdd6]/40 transition-all"
                    style={{
                      fontFamily: '"Poppins", sans-serif',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237afdd6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      paddingRight: '2.5rem',
                    }}
                  >
                    {EXPIRATION_OPTIONS.map((option) => (
                      <option
                        key={option.label}
                        value={option.hours ?? 'never'}
                        className="bg-[#1a1a19] text-white py-2"
                        style={{ fontFamily: '"Poppins", sans-serif' }}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Password Protection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enablePassword}
                        onChange={(e) => setEnablePassword(e.target.checked)}
                        className="w-4 h-4 text-[#7afdd6] border-[#7afdd6]/40 rounded focus:ring-[#7afdd6] bg-[#2c2c2b]/60"
                      />
                      <span className="text-sm font-semibold text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                        Password Protection
                      </span>
                    </label>
                    {enablePassword && (
                      <button
                        onClick={generatePassword}
                        className="text-xs text-[#7afdd6] hover:text-[#b8a4ff] flex items-center gap-1 font-semibold transition-colors"
                        style={{ fontFamily: '"Poppins", sans-serif' }}
                      >
                        <RefreshCw size={12} />
                        Generate
                      </button>
                    )}
                  </div>
                  {enablePassword && (
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-3 py-2 pr-10 bg-[#2c2c2b]/60 border border-[#7afdd6]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7afdd6] text-white placeholder:text-[#888888]"
                        style={{ fontFamily: '"Poppins", sans-serif' }}
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#7afdd6] transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Allow Download */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowDownload}
                      onChange={(e) => setAllowDownload(e.target.checked)}
                      className="w-4 h-4 text-[#7afdd6] border-[#7afdd6]/40 rounded focus:ring-[#7afdd6] bg-[#2c2c2b]/60"
                    />
                    <span className="text-sm font-semibold text-[#888888]" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      Allow Download
                    </span>
                  </label>
                  <p className="text-xs text-[#888888]/70 ml-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
                    Recipients can download the asset
                  </p>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleCreateLink}
                  disabled={createMutation.isPending || (enablePassword && !password)}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg"
                  style={{
                    background: createMutation.isPending || (enablePassword && !password)
                      ? 'rgba(122, 253, 214, 0.3)'
                      : 'linear-gradient(90deg, #7afdd6 0%, #b8a4ff 100%)',
                    color: '#2c2c2b',
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Link2 size={16} />
                      Generate Share Link
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 p-4 flex justify-end border-t border-[#7afdd6]/20"
          style={{
            background: 'rgba(26, 26, 25, 0.98)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
          }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 border border-[#7afdd6]/40 rounded-xl hover:bg-[#7afdd6]/10 transition-all font-semibold text-white"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Revoke Confirmation Modal */}
      {showRevokeConfirm && linkToRevoke && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          style={{ zIndex: 10000 }}
          onClick={() => setShowRevokeConfirm(false)}
        >
          <div
            className="rounded-[25px] max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200"
            style={{
              background: 'rgba(26, 26, 25, 0.98)',
              backdropFilter: 'blur(50.5px)',
              WebkitBackdropFilter: 'blur(50.5px)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/40">
                <AlertTriangle className="text-red-400" size={32} />
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-2xl font-bold text-center mb-3"
              style={{
                fontFamily: '"Poppins", sans-serif',
                color: '#fff',
              }}
            >
              Revoke Share Link?
            </h3>

            {/* Description */}
            <p
              className="text-center text-[#888888] mb-6 leading-relaxed"
              style={{ fontFamily: '"Poppins", sans-serif' }}
            >
              This will permanently revoke access to this share link. Anyone with this link will no longer be able to view or download the asset.
            </p>

            {/* Link Preview */}
            <div
              className="rounded-lg p-3 mb-6 border border-red-500/20"
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Link2 size={14} className="text-red-400" />
                <span className="text-xs font-semibold text-red-400" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  Link to be revoked
                </span>
              </div>
              <code className="text-xs text-[#888888] break-all font-mono block">
                {window.location.origin}/share/{linkToRevoke.token}
              </code>
            </div>

            {/* Warning Note */}
            <div className="flex items-start gap-3 p-3 rounded-lg mb-6 bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-200/80" style={{ fontFamily: '"Poppins", sans-serif' }}>
                This action cannot be undone. You'll need to create a new share link if you want to share this asset again.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRevokeConfirm(false);
                  setLinkToRevoke(null);
                }}
                disabled={revokeMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#7afdd6]/30 text-white hover:bg-[#7afdd6]/10 transition-all font-semibold disabled:opacity-50"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRevoke}
                disabled={revokeMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                {revokeMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Revoke Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
