'use client';

import React, { forwardRef } from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  variant?: 'filter' | 'status' | 'default';
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>(
  ({
    value,
    onValueChange,
    options,
    placeholder = 'Select option...',
    variant = 'default',
    size = 'md',
    disabled = false,
    className = '',
    icon
  }, ref) => {

    const getVariantStyles = () => {
      switch (variant) {
        case 'filter':
          return {
            trigger: 'bg-white/10 border border-white/20 text-white hover:bg-white/15 focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent',
            content: 'bg-[#2c2c2b] border border-[#7afdd6]/30 shadow-2xl',
            item: 'text-white hover:bg-[#7afdd6]/10 hover:text-[#7afdd6] focus:bg-[#7afdd6]/20 focus:text-[#7afdd6]',
            selectedItem: 'bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20 text-[#7afdd6]'
          };
        case 'status':
          return {
            trigger: 'bg-gradient-to-r text-white border-0 hover:shadow-lg focus:ring-2 focus:ring-white/50',
            content: 'bg-[#2c2c2b] border border-[#7afdd6]/30 shadow-2xl',
            item: 'text-white hover:bg-[#7afdd6]/10 hover:text-[#7afdd6] focus:bg-[#7afdd6]/20 focus:text-[#7afdd6]',
            selectedItem: 'bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20 text-[#7afdd6]'
          };
        default:
          return {
            trigger: 'bg-white/5 border border-white/20 text-white hover:bg-white/10 focus:ring-2 focus:ring-[#7afdd6] focus:border-transparent',
            content: 'bg-[#2c2c2b] border border-[#7afdd6]/30 shadow-2xl',
            item: 'text-white hover:bg-[#7afdd6]/10 hover:text-[#7afdd6] focus:bg-[#7afdd6]/20 focus:text-[#7afdd6]',
            selectedItem: 'bg-gradient-to-r from-[#7afdd6]/20 to-[#b8a4ff]/20 text-[#7afdd6]'
          };
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return {
            trigger: 'px-3 py-2 text-xs',
            content: 'text-xs',
            item: 'px-3 py-2 text-xs'
          };
        default:
          return {
            trigger: 'px-4 py-3 text-sm',
            content: 'text-sm',
            item: 'px-4 py-3 text-sm'
          };
      }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return (
      <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <Select.Trigger
          ref={ref}
          className={`
            relative inline-flex items-center justify-between gap-2 rounded-xl
            transition-all duration-300 cursor-pointer outline-none
            ${variantStyles.trigger}
            ${sizeStyles.trigger}
            ${variant === 'status' ? 'rounded-full' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          style={{
            fontFamily: '"Poppins", sans-serif',
            backdropFilter: variant === 'filter' ? 'blur(10px)' : 'none',
            WebkitBackdropFilter: variant === 'filter' ? 'blur(10px)' : 'none'
          }}
          aria-label={placeholder}
        >
          {icon && (
            <span className="flex-shrink-0 opacity-70">
              {icon}
            </span>
          )}

          <Select.Value
            placeholder={
              <span className="text-white/50">
                {placeholder}
              </span>
            }
          />

          <Select.Icon asChild>
            <motion.div
              animate={{ rotate: 0 }}
              className="flex-shrink-0 opacity-70"
            >
              <ChevronDown size={16} strokeWidth={2} />
            </motion.div>
          </Select.Icon>
        </Select.Trigger>

        <AnimatePresence>
          <Select.Portal>
            <Select.Content
              className={`
                relative z-50 min-w-[8rem] overflow-hidden rounded-xl
                ${variantStyles.content}
                ${sizeStyles.content}
              `}
              style={{
                backdropFilter: 'blur(50px)',
                WebkitBackdropFilter: 'blur(50px)',
                fontFamily: '"Poppins", sans-serif'
              }}
              position="popper"
              side="bottom"
              align="start"
              sideOffset={8}
              asChild
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <Select.ScrollUpButton className="flex cursor-default items-center justify-center py-1 text-white/50">
                  <ChevronUp size={14} />
                </Select.ScrollUpButton>

                <Select.Viewport className="p-1">
                  {options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={`
                        ${variantStyles.item}
                        ${sizeStyles.item}
                        ${value === option.value ? variantStyles.selectedItem : ''}
                      `}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </Select.Viewport>

                <Select.ScrollDownButton className="flex cursor-default items-center justify-center py-1 text-white/50">
                  <ChevronDown size={14} />
                </Select.ScrollDownButton>
              </motion.div>
            </Select.Content>
          </Select.Portal>
        </AnimatePresence>
      </Select.Root>
    );
  }
);

Dropdown.displayName = 'Dropdown';

interface SelectItemProps {
  children: React.ReactNode;
  className?: string;
  value: string;
  disabled?: boolean;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, value, disabled, ...props }, ref) => {
    return (
      <Select.Item
        className={`
          relative flex cursor-pointer select-none items-center rounded-lg
          transition-colors duration-200 outline-none
          data-[disabled]:pointer-events-none data-[disabled]:opacity-50
          ${className || ''}
        `}
        value={value}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        <Select.ItemText className="flex-1">
          {children}
        </Select.ItemText>

        <Select.ItemIndicator className="ml-2 flex-shrink-0">
          <Check size={14} strokeWidth={2} />
        </Select.ItemIndicator>
      </Select.Item>
    );
  }
);

SelectItem.displayName = 'SelectItem';

export default Dropdown;