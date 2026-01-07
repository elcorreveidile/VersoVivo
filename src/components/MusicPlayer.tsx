/**
 * Music Player Component
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State,
  Capability,
} from 'react-native-track-player';
import { colors, typography, spacing, borderRadius } from '@theme/index';
import type { Poem } from '@types/index';

interface MusicPlayerProps {
  poem: Poem;
  onProgress?: (currentTime: number) => void;
  onEnd?: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ poem, onProgress, onEnd }) => {
  const [loading, setLoading] = useState(true);
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const [visualizerData] = useState(new Array(20).fill(0).map(() => new Animated.Value(0.3)));

  useEffect(() => {
    setupPlayer();
    return () => {
      TrackPlayer.reset();
    };
  }, [poem]);

  useEffect(() => {
    onProgress?.(progress.position);
  }, [progress.position, onProgress]);

  useEffect(() => {
    // Animate visualizer bars
    const animations = visualizerData.map(value =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: Math.random(),
            duration: 300 + Math.random() * 200,
            useNativeDriver: false,
          }),
          Animated.timing(value, {
            toValue: Math.random() * 0.5,
            duration: 300 + Math.random() * 200,
            useNativeDriver: false,
          }),
        ])
      )
    );

    if (playbackState.state === State.Playing) {
      animations.forEach(anim => anim.start());
    } else {
      animations.forEach(anim => anim.stop());
    }

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [playbackState.state, visualizerData]);

  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SeekTo,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause],
      });

      await TrackPlayer.add({
        id: poem.id,
        url: poem.musicUrl,
        title: poem.title,
        artist: poem.author,
        duration: poem.duration,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error setting up player:', error);
      setLoading(false);
    }
  };

  const togglePlayPause = useCallback(async () => {
    const state = playbackState.state;
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, [playbackState.state]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isPlaying = playbackState.state === State.Playing;

  return (
    <View style={styles.container}>
      {/* Visualizer */}
      <View style={styles.visualizer}>
        {visualizerData.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.visualizerBar,
              {
                height: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['20%', '100%'],
                }),
              },
            ]}
          />
        ))}
      </View>

      {/* Poem Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{poem.title}</Text>
        <Text style={styles.author}>{poem.author}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary.gold} />
        ) : (
          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0
                }%`,
              },
            ]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
          <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  visualizer: {
    flexDirection: 'row',
    height: 200,
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    marginVertical: spacing.xl,
  },
  visualizerBar: {
    width: 4,
    backgroundColor: colors.primary.gold,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: typography.fonts.serif,
  },
  author: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.lg,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.gold,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playIcon: {
    fontSize: 32,
    color: colors.background.dark,
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.darkTertiary,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.gold,
    borderRadius: borderRadius.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
  },
});

export default MusicPlayer;
