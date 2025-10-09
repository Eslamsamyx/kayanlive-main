"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import type { Question } from "./types";
import { DateInput } from "./DateInput";
import { RangeSlider } from "./RangeSlider";

interface QuestionCardProps {
  question: Question;
  answer?: string | string[] | Record<string, string>;
  files?: File[];
  onAnswer: (questionId: number, answer: string | string[] | Record<string, string>) => void;
  onFileUpload: (questionId: number, files: File[]) => void;
}

export function QuestionCard({ question, answer, files, onAnswer, onFileUpload }: QuestionCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onFileUpload(question.id, selectedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    onFileUpload(question.id, droppedFiles);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      onAnswer(question.id, dataURL);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onAnswer(question.id, "");
  };

  const renderQuestionContent = () => {
    const currentAnswer = answer || "";
    const currentArrayAnswer = Array.isArray(answer) ? answer : [];
    const currentObjectAnswer = (typeof answer === 'object' && !Array.isArray(answer)) ? answer as Record<string, string> : {};

    switch (question.type) {
      case "text":
      case "email":
      case "phone":
      case "url":
        return (
          <input
            type={question.type === "email" ? "email" : question.type === "phone" ? "tel" : question.type === "url" ? "url" : "text"}
            value={currentAnswer as string}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            maxLength={question.maxLength}
            minLength={question.minLength}
            className="w-full p-3 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white placeholder-gray-400 focus:border-[#7afdd6] focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/[0.25] focus:bg-white/[0.12] transition-all duration-200"
          />
        );

      case "textarea":
        return (
          <textarea
            value={currentAnswer as string}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            maxLength={question.maxLength}
            minLength={question.minLength}
            rows={4}
            className="w-full p-3 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white placeholder-gray-400 focus:border-[#7afdd6] focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/[0.25] focus:bg-white/[0.12] transition-all duration-200 resize-vertical min-h-[100px]"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={currentAnswer as string}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
            step={question.step}
            className="w-full p-3 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white placeholder-gray-400 focus:border-[#7afdd6] focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/[0.25] focus:bg-white/[0.12] transition-all duration-200"
          />
        );

      case "select":
        return (
          <select
            value={currentAnswer as string}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            className="w-full p-3 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white focus:border-[#7afdd6] focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/[0.25] focus:bg-white/[0.12] transition-all duration-200"
          >
            <option value="" disabled>Select an option...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={typeof option === 'string' ? option : option.value}>
                {typeof option === 'string' ? option : option.label}
              </option>
            ))}
          </select>
        );

      case "multiple-choice":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const isSelected = currentAnswer === (typeof option === 'string' ? option : option.value);

              return (
                <motion.label
                  key={index}
                  className={`relative flex items-center p-3 cursor-pointer rounded-lg backdrop-blur-sm border transition-all duration-200 group ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#7afdd6]/[0.15] to-[#b8a4ff]/[0.15] border-[#7afdd6]/[0.4] shadow-sm'
                      : 'bg-white/[0.04] border-white/[0.12] hover:border-[#7afdd6]/[0.3] hover:bg-[#7afdd6]/[0.08]'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Custom Radio Button */}
                  <div className="relative mr-4">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={typeof option === 'string' ? option : option.value}
                      checked={isSelected}
                      onChange={(e) => onAnswer(question.id, e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                        isSelected
                          ? 'border-[#7afdd6] bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] shadow-lg shadow-[#7afdd6]/30'
                          : 'border-white/50 bg-white/10 group-hover:border-[#7afdd6]'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          className="w-2.5 h-2.5 bg-white rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Option Text */}
                  <div className="flex-1">
                    <span className={`font-medium transition-colors duration-200 ${
                      isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {typeof option === 'string' ? option : option.label}
                    </span>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </motion.label>
              );
            })}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            {/* Selection Summary */}
            {currentArrayAnswer.length > 0 && (
              <motion.div
                className="p-2.5 bg-gradient-to-r from-[#7afdd6]/[0.1] to-[#b8a4ff]/[0.1] backdrop-blur-sm border border-[#7afdd6]/[0.25] rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#7afdd6] text-sm font-medium">
                    {currentArrayAnswer.length} selected
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {currentArrayAnswer.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] rounded-full"></div>
                    ))}
                    {currentArrayAnswer.length > 3 && (
                      <span className="text-[#7afdd6] text-xs">+{currentArrayAnswer.length - 3}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {question.options?.map((option, index) => {
              const isSelected = currentArrayAnswer.includes(typeof option === 'string' ? option : option.value);

              return (
                <motion.label
                  key={index}
                  className={`relative flex items-center p-3 cursor-pointer rounded-lg backdrop-blur-sm border transition-all duration-200 group ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#7afdd6]/[0.15] to-[#b8a4ff]/[0.15] border-[#7afdd6]/[0.4] shadow-sm'
                      : 'bg-white/[0.04] border-white/[0.12] hover:border-[#7afdd6]/[0.3] hover:bg-[#7afdd6]/[0.08]'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Custom Checkbox */}
                  <div className="relative mr-4">
                    <input
                      type="checkbox"
                      value={typeof option === 'string' ? option : option.value}
                      checked={isSelected}
                      onChange={(e) => {
                        const value = e.target.value;
                        const newAnswer = e.target.checked
                          ? [...currentArrayAnswer, value]
                          : currentArrayAnswer.filter(item => item !== value);
                        onAnswer(question.id, newAnswer);
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        isSelected
                          ? 'border-[#7afdd6] bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] shadow-lg shadow-[#7afdd6]/30'
                          : 'border-white/50 bg-white/10 group-hover:border-[#7afdd6]'
                      }`}
                    >
                      {isSelected && (
                        <motion.svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </motion.svg>
                      )}
                    </div>
                  </div>

                  {/* Option Text */}
                  <div className="flex-1">
                    <span className={`font-medium transition-colors duration-200 ${
                      isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {typeof option === 'string' ? option : option.label}
                    </span>
                  </div>

                  {/* Selection Badge */}
                  {isSelected && (
                    <motion.div
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <div className="px-2 py-1 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] rounded-full text-xs text-white font-medium">
                        ✓
                      </div>
                    </motion.div>
                  )}
                </motion.label>
              );
            })}
          </div>
        );

      case "rating":
      case "star-rating":
        const maxRating = question.max || 10;
        const minRating = question.min || 1;
        const currentRating = parseInt(currentAnswer as string) || 0;

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">
                {question.labels?.[0] || `${minRating} - Poor`}
              </span>
              <span className="text-gray-400">
                {question.labels?.[1] || `${maxRating} - Excellent`}
              </span>
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: maxRating - minRating + 1 }, (_, i) => {
                const value = minRating + i;
                return (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => onAnswer(question.id, value.toString())}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                      currentRating >= value
                        ? 'bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] text-white'
                        : 'bg-white/10 text-gray-400 hover:bg-[#7afdd6]/20'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {question.type === "star-rating" ? "★" : value}
                  </motion.button>
                );
              })}
            </div>
            {currentRating > 0 && (
              <div className="text-center text-[#7afdd6] font-medium">
                Selected: {currentRating}/{maxRating}
              </div>
            )}
          </div>
        );

      case "slider":
      case "percentage":
        const sliderValue = parseInt(currentAnswer as string) || question.min || 0;
        const sliderMax = question.max || 100;
        const sliderMin = question.min || 0;
        const sliderStep = question.step || 1;
        const sliderUnit = question.unit || (question.type === "percentage" ? "%" : "");

        return (
          <RangeSlider
            value={sliderValue}
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            unit={sliderUnit}
            onChange={(value) => onAnswer(question.id, value.toString())}
            labels={question.labels as [string, string] | undefined}
          />
        );

      case "boolean":
        const booleanAnswer = currentAnswer === "true";
        return (
          <div className="flex space-x-4">
            <motion.button
              type="button"
              onClick={() => onAnswer(question.id, "true")}
              className={`flex-1 p-4 rounded-xl font-semibold transition-all duration-200 ${
                booleanAnswer
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'bg-slate-700/50 text-gray-400 hover:bg-green-500/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {question.trueLabel || "Yes"}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => onAnswer(question.id, "false")}
              className={`flex-1 p-4 rounded-xl font-semibold transition-all duration-200 ${
                !booleanAnswer && currentAnswer !== ""
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                  : 'bg-slate-700/50 text-gray-400 hover:bg-red-500/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {question.falseLabel || "No"}
            </motion.button>
          </div>
        );

      case "color":
        return (
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={currentAnswer as string || "#8b5cf6"}
              onChange={(e) => onAnswer(question.id, e.target.value)}
              className="w-12 h-12 rounded-lg border border-white/[0.15] cursor-pointer bg-white/[0.08]"
            />
            <input
              type="text"
              value={currentAnswer as string || ""}
              onChange={(e) => onAnswer(question.id, e.target.value)}
              placeholder="#8b5cf6"
              className="flex-1 p-3 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white placeholder-gray-400 focus:border-[#7afdd6] focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/[0.25] focus:bg-white/[0.12] transition-all duration-200"
            />
          </div>
        );

      case "date":
        return (
          <DateInput
            value={currentAnswer as string}
            onChange={(date) => onAnswer(question.id, date)}
            placeholder={question.placeholder}
            required={question.required}
          />
        );

      case "date-range":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium text-sm mb-2">
                {question.startLabel || "Start Date"}
              </label>
              <DateInput
                value={currentObjectAnswer.startDate || ""}
                onChange={(date) => onAnswer(question.id, { ...currentObjectAnswer, startDate: date })}
                placeholder="Select start date"
              />
            </div>
            <div>
              <label className="block text-white font-medium text-sm mb-2">
                {question.endLabel || "End Date"}
              </label>
              <DateInput
                value={currentObjectAnswer.endDate || ""}
                onChange={(date) => onAnswer(question.id, { ...currentObjectAnswer, endDate: date })}
                placeholder="Select end date"
              />
            </div>
          </div>
        );

      case "time":
        return (
          <input
            type="time"
            value={currentAnswer as string}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            className="w-full p-3 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white focus:border-[#7afdd6] focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/[0.25] focus:bg-white/[0.12] transition-all duration-200"
          />
        );

      case "currency":
        return (
          <div className="flex items-center">
            <span className="px-3 py-3 bg-white/[0.08] border border-r-0 border-white/[0.15] rounded-l-lg text-gray-300 text-sm">
              {question.currency || "$"}
            </span>
            <input
              type="number"
              value={currentAnswer as string}
              onChange={(e) => onAnswer(question.id, e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="flex-1 p-3 bg-white/[0.08] border border-white/[0.15] rounded-r-lg text-white placeholder-gray-400 focus:border-[#7afdd6] focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/[0.25] focus:bg-white/[0.12] transition-all duration-200"
            />
          </div>
        );

      case "emoji-rating":
        const emojis = ["😡", "😞", "😐", "😊", "😍"];
        const emojiLabels = ["Very Bad", "Bad", "Neutral", "Good", "Excellent"];
        const emojiValue = parseInt(currentAnswer as string) || 0;

        return (
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              {emojis.map((emoji, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => onAnswer(question.id, (index + 1).toString())}
                  className={`text-4xl p-3 rounded-full transition-all duration-200 ${
                    emojiValue === index + 1
                      ? 'bg-[#7afdd6]/30 scale-110'
                      : 'hover:bg-[#7afdd6]/10 hover:scale-105'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
            {emojiValue > 0 && (
              <div className="text-center text-[#7afdd6] font-medium">
                {emojiLabels[emojiValue - 1]}
              </div>
            )}
          </div>
        );

      case "likert-scale":
        const likertOptions = question.scaleLabels || ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
        const selectedIndex = likertOptions.findIndex(option => option === currentAnswer);

        return (
          <div className="space-y-6">
            {/* Scale Header */}
            <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></div>
                <span className="text-gray-400 text-sm font-medium">Strongly Disagree</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm font-medium">Strongly Agree</span>
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
              </div>
            </div>

            {/* Interactive Scale Options */}
            <div className="grid grid-cols-1 gap-3">
              {likertOptions.map((option, index) => {
                const isSelected = currentAnswer === option;
                const intensity = index / (likertOptions.length - 1); // 0 to 1
                const gradientColors = intensity < 0.5
                  ? `from-red-${Math.round(500 - intensity * 200)}/20 to-orange-${Math.round(400 + intensity * 100)}/20`
                  : `from-blue-${Math.round(400 + (intensity - 0.5) * 200)}/20 to-green-${Math.round(400 + (intensity - 0.5) * 200)}/20`;

                return (
                  <motion.label
                    key={index}
                    className={`relative flex items-center p-4 cursor-pointer rounded-xl backdrop-blur-sm border transition-all duration-300 group ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20 border-[#7afdd6]/50 shadow-lg shadow-[#7afdd6]/20'
                        : 'bg-slate-800/40 border-slate-600/30 hover:border-purple-500/40 hover:bg-purple-500/5'
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Custom Radio Button */}
                    <div className="relative mr-4">
                      <input
                        type="radio"
                        name={`likert-${question.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={(e) => onAnswer(question.id, e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#7afdd6] bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] shadow-lg shadow-[#7afdd6]/30'
                            : 'border-white/50 bg-white/10 group-hover:border-[#7afdd6]'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            className="w-2.5 h-2.5 bg-white rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Option Text */}
                    <div className="flex-1">
                      <span className={`font-medium transition-colors duration-200 ${
                        isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {option}
                      </span>
                    </div>

                    {/* Agreement Level Indicator */}
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-4 rounded-full transition-all duration-200 ${
                              i <= index
                                ? index < 2
                                  ? 'bg-gradient-to-t from-red-500 to-orange-500'
                                  : index === 2
                                  ? 'bg-gradient-to-t from-yellow-500 to-amber-500'
                                  : 'bg-gradient-to-t from-green-500 to-emerald-500'
                                : 'bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Selection Glow Effect */}
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.label>
                );
              })}
            </div>

            {/* Selection Summary */}
            {currentAnswer && (
              <motion.div
                className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedIndex < 2
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : selectedIndex === 2
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}></div>
                    <span className="text-purple-300 font-medium">
                      Your response: {typeof currentAnswer === 'string' ? currentAnswer : JSON.stringify(currentAnswer)}
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {selectedIndex + 1} of {likertOptions.length}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );

      case "ranking":
        const rankingOptions = question.options as string[] || [];
        const rankedItems = currentArrayAnswer;
        const maxSelections = question.maxSelections || rankingOptions.length;

        return (
          <div className="space-y-3">
            <div className="text-sm text-gray-400 mb-4">
              Drag to reorder or click to select (max {maxSelections} items)
            </div>
            {rankingOptions.map((option, index) => {
              const rank = rankedItems.indexOf(option);
              const isSelected = rank !== -1;

              return (
                <motion.div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50'
                      : 'bg-slate-700/30 hover:bg-purple-500/10'
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      const newRanking = rankedItems.filter(item => item !== option);
                      onAnswer(question.id, newRanking);
                    } else if (rankedItems.length < maxSelections) {
                      onAnswer(question.id, [...rankedItems, option]);
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSelected && (
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                      {rank + 1}
                    </div>
                  )}
                  <span className="text-white flex-1">{option}</span>
                </motion.div>
              );
            })}
          </div>
        );

      case "matrix":
        return (
          <div className="space-y-6">
            {/* Matrix Header */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-center space-x-8 p-4 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
                <div className="w-32"></div> {/* Spacer for row labels */}
                {question.columns?.map((column, index) => (
                  <div
                    key={index}
                    className="flex-1 text-center px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg border border-purple-500/30"
                  >
                    <span className="text-purple-300 font-medium text-sm">
                      {column}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Matrix Rows */}
            <div className="space-y-3">
              {question.rows?.map((row, rowIndex) => (
                <motion.div
                  key={rowIndex}
                  className="flex items-center space-x-8 p-4 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-600/30 hover:border-purple-500/40 transition-all duration-300"
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(139, 92, 246, 0.05)" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIndex * 0.1 }}
                >
                  {/* Row Label */}
                  <div className="w-32 flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                      {row}
                    </span>
                  </div>

                  {/* Rating Options */}
                  <div className="flex-1 flex items-center justify-between space-x-4">
                    {question.columns?.map((column, colIndex) => {
                      // Special handling for quantity column (typically the third column)
                      const isQuantityColumn = column.toLowerCase() === 'quantity' || colIndex === 2;
                      const isYesSelected = currentObjectAnswer[row] === 'Yes' || currentObjectAnswer[row]?.toString().toLowerCase() === 'yes';

                      if (isQuantityColumn) {
                        return (
                          <div key={colIndex} className="flex-1 flex items-center justify-center">
                            {isYesSelected ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={currentObjectAnswer[`${row}_quantity`] || ''}
                                onChange={(e) => {
                                  onAnswer(question.id, {
                                    ...currentObjectAnswer,
                                    [`${row}_quantity`]: e.target.value
                                  });
                                }}
                                className="w-20 p-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white text-center focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                placeholder="0"
                              />
                            ) : (
                              <div className="w-20 h-10 flex items-center justify-center text-gray-500 text-sm">
                                -
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <motion.label
                          key={colIndex}
                          className="flex-1 flex items-center justify-center cursor-pointer group"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="relative">
                            <input
                              type="radio"
                              name={`matrix-${question.id}-${rowIndex}`}
                              value={column}
                              checked={currentObjectAnswer[row] === column}
                              onChange={(e) => {
                                const newAnswer = {
                                  ...currentObjectAnswer,
                                  [row]: e.target.value
                                };
                                // Clear quantity if "No" is selected
                                if (e.target.value.toLowerCase() === 'no') {
                                  delete newAnswer[`${row}_quantity`];
                                }
                                onAnswer(question.id, newAnswer);
                              }}
                              className="sr-only"
                            />
                            <div
                              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                                currentObjectAnswer[row] === column
                                  ? 'border-[#7afdd6] bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] shadow-lg shadow-[#7afdd6]/30'
                                  : 'border-slate-500 bg-slate-700/50 group-hover:border-purple-400 group-hover:bg-purple-500/10'
                              }`}
                            >
                              {currentObjectAnswer[row] === column && (
                                <motion.div
                                  className="w-3 h-3 bg-white rounded-full"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.2, ease: "easeOut" }}
                                />
                              )}
                            </div>
                          </div>
                        </motion.label>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Progress Indicator */}
            {Object.keys(currentObjectAnswer).length > 0 && (
              <motion.div
                className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Progress: {Object.keys(currentObjectAnswer).length} of {question.rows?.length || 0} completed
                  </span>
                  <div className="flex space-x-1">
                    {question.rows?.map((row, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          currentObjectAnswer[row] ? 'bg-purple-500' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );

      case "address":
        const addressFields = ["street", "city", "state", "zipCode", "country"];
        const addressLabels = {
          street: "Street Address",
          city: "City",
          state: "State/Province",
          zipCode: "ZIP/Postal Code",
          country: "Country"
        };

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addressFields.map((field) => (
              <div key={field} className={field === "street" ? "md:col-span-2" : ""}>
                <label className="block text-white font-medium text-sm mb-2">
                  {addressLabels[field as keyof typeof addressLabels]}
                </label>
                <input
                  type="text"
                  value={currentObjectAnswer[field] || ""}
                  onChange={(e) => onAnswer(question.id, {
                    ...currentObjectAnswer,
                    [field]: e.target.value
                  })}
                  className="w-full p-3 bg-slate-700/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        );

      case "signature":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center">
              <div className="text-gray-400 mb-4">Digital Signature</div>
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="border border-purple-500/30 rounded-lg bg-white cursor-crosshair mx-auto"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
              <div className="mt-4 space-x-4">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        );

      case "drawing":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-4">
              <canvas
                ref={canvasRef}
                width={question.canvasWidth || 600}
                height={question.canvasHeight || 400}
                className="border border-purple-500/30 rounded-lg bg-white cursor-crosshair w-full"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Clear Drawing
                </button>
              </div>
            </div>
          </div>
        );

      case "multi-field":
        return (
          <div className="space-y-4">
            {question.fields?.map((field) => (
              <div key={field.id}>
                <label className="block text-white font-medium text-sm mb-2">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    value={currentObjectAnswer[field.id] || ""}
                    onChange={(e) => {
                      const updatedAnswer = {
                        ...currentObjectAnswer,
                        [field.id]: e.target.value
                      };
                      onAnswer(question.id, updatedAnswer);
                    }}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full p-3 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white placeholder-gray-400 focus:border-[#7afdd6] focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/[0.25] focus:bg-white/[0.12] transition-all duration-200 resize-vertical min-h-[80px]"
                  />
                ) : field.type === "range" ? (
                  <RangeSlider
                    value={parseInt(currentObjectAnswer[field.id] || "0") || field.min || 0}
                    min={field.min || 0}
                    max={field.max || 100}
                    step={field.step || 1}
                    unit={field.unit || ""}
                    onChange={(value) => {
                      const updatedAnswer = {
                        ...currentObjectAnswer,
                        [field.id]: value.toString()
                      };
                      onAnswer(question.id, updatedAnswer);
                    }}
                  />
                ) : field.type === "date" ? (
                  <DateInput
                    value={currentObjectAnswer[field.id] || ""}
                    onChange={(date) => {
                      const updatedAnswer = {
                        ...currentObjectAnswer,
                        [field.id]: date
                      };
                      onAnswer(question.id, updatedAnswer);
                    }}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "url" ? "url" : field.type === "number" ? "number" : "text"}
                    value={currentObjectAnswer[field.id] || ""}
                    onChange={(e) => {
                      const updatedAnswer = {
                        ...currentObjectAnswer,
                        [field.id]: e.target.value
                      };
                      onAnswer(question.id, updatedAnswer);
                    }}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    className="w-full p-3 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white placeholder-gray-400 focus:border-[#7afdd6] focus:outline-none focus:ring-2 focus:ring-[#7afdd6]/[0.25] focus:bg-white/[0.12] transition-all duration-200"
                  />
                )}
              </div>
            ))}
          </div>
        );

      case "file-upload":
      case "video-upload":
        const acceptedTypes = question.accept || (question.type === "video-upload" ? ".mp4,.mov,.avi,.mkv" : "*");

        return (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-4xl mb-4">
                {question.type === "video-upload" ? "🎥" : "📁"}
              </div>
              <div className="text-white font-medium mb-2">
                {question.type === "video-upload" ? "Upload Video Files" : "Upload Files"}
              </div>
              <div className="text-gray-400 text-sm mb-4">
                Drag and drop files here, or click to browse
              </div>
              <div className="text-xs text-gray-500">
                Accepted formats: {acceptedTypes}
                {question.maxSize && ` • Max size: ${question.maxSize}`}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes}
              multiple={question.multiple}
              onChange={handleFileChange}
              className="hidden"
            />

            {files && files.length > 0 && (
              <div className="space-y-2">
                <div className="text-white font-medium">Uploaded Files:</div>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {question.type === "video-upload" ? "🎥" : "📄"}
                      </div>
                      <div>
                        <div className="text-white text-sm">{file.name}</div>
                        <div className="text-gray-400 text-xs">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-400 p-8">
            Question type "{question.type}" not yet implemented
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-white/[0.06] to-white/[0.1] backdrop-blur-sm rounded-xl p-6 border border-white/[0.12] hover:border-white/[0.18] transition-all duration-300 hover:from-white/[0.08] hover:to-white/[0.12]"
    >
      <div className="mb-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-medium text-white leading-tight pr-4">{question.question}</h3>
          {question.required && (
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/[0.15] text-red-400 border border-red-500/[0.25]">
                Required
              </span>
            </div>
          )}
        </div>
        {question.helpText && (
          <p className="text-gray-400 text-sm leading-relaxed">{question.helpText}</p>
        )}
      </div>

      <div className="space-y-3">
        {renderQuestionContent()}
      </div>
    </motion.div>
  );
}
