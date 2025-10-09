"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-300">Progress</span>
        <span className="text-sm font-semibold text-[#7afdd6]">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden shadow-inner border border-white/30">
        <motion.div
          className="h-full bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] rounded-full shadow-lg relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "linear"
            }}
          />
        </motion.div>
      </div>
      <div className="mt-2 text-xs text-gray-400 text-center">
        Complete all required fields to continue
      </div>
    </div>
  );
}
