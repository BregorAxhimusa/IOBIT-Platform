'use client';

import { useEffect } from 'react';

export default function PrivacyPage() {
  // Set page title
  useEffect(() => {
    document.title = 'Privacy Policy | IOBIT';
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
      <p className="text-white text-lg">Privacy Policy</p>
    </div>
  );
}
