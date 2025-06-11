'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function NutritionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}