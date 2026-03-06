'use client';

import { useEffect } from 'react';

export default function TermsPage() {
  // Set page title
  useEffect(() => {
    document.title = 'Terms of Service | IOBIT';
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
      <p className="text-white text-lg">Terms of Service</p>
    </div>
  );
}
