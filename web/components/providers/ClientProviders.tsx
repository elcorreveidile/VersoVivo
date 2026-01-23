'use client';

import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AudioProvider, useAudio } from '@/contexts/AudioContext';
import { Toaster } from '@/components/ui/toast';

// Component to handle audio cleanup on logout
function AudioCleanupOnLogout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const audio = useAudio();

  useEffect(() => {
    // Si el usuario se desloguea (user pasa de tener valor a null), detener el audio
    if (user === null) {
      audio.stop();
    }
  }, [user, audio]);

  return <>{children}</>;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AudioProvider>
        <AudioCleanupOnLogout>
          <Toaster>
            {children}
          </Toaster>
        </AudioCleanupOnLogout>
      </AudioProvider>
    </AuthProvider>
  );
}
