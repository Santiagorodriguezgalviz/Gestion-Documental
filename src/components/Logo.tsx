import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'login';
}

export function Logo({ className = "w-8 h-8", variant = 'default' }: LogoProps) {
  if (variant === 'login') {
    return (
      <div className="relative">
        {/* Fondo con efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-xl" />
        
        {/* Logo principal */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${className} relative z-10`}
        >
          {/* Efecto de resplandor */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Fondo del logo */}
          <path
            d="M4 8C4 5.79086 5.79086 4 8 4H16C18.2091 4 20 5.79086 20 8V16C20 18.2091 18.2091 20 16 20H8C5.79086 20 4 18.2091 4 16V8Z"
            className="fill-emerald-100 dark:fill-emerald-900/30"
            filter="url(#glow)"
          />

          {/* Documento */}
          <path
            d="M9 7C8.44772 7 8 7.44772 8 8V16C8 16.5523 8.44772 17 9 17H15C15.5523 17 16 16.5523 16 16V10.4142C16 10.149 15.8946 9.89464 15.7071 9.70711L13.2929 7.29289C13.1054 7.10536 12.851 7 12.5858 7H9Z"
            className="fill-emerald-500 dark:fill-emerald-400"
          />

          {/* Esquina doblada con animación */}
          <path
            d="M13 7V10C13 10.5523 13.4477 11 14 11H16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="stroke-emerald-600 dark:stroke-emerald-300 animate-fold"
          />

          {/* Líneas decorativas */}
          <path
            d="M10 12H14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="stroke-emerald-200 dark:stroke-emerald-700"
          />
          <path
            d="M10 14H12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="stroke-emerald-200 dark:stroke-emerald-700"
          />
        </svg>
      </div>
    );
  }

  // Versión default para el resto de la aplicación
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 8C4 5.79086 5.79086 4 8 4H16C18.2091 4 20 5.79086 20 8V16C20 18.2091 18.2091 20 16 20H8C5.79086 20 4 18.2091 4 16V8Z"
        className="fill-emerald-100 dark:fill-emerald-900/30"
      />
      <path
        d="M9 7C8.44772 7 8 7.44772 8 8V16C8 16.5523 8.44772 17 9 17H15C15.5523 17 16 16.5523 16 16V10.4142C16 10.149 15.8946 9.89464 15.7071 9.70711L13.2929 7.29289C13.1054 7.10536 12.851 7 12.5858 7H9Z"
        className="fill-emerald-500 dark:fill-emerald-400"
      />
      <path
        d="M13 7V10C13 10.5523 13.4477 11 14 11H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="stroke-emerald-600 dark:stroke-emerald-300"
      />
    </svg>
  );
} 