// components/ToasterProvider.tsx
'use client';

import { Toaster } from 'react-hot-toast';

// Version avec effets sophistiqués
export const ToasterProvider = () => {
  return (
    <Toaster
      position="bottom-center"
      gutter={16}
      toastOptions={{
        duration: 3500,
        style: {
          background: 'linear-gradient(135deg, #2C2C2C 0%, #3C3C3C 100%)',
          color: '#fce2c4ff', // BLANC crème
          border: '1px solid #D4A017', // OR
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 6px 20px rgba(165, 42, 42, 0.4)',
          padding: '12px 16px',
        },
        success: {
          duration: 2500,
          style: {
            background: 'linear-gradient(135deg, #2C2C2C 0%, #1a3a1a 100%)',
            color: '#fce2c4ff',
            border: '1px solid #D4A017', // OR
            borderLeft: '8px solid #D4A017', // Accent OR
          },
          iconTheme: {
            primary: '#D4A017', // OR
            secondary: '#2C2C2C',
          },
        },
        error: {
          duration: 4500,
          style: {
            background: 'linear-gradient(135deg, #2C2C2C 0%, #3a1a1a 100%)',
            color: '#fce2c4ff',
            border: '1px solid #FF0000', // ROUGE
            borderLeft: '8px solid #FF0000',
          },
          iconTheme: {
            primary: '#FF0000', // ROUGE
            secondary: '#2C2C2C',
          },
        },
        loading: {
          style: {
            background: 'linear-gradient(135deg, #2C2C2C 0%, #2a2a3a 100%)',
            color: '#C0C0C0', // ARGENT pour le texte
            border: '1px solid #C0C0C0', // ARGENT
            borderLeft: '8px solid #C0C0C0',
          },
          iconTheme: {
            primary: '#C0C0C0', // ARGENT
            secondary: '#2C2C2C',
          },
        },
      }}
    />
  );
};