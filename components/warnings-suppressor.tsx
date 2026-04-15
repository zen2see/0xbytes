'use client';

import { useEffect } from 'react';
import { suppressThreeJsWarnings } from '@/lib/suppress-warnings';

export function WarningsSuppressor() {
  useEffect(() => {
    suppressThreeJsWarnings();
  }, []);

  return null; // This component doesn't render anything
}
