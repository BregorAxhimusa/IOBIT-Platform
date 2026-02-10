'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      containerStyle={{ bottom: 20, right: 20 }}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#111118',
          color: '#fff',
          border: '1px solid #2a2a3a',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        success: {
          style: {
            background: '#111118',
            color: '#fff',
            border: '1px solid #2a2a3a',
            borderLeft: '3px solid #10B981',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
          },
        },
        error: {
          style: {
            background: '#111118',
            color: '#fff',
            border: '1px solid #2a2a3a',
            borderLeft: '3px solid #EF4444',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#EF4444',
          },
        },
        loading: {
          style: {
            background: '#111118',
            color: '#fff',
            border: '1px solid #2a2a3a',
            borderLeft: '3px solid #3B82F6',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#3B82F6',
          },
        },
      }}
    />
  );
}
