"use client";

import React from 'react';

interface AurexLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
}

const sizes = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
  xl: { icon: 48, text: 'text-3xl' },
};

export function AurexLogo({ size = 'md', variant = 'full', className = '' }: AurexLogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Main circle background */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          className="fill-primary"
        />
        
        {/* Stylized "A" mark */}
        <path
          d="M24 10L12 38H18L20 33H28L30 38H36L24 10Z"
          className="fill-primary-foreground"
        />
        <path
          d="M21.5 28L24 20L26.5 28H21.5Z"
          className="fill-primary"
        />
        
        {/* Accent line representing exchange/transaction */}
        <path
          d="M14 22H20M28 22H34"
          className="stroke-primary-foreground"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      
      {variant === 'full' && (
        <span className={`font-bold tracking-tight ${text}`}>
          AUREX
        </span>
      )}
    </div>
  );
}

export function AurexLogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        className="fill-primary"
      />
      
      <path
        d="M24 10L12 38H18L20 33H28L30 38H36L24 10Z"
        className="fill-primary-foreground"
      />
      <path
        d="M21.5 28L24 20L26.5 28H21.5Z"
        className="fill-primary"
      />
      
      <path
        d="M14 22H20M28 22H34"
        className="stroke-primary-foreground"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default AurexLogo;