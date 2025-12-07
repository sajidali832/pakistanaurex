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
        {/* Background gradient circle */}
        <defs>
          <linearGradient id="aurexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
          </linearGradient>
          <linearGradient id="aurexAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary-foreground))" />
            <stop offset="100%" stopColor="hsl(var(--primary-foreground) / 0.9)" />
          </linearGradient>
        </defs>
        
        {/* Main circle background */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill="url(#aurexGradient)"
        />
        
        {/* Stylized "A" mark */}
        <path
          d="M24 10L12 38H18L20 33H28L30 38H36L24 10Z"
          fill="url(#aurexAccent)"
        />
        <path
          d="M21.5 28L24 20L26.5 28H21.5Z"
          fill="url(#aurexGradient)"
        />
        
        {/* Accent line representing exchange/transaction */}
        <path
          d="M14 22H20M28 22H34"
          stroke="url(#aurexAccent)"
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
      <defs>
        <linearGradient id="aurexGradientMark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
        </linearGradient>
        <linearGradient id="aurexAccentMark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary-foreground))" />
          <stop offset="100%" stopColor="hsl(var(--primary-foreground) / 0.9)" />
        </linearGradient>
      </defs>
      
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="url(#aurexGradientMark)"
      />
      
      <path
        d="M24 10L12 38H18L20 33H28L30 38H36L24 10Z"
        fill="url(#aurexAccentMark)"
      />
      <path
        d="M21.5 28L24 20L26.5 28H21.5Z"
        fill="url(#aurexGradientMark)"
      />
      
      <path
        d="M14 22H20M28 22H34"
        stroke="url(#aurexAccentMark)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default AurexLogo;
