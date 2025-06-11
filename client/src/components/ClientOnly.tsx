// client/src/components/ClientOnly.tsx
'use client';

import { useState, useEffect } from 'react';

// This component ensures that its children are only rendered on the client side.
// This is a standard pattern to prevent hydration errors with components
// that rely on browser-only APIs or state.
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If the component has not yet mounted on the client, render nothing.
  if (!isMounted) {
    return null;
  }

  // Once mounted, render the children.
  return <>{children}</>;
}
