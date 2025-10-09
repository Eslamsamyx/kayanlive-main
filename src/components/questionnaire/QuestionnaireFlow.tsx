'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/trpc/react';
import { WelcomeScreen } from './WelcomeScreen';
import { QuestionCard } from './QuestionCard';
import { ThankYouScreen } from './ThankYouScreen';
import { ProgressBar } from './ProgressBar';
import { NavigationButtons } from './NavigationButtons';
import type { Question } from './types';
import { projectBriefQuestionnaire } from '@/data/questionnaires/project-brief';

interface QuestionnaireFlowProps {
  questionnaireId: string;
}

export function QuestionnaireFlow({ questionnaireId }: QuestionnaireFlowProps) {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'questions' | 'thank-you'>('welcome');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[] | Record<string, string>>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, File[]>>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get questionnaire data
  const questionnaireData = questionnaireId === 'project-brief' ? projectBriefQuestionnaire : null;

  // tRPC mutation for submitting questionnaire
  const submitQuestionnaire = api.questionnaire.submit.useMutation({
    onSuccess: (data) => {
      setSubmissionId(data.submissionId);
      setIsSubmitting(false);
      setCurrentStep('thank-you');
    },
    onError: (error) => {
      console.error('Failed to submit questionnaire:', error);
      setIsSubmitting(false);
      // TODO: Show error toast
      alert('Failed to submit questionnaire. Please try again.');
    },
  });

  // Group questions by section
  const sections = questionnaireData
    ? questionnaireData.questions.reduce(
        (acc, question) => {
          const sectionName = question.section || 'General';
          if (!acc[sectionName]) {
            acc[sectionName] = [];
          }
          acc[sectionName].push(question);
          return acc;
        },
        {} as Record<string, Question[]>
      )
    : {};

  const sectionNames = Object.keys(sections);
  const currentSection = sectionNames[currentSectionIndex];
  const currentSectionQuestions = currentSection ? sections[currentSection] || [] : [];

  if (!questionnaireData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2c2c2b]">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Brief Not Found</h1>
          <p className="text-xl text-gray-300">The requested brief form could not be found.</p>
        </div>
      </div>
    );
  }

  const progress = ((currentSectionIndex + 1) / sectionNames.length) * 100;

  const handleAnswer = (questionId: number, answer: string | string[] | Record<string, string>) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleFileUpload = (questionId: number, files: File[]) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [questionId]: files,
    }));
  };

  const handleNext = async () => {
    if (currentSectionIndex < sectionNames.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
    } else {
      // Submit questionnaire to database
      setIsSubmitting(true);

      // Prepare submission data
      const submissionAnswers = Object.entries(answers)
        .map(([questionId, answer]) => {
          const question = questionnaireData?.questions.find((q) => q.id === parseInt(questionId));
          if (!question) return null;

          return {
            questionId: parseInt(questionId),
            questionType: question.type,
            section: question.section || 'General',
            textValue: typeof answer === 'string' ? answer : null,
            jsonValue: typeof answer !== 'string' ? answer : null,
          };
        })
        .filter(Boolean) as any[];

      // Get key client details for easy access
      const companyName = answers[1] as string; // Company Name question
      const contactPerson = answers[4] as string; // Contact Person question
      const email = answers[6] as string; // Email question
      const industry = answers[3] as string; // Industry question

      try {
        await submitQuestionnaire.mutateAsync({
          questionnaireId,
          companyName,
          contactPerson,
          email,
          industry,
          answers: submissionAnswers,
          uploadedFiles: [], // File upload will be handled separately via API route
          isComplete: true,
        });
      } catch (error) {
        console.error('Failed to submit questionnaire:', error);
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  const handleStart = () => {
    setCurrentStep('questions');
  };

  // Keyboard navigation - Enter to go to next section
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && currentStep === 'questions') {
        if (isCurrentSectionAnswered()) {
          event.preventDefault();
          handleNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, currentSectionIndex, answers, uploadedFiles]);

  const isCurrentSectionAnswered = (): boolean => {
    if (!currentSectionQuestions.length) return false;

    // Check if at least required questions in current section are answered
    const requiredQuestions = currentSectionQuestions.filter((q) => q.required);

    if (requiredQuestions.length === 0) return true; // No required questions in section

    return requiredQuestions.every((question) => {
      const answer = answers[question.id];
      const files = uploadedFiles[question.id];

      if (question.type === 'file-upload') {
        return Boolean(files && files.length > 0);
      }

      if (question.type === 'multi-field') {
        const answerObj = (answer as Record<string, string>) || {};
        const requiredFields = question.fields?.filter((field) => field.required) || [];
        return requiredFields.every(
          (field) => answerObj[field.id] && answerObj[field.id]?.trim() !== ''
        );
      }

      if (Array.isArray(answer)) {
        return answer.length > 0;
      }

      return Boolean(answer && typeof answer === 'string' && answer.trim() !== '');
    });
  };

  if (currentStep === 'welcome') {
    return (
      <WelcomeScreen
        title={questionnaireData.title}
        description={questionnaireData.description}
        onStart={handleStart}
        isBoothBrief={true}
      />
    );
  }

  if (currentStep === 'thank-you') {
    return (
      <ThankYouScreen
        title="Brief Submitted Successfully!"
        message="Thank you for providing detailed information about your booth requirements. Our design team will review your brief and get back to you within 24 hours with initial concepts and next steps."
        isBoothBrief={true}
        answers={answers}
        files={uploadedFiles}
        questions={questionnaireData.questions}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white py-6 md:py-8 lg:py-10">
      <div className="max-w-[1600px] mx-auto px-4">
        {/* Main Container with Curved Edges and Dark Background */}
        <div className="relative bg-[#2c2c2b] rounded-[61px] mx-1 sm:mx-4 px-2 sm:px-6 md:px-8 lg:px-12 py-6 md:py-10 shadow-2xl overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7afdd6]/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#b8a4ff]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8 md:mb-10">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center mb-6"
              >
                <Image
                  src="/optimized/footer/823c27de600ccd2f92af3e073c8e10df3a192e5c.webp"
                  alt="Kayan Live Logo"
                  width={320}
                  height={107}
                  className="w-auto h-auto max-w-[200px] md:max-w-[280px] lg:max-w-[320px]"
                  priority
                />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3"
              >
                {questionnaireData.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 text-sm md:text-base"
              >
                Section {currentSectionIndex + 1} of {sectionNames.length}: {currentSection}
              </motion.p>
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8 md:mb-10"
            >
              <ProgressBar progress={progress} />
            </motion.div>

            {/* Section Questions */}
            {currentSectionQuestions.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Section Header */}
                  <div className="bg-gradient-to-r from-white/[0.08] to-white/[0.12] backdrop-blur-sm border border-white/[0.15] rounded-2xl md:rounded-3xl p-5 md:p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-1">{currentSection}</h2>
                        <p className="text-gray-400 text-sm">
                          {currentSectionQuestions.length} question
                          {currentSectionQuestions.length !== 1 ? 's' : ''} in this section
                        </p>
                      </div>
                      <div className="hidden md:flex items-center space-x-2">
                        <div className="px-4 py-2 bg-[#7afdd6]/[0.15] border border-[#7afdd6]/[0.25] rounded-full">
                          <span className="text-[#7afdd6] text-xs font-medium">
                            {Math.round(
                              ((Object.keys(answers).filter((id) =>
                                currentSectionQuestions.some((q) => q.id === parseInt(id))
                              ).length) /
                                currentSectionQuestions.length) *
                                100
                            )}
                            % Complete
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Questions Grid */}
                  <div className="grid gap-5 md:gap-6">
                    {currentSectionQuestions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <QuestionCard
                          question={question}
                          answer={answers[question.id]}
                          files={uploadedFiles[question.id]}
                          onAnswer={handleAnswer}
                          onFileUpload={handleFileUpload}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 md:mt-10"
            >
              <NavigationButtons
                onPrevious={handlePrevious}
                onNext={handleNext}
                canGoBack={currentSectionIndex > 0 && !isSubmitting}
                canGoForward={isCurrentSectionAnswered() && !isSubmitting}
                isLastQuestion={currentSectionIndex === sectionNames.length - 1}
                isLoading={isSubmitting}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
