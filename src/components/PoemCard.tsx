/**
 * Poem Card Component
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@theme/index';
import type { Poem } from '@types/index';

interface PoemCardProps {
  poem: Poem;
  onPress: () => void;
  isFavorite?: boolean;
}

const PoemCard: React.FC<PoemCardProps> = ({ poem, onPress, isFavorite = false }) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.thumbnailContainer}>
        {poem.thumbnailUrl ? (
          <Image
            source={{ uri: poem.thumbnailUrl } as ImageSourcePropType}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Text style={styles.placeholderText}>📖</Text>
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(poem.duration)}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {poem.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {poem.author}
        </Text>
        <View style={styles.footer}>
          <View style={styles.themeBadge}>
            <Text style={styles.themeText}>{poem.theme}</Text>
          </View>
          {isFavorite && <Text style={styles.favoriteIcon}>⭐</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.darkSecondary,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  thumbnailContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.darkTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay.darkest,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  durationText: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  contentContainer: {
    padding: spacing.md,
  },
  title: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
    fontFamily: typography.fonts.serif,
  },
  author: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeBadge: {
    backgroundColor: colors.primary.darkGold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  themeText: {
    color: colors.background.dark,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  favoriteIcon: {
    fontSize: typography.fontSize.lg,
  },
});

export default PoemCard;
