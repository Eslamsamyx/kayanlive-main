'use client';

import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFPreviewProps {
  fileUrl: string;
  fileName: string;
  onDownload?: () => void;
}

export function PDFPreview({ fileUrl, fileName, onDownload }: PDFPreviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);

  // Custom toolbar - hide download, open, and print buttons since we have our own download
  const renderToolbar = (Toolbar: (props: any) => React.ReactElement) => (
    <Toolbar>
      {(slots: any) => {
        const {
          CurrentPageInput,
          Download,
          EnterFullScreen,
          GoToNextPage,
          GoToPreviousPage,
          NumberOfPages,
          Print,
          ShowSearchPopover,
          Zoom,
          ZoomIn,
          ZoomOut,
          Open,
          SwitchTheme,
        } = slots;
        return (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              width: '100%',
              gap: '8px',
            }}
          >
            <div style={{ padding: '0px 2px' }}>
              <ShowSearchPopover />
            </div>
            <div style={{ padding: '0px 2px' }}>
              <ZoomOut />
            </div>
            <div style={{ padding: '0px 2px' }}>
              <Zoom />
            </div>
            <div style={{ padding: '0px 2px' }}>
              <ZoomIn />
            </div>
            <div style={{ padding: '0px 2px', marginLeft: 'auto' }}>
              <GoToPreviousPage />
            </div>
            <div style={{ padding: '0px 2px', width: '4rem' }}>
              <CurrentPageInput />
            </div>
            <div style={{ padding: '0px 2px' }}>
              / <NumberOfPages />
            </div>
            <div style={{ padding: '0px 2px' }}>
              <GoToNextPage />
            </div>
            <div style={{ padding: '0px 2px', marginLeft: '8px' }}>
              <EnterFullScreen />
            </div>
          </div>
        );
      }}
    </Toolbar>
  );

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [defaultTabs[0]], // Only show thumbnails tab
    renderToolbar,
  });

  // Validate fileUrl
  if (!fileUrl || fileUrl === '') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a19] to-[#0a0a0a] text-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="p-8 bg-[#2c2c2b]/80 backdrop-blur-xl rounded-2xl border border-[#333]/50 shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-red-400 text-xl font-semibold mb-2">Failed to load PDF</div>
          <div className="text-[#b2b2b2] text-sm mb-6 max-w-md">
            No file URL available. The file path may be missing.
          </div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-6 py-3 mx-auto rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#6ce7c3] text-[#1a1a19] font-semibold hover:shadow-lg hover:shadow-[#7afdd6]/30 transition-all"
            >
              <Download className="w-5 h-5" />
              Try Download
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a19] to-[#0a0a0a] text-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="p-8 bg-[#2c2c2b]/80 backdrop-blur-xl rounded-2xl border border-[#333]/50 shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-red-400 text-xl font-semibold mb-2">Failed to load PDF</div>
          <div className="text-[#b2b2b2] text-sm mb-6 max-w-md">{error}</div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-6 py-3 mx-auto rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#6ce7c3] text-[#1a1a19] font-semibold hover:shadow-lg hover:shadow-[#7afdd6]/30 transition-all"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a19] to-[#0a0a0a] overflow-hidden">
      {/* Custom Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-30 bg-[#2c2c2b]/95 backdrop-blur-xl border-b border-[#333]/50"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-[#7afdd6]/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-[#7afdd6]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-medium text-sm truncate" title={fileName}>
                {fileName}
              </div>
              {numPages > 0 && (
                <div className="text-[#b2b2b2] text-xs whitespace-nowrap">
                  {numPages} {numPages === 1 ? 'page' : 'pages'}
                </div>
              )}
            </div>
          </div>

          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7afdd6] to-[#6ce7c3] text-[#1a1a19] font-semibold hover:shadow-lg hover:shadow-[#7afdd6]/30 transition-all flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0a]/50 backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-[#333]"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#7afdd6] animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#7afdd6] animate-pulse" />
                </div>
              </div>
              <div className="text-white font-medium mb-1">Loading PDF</div>
              <div className="text-[#b2b2b2] text-sm">Please wait...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Viewer */}
      <div className="absolute inset-0 pt-[72px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full h-full pdf-viewer-container"
        >
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={fileUrl}
              plugins={[defaultLayoutPluginInstance]}
              onDocumentLoad={(e) => {
                setIsLoading(false);
                setNumPages(e.doc.numPages);
              }}
            />
          </Worker>
        </motion.div>
      </div>

      <style jsx global>{`
        .pdf-viewer-container {
          background: #0a0a0a;
        }

        /* Main viewer background */
        .pdf-viewer-container .rpv-core__viewer {
          background: #0a0a0a;
        }

        /* PDF pages */
        .pdf-viewer-container .rpv-core__inner-page {
          background: #fff;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          border-radius: 8px;
          margin: 16px auto;
        }

        .pdf-viewer-container .rpv-core__page-layer {
          border-radius: 8px;
        }

        /* Toolbar */
        .rpv-default-layout__toolbar {
          background: #2c2c2b !important;
          border-bottom: 1px solid #333 !important;
          padding: 8px 16px !important;
        }

        /* Toolbar buttons */
        .rpv-core__button {
          color: #fff !important;
          border-radius: 8px !important;
          transition: all 0.2s ease !important;
        }

        .rpv-core__button:hover {
          background: rgba(122, 253, 214, 0.15) !important;
          color: #7afdd6 !important;
          transform: translateY(-1px);
        }

        .rpv-core__button--pressed {
          background: rgba(122, 253, 214, 0.2) !important;
          color: #7afdd6 !important;
        }

        /* Input fields */
        .rpv-core__textbox {
          background: #1a1a19 !important;
          border: 1px solid #333 !important;
          color: #fff !important;
          border-radius: 6px !important;
        }

        .rpv-core__textbox:focus {
          border-color: #7afdd6 !important;
          box-shadow: 0 0 0 2px rgba(122, 253, 214, 0.1) !important;
        }

        /* Sidebar */
        .rpv-default-layout__sidebar {
          background: #1a1a19 !important;
          border-right: 1px solid #333 !important;
        }

        .rpv-default-layout__sidebar-tabs {
          background: #2c2c2b !important;
          border-bottom: 1px solid #333 !important;
        }

        .rpv-default-layout__sidebar-tab {
          color: #b2b2b2 !important;
          border-radius: 8px !important;
          transition: all 0.2s ease !important;
        }

        .rpv-default-layout__sidebar-tab:hover {
          background: rgba(122, 253, 214, 0.1) !important;
          color: #7afdd6 !important;
        }

        .rpv-default-layout__sidebar-tab--selected {
          background: rgba(122, 253, 214, 0.2) !important;
          color: #7afdd6 !important;
        }

        /* Thumbnails */
        .rpv-thumbnail__container {
          background: #2c2c2b !important;
          border: 1px solid #333 !important;
          border-radius: 8px !important;
        }

        .rpv-thumbnail__container--selected {
          border-color: #7afdd6 !important;
          box-shadow: 0 0 0 2px rgba(122, 253, 214, 0.2) !important;
        }

        /* Popover/Dropdown */
        .rpv-core__popover-body {
          background: #2c2c2b !important;
          border: 1px solid #333 !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
        }

        .rpv-core__menu-item {
          color: #fff !important;
          border-radius: 8px !important;
          transition: all 0.2s ease !important;
        }

        .rpv-core__menu-item:hover {
          background: rgba(122, 253, 214, 0.15) !important;
          color: #7afdd6 !important;
        }

        /* Separators */
        .rpv-core__separator {
          background: #333 !important;
        }

        /* Scrollbar */
        .rpv-core__inner-pages::-webkit-scrollbar,
        .rpv-default-layout__sidebar-content::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .rpv-core__inner-pages::-webkit-scrollbar-track,
        .rpv-default-layout__sidebar-content::-webkit-scrollbar-track {
          background: #1a1a19;
        }

        .rpv-core__inner-pages::-webkit-scrollbar-thumb,
        .rpv-default-layout__sidebar-content::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 5px;
          transition: background 0.2s ease;
        }

        .rpv-core__inner-pages::-webkit-scrollbar-thumb:hover,
        .rpv-default-layout__sidebar-content::-webkit-scrollbar-thumb:hover {
          background: #7afdd6;
        }

        /* Search highlight */
        .rpv-search__highlight {
          background: rgba(122, 253, 214, 0.3) !important;
        }

        .rpv-search__highlight--current {
          background: #7afdd6 !important;
        }

        /* Zoom popover */
        .rpv-zoom__popover-body {
          background: #2c2c2b !important;
        }

        /* Loading spinner */
        .rpv-core__spinner {
          border-color: #333 !important;
          border-top-color: #7afdd6 !important;
        }
      `}</style>
    </div>
  );
}
