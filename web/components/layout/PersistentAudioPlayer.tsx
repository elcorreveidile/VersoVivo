'use client';

import { useAudio } from '@/contexts/AudioContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PersistentAudioPlayer() {
  const audio = useAudio();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  // Show player when audio is playing
  useEffect(() => {
    if (audio.isPlaying && audio.currentPoemId) {
      setIsVisible(true);
    } else if (!audio.isPlaying && !audio.currentUrl) {
      // Hide player when stopped
      setIsVisible(false);
    }
  }, [audio.isPlaying, audio.currentPoemId, audio.currentUrl]);

  // Don't render if no audio is active
  if (!isVisible || !audio.currentPoemId) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePoemClick = () => {
    if (audio.currentPoemId) {
      router.push(`/poem/${audio.currentPoemId}`);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-[#FFD700]/20 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-3">
          {/* Play/Pause Button */}
          <button
            onClick={() => audio.isPlaying ? audio.pause() : audio.resume()}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-[#FFD700] flex items-center justify-center hover:bg-[#FFEC8B] transition-colors shadow-lg"
          >
            <span className="text-black text-xl">{audio.isPlaying ? '⏸' : '▶'}</span>
          </button>

          {/* Stop Button */}
          <button
            onClick={() => audio.stop()}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-lg">⏹</span>
          </button>

          {/* Progress Bar */}
          <div className="flex-1 min-w-0">
            <input
              type="range"
              min="0"
              max={audio.duration || 0}
              value={audio.currentTime}
              onChange={(e) => audio.seek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>{formatTime(audio.currentTime)}</span>
              <span>{formatTime(audio.duration)}</span>
            </div>
          </div>

          {/* Audio Type Indicator */}
          <div className="hidden sm:flex flex-shrink-0 items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <span className="text-lg">
              {audio.currentType === 'music' ? '🎵' : audio.currentType === 'voice' ? '🎙️' : '🎬'}
            </span>
            <span className="text-xs text-white/80">
              {audio.currentType === 'music' ? 'Música' : audio.currentType === 'voice' ? 'Narración' : 'Video'}
            </span>
          </div>

          {/* Go to Poem Button */}
          {audio.currentPoemId && (
            <button
              onClick={handlePoemClick}
              className="flex-shrink-0 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-colors text-xs sm:text-sm text-white/80 hover:text-white"
            >
              Ver poema
            </button>
          )}

          {/* Close/Hide Button */}
          <button
            onClick={() => {
              audio.pause();
              setIsVisible(false);
            }}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <span className="text-white text-sm">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}
