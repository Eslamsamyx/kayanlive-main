"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Question } from "./types";

interface ThankYouScreenProps {
  title: string;
  message: string;
  isBoothBrief?: boolean;
  answers?: Record<number, string | string[] | Record<string, string>>;
  files?: Record<number, File[]>;
  questions?: Question[];
}

export function ThankYouScreen({
  title,
  message,
  isBoothBrief,
  answers = {},
  files = {},
  questions = []
}: ThankYouScreenProps) {
  const [showReport, setShowReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const generateReport = () => {
    setReportGenerated(true);
    setShowReport(true);
  };

  const getAnswerDisplay = (question: Question, answer: string | string[] | Record<string, string> | undefined) => {
    if (!answer) return "Not answered";

    if (Array.isArray(answer)) {
      return answer.length > 0 ? answer.join(", ") : "Not answered";
    }

    // Handle any object type (including multi-field and other object answers)
    if (typeof answer === 'object' && answer !== null) {
      const entries = Object.entries(answer);
      if (entries.length === 0) return "Not answered";

      return entries
        .filter(([_, value]) => value && value.trim() !== "")
        .map(([key, value]) => {
          const field = question.fields?.find(f => f.id === key);
          const label = field?.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `${label}: ${value}`;
        })
        .join(" | ");
    }

    if (question.type === "rating" || question.type === "star-rating") {
      return `${answer}/${question.max || 10}`;
    }

    return String(answer);
  };

  const getFilesSummary = (questionId: number) => {
    const questionFiles = files[questionId];
    if (!questionFiles || questionFiles.length === 0) return "No files uploaded";

    return `${questionFiles.length} file${questionFiles.length > 1 ? 's' : ''} uploaded: ${questionFiles.map(f => f.name).join(', ')}`;
  };

  const generateAIInsights = () => {
    const insights = [];

    // Analyze booth type and budget
    const boothType = answers[1] as string;
    const budget = answers[10] as string;
    if (boothType && budget) {
      if (boothType.includes("Mega") && budget.includes("$500,000+")) {
        insights.push("🎯 Premium mega booth project with substantial budget - excellent opportunity for innovative design");
      } else if (boothType.includes("Standard") && budget.includes("$10,000")) {
        insights.push("💡 Cost-effective standard booth - focus on maximizing impact within budget");
      } else {
        insights.push("📊 Well-balanced project scope and budget alignment");
      }
    }

    // Analyze technology integration
    const techRating = parseInt(answers[8] as string);
    if (techRating >= 8) {
      insights.push("🚀 High technology integration desired - consider interactive displays, AR/VR, and smart booth features");
    } else if (techRating <= 3) {
      insights.push("🎨 Traditional approach preferred - focus on physical design, materials, and craftsmanship");
    }

    // Analyze booth elements
    const elements = answers[5] as string[];
    if (elements?.includes("Interactive Product Displays") && elements?.includes("Digital Screens & Technology")) {
      insights.push("💻 Tech-forward experience - integrate seamless digital-physical interactions");
    }
    if (elements?.includes("VIP/Private Meeting Room")) {
      insights.push("🤝 High-value networking focus - design for exclusive business interactions");
    }

    // Analyze atmosphere
    const atmosphere = answers[12] as string[];
    if (atmosphere?.includes("Luxurious & Premium") && atmosphere?.includes("Modern & Innovative")) {
      insights.push("✨ Luxury-innovation blend - premium materials with cutting-edge design");
    }

    return insights.length > 0 ? insights : ["📋 Comprehensive brief received - our team will analyze all requirements for optimal design"];
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-6 md:py-8 lg:py-10">
      <div className="max-w-[1600px] mx-auto px-4">
        {/* Main Container with Curved Edges and Dark Background */}
        <div className="relative bg-[#2c2c2b] rounded-[61px] mx-1 sm:mx-4 px-2 sm:px-6 md:px-8 lg:px-12 py-6 md:py-10 shadow-2xl overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#7afdd6]/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#b8a4ff]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative text-center"
          >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
            className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-8 shadow-2xl"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="w-16 h-16 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>

          {/* Logo and Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center space-x-3 mb-8"
          >
            <Image
              src="/optimized/footer/823c27de600ccd2f92af3e073c8e10df3a192e5c.webp"
              alt="Kayan Live Logo"
              width={320}
              height={107}
              className="w-auto h-auto max-w-[180px] sm:max-w-[220px] md:max-w-[260px] lg:max-w-[320px]"
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            {title}
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            {message}
          </motion.p>

          {/* Generate Report Button */}
          {isBoothBrief && !showReport && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateReport}
              className="bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] hover:from-[#6ee8c5] hover:to-[#a694ff] text-[#2c2c2b] font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 shadow-xl hover:shadow-[#7afdd6]/25 mb-8"
            >
              📊 Generate Brief Summary Report
            </motion.button>
          )}

          {/* Brief Summary Report */}
          {showReport && isBoothBrief && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-12 text-left max-w-5xl mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">📋 Booth Brief Summary</h2>
                <div className="text-sm text-gray-300">
                  Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* AI Insights */}
              <div className="mb-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#7afdd6] mb-4">🤖 AI Analysis & Insights</h3>
                <div className="space-y-2">
                  {generateAIInsights().map((insight, index) => (
                    <div key={index} className="text-gray-300 text-sm bg-white/10 rounded-lg p-3">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Responses */}
              <div className="grid gap-6">
                {questions.map((question) => {
                  const answer = answers[question.id];
                  const hasFiles = Boolean(files[question.id]?.length);

                  return (
                    <div key={question.id} className="border-b border-white/30 pb-6">
                      <h4 className="text-lg font-semibold text-white mb-3">
                        Q{question.id}: {question.question}
                      </h4>

                      {question.type === "file-upload" ? (
                        <div className="text-gray-300 bg-white/10 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="font-medium">Files:</span>
                          </div>
                          <div className="text-sm">{getFilesSummary(question.id)}</div>
                        </div>
                      ) : question.type === "signature" && typeof answer === 'string' && answer.startsWith('data:image') ? (
                        <div className="bg-white rounded-xl p-4 border-2 border-dashed border-white/20">
                          <img
                            src={answer}
                            alt="Signature"
                            className="max-w-full h-auto"
                            style={{ maxHeight: '200px' }}
                          />
                        </div>
                      ) : (
                        <div className="text-gray-300 bg-white/10 rounded-lg p-4">
                          <div className="whitespace-pre-wrap">{getAnswerDisplay(question, answer)}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Project Summary */}
              <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#7afdd6] mb-4">📊 Project Overview</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Booth Type</h4>
                    <p className="text-gray-300 text-sm">
                      {questions[0] ? getAnswerDisplay(questions[0], answers[1]) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Budget Range</h4>
                    <p className="text-gray-300 text-sm">
                      {questions[9] ? getAnswerDisplay(questions[9], answers[10]) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Technology Integration</h4>
                    <p className="text-gray-300 text-sm">
                      {questions[7] ? getAnswerDisplay(questions[7], answers[8]) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Total Files Uploaded</h4>
                    <p className="text-gray-300 text-sm">
                      {Object.values(files).reduce((total, fileArray) => total + (fileArray?.length || 0), 0)} files
                    </p>
                  </div>
                </div>
              </div>

              {/* Print/Download Options */}
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Report</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Next Steps for Booth Brief */}
          {isBoothBrief && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showReport ? 0.2 : 1.0, duration: 0.6 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-12 max-w-3xl mx-auto"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">What Happens Next?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Review & Analysis</h3>
                  <p className="text-gray-300 text-sm">Our design team will carefully review your brief and requirements</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Initial Concepts</h3>
                  <p className="text-gray-300 text-sm">We'll create preliminary design concepts and 3D visualizations</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Consultation Call</h3>
                  <p className="text-gray-300 text-sm">Schedule a call to discuss concepts and refine your vision</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact Information */}
          {isBoothBrief && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showReport ? 0.4 : 1.2, duration: 0.6 }}
              className="mb-12"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Need immediate assistance?</h3>
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-gray-300">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>hello@kayanlive.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: showReport ? 0.6 : 1.4, duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6"
          >
            <Link
              href="/"
              className="bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] hover:from-[#6ee8c5] hover:to-[#a694ff] text-[#2c2c2b] font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 shadow-xl hover:shadow-[#7afdd6]/25"
            >
              Return to Home
            </Link>

            {isBoothBrief && (
              <Link
                href="/questionnaire/booth-brief"
                className="border-2 border-[#7afdd6]/50 hover:border-[#7afdd6] text-white hover:bg-[#7afdd6]/10 font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300"
              >
                Submit Another Brief
              </Link>
            )}
          </motion.div>

          {/* Footer Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: showReport ? 0.8 : 1.6, duration: 0.6 }}
            className="text-gray-400 text-sm mt-12"
          >
            {isBoothBrief ? (
              "We're excited to bring your booth vision to life and create an unforgettable experience for your audience."
            ) : (
              "Thank you for taking the time to share your feedback with us."
            )}
          </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
