"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ValidationErrorProps {
  error?: string;
  className?: string;
}

export function ValidationError({ error, className = "" }: ValidationErrorProps) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center space-x-2 mt-2 ${className}`}
        >
          <svg
            className="w-4 h-4 text-red-400 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-red-400 text-sm font-medium">{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FieldValidationWrapperProps {
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
}

export function FieldValidationWrapper({
  error,
  touched = false,
  children
}: FieldValidationWrapperProps) {
  const hasError = touched && error;

  return (
    <div className="relative">
      <div className={`
        relative transition-all duration-200
        ${hasError ? 'ring-2 ring-red-400/50 rounded-lg' : ''}
      `}>
        {children}
      </div>
      <ValidationError error={hasError ? error : undefined} />
    </div>
  );
}

interface SectionValidationSummaryProps {
  errors: Record<number, string>;
  questions: Array<{ id: number; question: string }>;
}

export function SectionValidationSummary({
  errors,
  questions
}: SectionValidationSummaryProps) {
  const errorCount = Object.keys(errors).length;

  if (errorCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6"
    >
      <div className="flex items-start space-x-3">
        <svg
          className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <h3 className="text-red-400 font-semibold mb-2">
            {errorCount} {errorCount === 1 ? 'field requires' : 'fields require'} attention
          </h3>
          <ul className="space-y-1">
            {Object.entries(errors).map(([questionId, error]) => {
              const question = questions.find(q => q.id === parseInt(questionId));
              if (!question) return null;

              return (
                <li key={questionId} className="flex items-start space-x-2">
                  <span className="text-red-400/70 text-sm">•</span>
                  <span className="text-red-300 text-sm">
                    {question.question}: {error}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

interface ValidationProgressIndicatorProps {
  totalQuestions: number;
  validQuestions: number;
  requiredQuestions: number;
  validRequiredQuestions: number;
}

export function ValidationProgressIndicator({
  totalQuestions,
  validQuestions,
  requiredQuestions,
  validRequiredQuestions,
}: ValidationProgressIndicatorProps) {
  const overallProgress = (validQuestions / totalQuestions) * 100;
  const requiredProgress = requiredQuestions > 0
    ? (validRequiredQuestions / requiredQuestions) * 100
    : 100;

  return (
    <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/[0.1]">
      <div className="space-y-3">
        {/* Required Fields Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Required Fields</span>
            <span className="text-sm font-medium text-white">
              {validRequiredQuestions}/{requiredQuestions}
            </span>
          </div>
          <div className="h-2 bg-white/[0.1] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff]"
              initial={{ width: 0 }}
              animate={{ width: `${requiredProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Overall Completion</span>
            <span className="text-sm font-medium text-white">
              {validQuestions}/{totalQuestions}
            </span>
          </div>
          <div className="h-2 bg-white/[0.1] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Validation Status */}
      <motion.div
        className={`mt-3 pt-3 border-t border-white/[0.1] flex items-center space-x-2 ${
          requiredProgress === 100 ? 'text-green-400' : 'text-yellow-400'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {requiredProgress === 100 ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Ready to continue</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">
              Complete required fields to continue
            </span>
          </>
        )}
      </motion.div>
    </div>
  );
}
