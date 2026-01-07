/**
 * Video Player Component
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import { colors, spacing, typography } from '@theme/index';
import type { Poem } from '@types/index';

interface VideoPlayerProps {
  poem: Poem;
  onProgress?: (currentTime: number) => void;
  onEnd?: () => void;
}

const { width, height } = Dimensions.get('window');

const VideoPlayer: React.FC<VideoPlayerProps> = ({ poem, onProgress, onEnd }) => {
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<Video>(null);

  const handleProgress = useCallback(
    (data: { currentTime: number }) => {
      setCurrentTime(data.currentTime);
      onProgress?.(data.currentTime);
    },
    [onProgress]
  );

  const handleLoad = useCallback((data: { duration: number }) => {
    setDuration(data.duration);
    setLoading(false);
  }, []);

  const handleEnd = useCallback(() => {
    setPaused(true);
    onEnd?.();
  }, [onEnd]);

  const togglePlayPause = useCallback(() => {
    setPaused(prev => !prev);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: poem.videoUrl }}
        style={styles.video}
        paused={paused}
        onProgress={handleProgress}
        onLoad={handleLoad}
        onEnd={handleEnd}
        resizeMode="contain"
        onBuffer={() => setLoading(true)}
        onReadyForDisplay={() => setLoading(false)}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.gold} />
        </View>
      )}

      <TouchableOpacity style={styles.overlay} onPress={togglePlayPause} activeOpacity={1}>
        {paused && !loading && (
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.controls}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` },
            ]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height * 0.7,
    backgroundColor: colors.background.dark,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay.dark,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.overlay.darker,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary.gold,
  },
  playIcon: {
    color: colors.primary.gold,
    fontSize: 32,
    marginLeft: 4,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.overlay.darker,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.darkTertiary,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.gold,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize.xs,
  },
});

export default VideoPlayer;
