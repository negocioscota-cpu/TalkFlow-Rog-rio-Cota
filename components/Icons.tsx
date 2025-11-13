
import React from 'react';

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "animate-spin -ml-1 mr-3 h-5 w-5 text-white" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const PlayIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const PauseIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

export const GenerateIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.25c-5.376 0-9.75 4.374-9.75 9.75s4.374 9.75 9.75 9.75 9.75-4.374 9.75-9.75S17.376 2.25 12 2.25Zm-1.72 4.97a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06L14.69 12 10.22 7.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

export const CombineIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M13.5 3.75A2.25 2.25 0 0 0 11.25 6v1.5h1.5V6a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75h-1.5v1.5h1.5a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-4.5ZM12.75 12.75a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H15A.75.75 0 0 0 15 15h-2.25v-2.25Z" clipRule="evenodd" />
        <path d="M3.75 6A2.25 2.25 0 0 0 1.5 8.25v9.75A2.25 2.25 0 0 0 3.75 20.25h9.75A2.25 2.25 0 0 0 15.75 18v-3.75a.75.75 0 0 0-1.5 0V18a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V8.25a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 0 0-1.5H3.75Z" />
    </svg>
);

export const SequenceIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 4.5A.75.75 0 0 0 1.5 5.25v13.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 0-1.5H3V6A.75.75 0 0 1 3.75 6H15a.75.75 0 0 0 0-1.5H2.25ZM21.75 9a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 .75-.75Zm.75 5.25a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1 0-1.5h4.5a.75.75 0 0 1 .75.75Z" clipRule="evenodd" />
    </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.25 3.25-1.5-1.5a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.75-3.75Z" clipRule="evenodd" />
    </svg>
);

export const XCircleIcon: React.FC<{ className?: string; title?: string }> = ({ className = "w-6 h-6", title }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        {title && <title>{title}</title>}
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
    </svg>
);

export const DirectorIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-7.19c0-1.06-.375-2.098-.985-2.884l-1.5-1.875a.75.75 0 0 1 .93-1.166l1.375.862c.42.264.9.404 1.385.404Z" clipRule="evenodd" />
      <path d="M3 13.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 13.5ZM3.75 17.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3ZM9.75 15.75a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75ZM7.5 19.5a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" />
    </svg>
);
