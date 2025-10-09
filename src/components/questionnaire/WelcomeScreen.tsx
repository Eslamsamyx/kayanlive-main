"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface WelcomeScreenProps {
  title: string;
  description: string;
  onStart: () => void;
  isBoothBrief?: boolean;
}

export function WelcomeScreen({ title, description, onStart, isBoothBrief }: WelcomeScreenProps) {
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative text-center"
          >
          {/* Logo and Brand */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center justify-center space-x-3 mb-8"
          >
            <Image
              src="/optimized/footer/823c27de600ccd2f92af3e073c8e10df3a192e5c.webp"
              alt="Kayan Live Logo"
              width={400}
              height={134}
              className="w-auto h-auto max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[320px] xl:max-w-[400px]"
              priority
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            {isBoothBrief ? (
              <>
                Design Your
                <span className="block bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] bg-clip-text text-transparent">
                  Dream Booth
                </span>
              </>
            ) : (
              title
            )}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            {isBoothBrief ? (
              "Share your vision with us through this comprehensive brief. We'll transform your ideas into an extraordinary booth experience that captivates your audience and elevates your brand."
            ) : (
              description
            )}
          </motion.p>

          {/* Features */}
          {isBoothBrief && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Creative Vision</h3>
                <p className="text-gray-300 text-sm">Tell us about your brand story and creative aspirations</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Technical Details</h3>
                <p className="text-gray-300 text-sm">Share specifications, requirements, and constraints</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Upload Assets</h3>
                <p className="text-gray-300 text-sm">Share brand assets, references, and inspiration</p>
              </div>
            </motion.div>
          )}

          {/* Estimated Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="flex items-center justify-center space-x-2 mb-8 text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Estimated time: {isBoothBrief ? "10-15 minutes" : "5-7 minutes"}</span>
          </motion.div>

          {/* Start Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] hover:from-[#6ee8c5] hover:to-[#a694ff] text-[#2c2c2b] font-semibold px-12 py-6 rounded-full text-xl transition-all duration-300 shadow-2xl hover:shadow-[#7afdd6]/25"
          >
            {isBoothBrief ? "Start Your Brief" : "Begin Survey"}
          </motion.button>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="text-gray-400 text-sm mt-8"
          >
            {isBoothBrief ? (
              "Your information is confidential and will only be used to create your perfect booth design."
            ) : (
              "Your responses are anonymous and will help us improve our services."
            )}
          </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
