"use client";

import { motion } from "framer-motion";

interface NavigationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isLastQuestion: boolean;
  isLoading?: boolean;
}

export function NavigationButtons({
  onPrevious,
  onNext,
  canGoBack,
  canGoForward,
  isLastQuestion,
  isLoading = false,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between items-center pt-8">
      <motion.button
        whileHover={canGoBack ? { scale: 1.05 } : {}}
        whileTap={canGoBack ? { scale: 0.95 } : {}}
        onClick={onPrevious}
        disabled={!canGoBack}
        className={`flex items-center px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 ${
          canGoBack
            ? "bg-white/10 text-white hover:bg-white/20 border border-white/30 hover:border-[#7afdd6]/50"
            : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/20"
        }`}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </motion.button>

      <motion.button
        whileHover={canGoForward && !isLoading ? { scale: 1.05 } : {}}
        whileTap={canGoForward && !isLoading ? { scale: 0.95 } : {}}
        onClick={onNext}
        disabled={!canGoForward || isLoading}
        className={`flex items-center px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 ${
          canGoForward && !isLoading
            ? "bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] hover:from-[#6ee8c5] hover:to-[#a694ff] text-[#2c2c2b] shadow-lg hover:shadow-[#7afdd6]/25"
            : "bg-white/10 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          <>
            {isLastQuestion ? "Submit Brief" : "Next"}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </motion.button>
    </div>
  );
}
