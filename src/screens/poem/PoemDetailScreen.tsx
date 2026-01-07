/**
 * Poem Detail Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@hooks/index';
import { addToFavorites, removeFromFavorites } from '@store/slices/poemsSlice';
import { VideoPlayer, MusicPlayer } from '@components/index';
import { colors, typography, spacing, borderRadius } from '@theme/index';
import { PlaybackMode } from '@types/index';

const PoemDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const poem = (route.params as any)?.poem;
  const [activeMode, setActiveMode] = useState<PlaybackMode>(PlaybackMode.TEXT);
  const isFavorite = user?.favorites.includes(poem.id) || false;

  const handleToggleFavorite = () => {
    if (!user) return;

    if (isFavorite) {
      dispatch(removeFromFavorites({ userId: user.uid, poemId: poem.id }));
    } else {
      dispatch(addToFavorites({ userId: user.uid, poemId: poem.id }));
    }
  };

  const renderContent = () => {
    switch (activeMode) {
      case PlaybackMode.VIDEO:
        return <VideoPlayer poem={poem} />;
      case PlaybackMode.MUSIC:
        return <MusicPlayer poem={poem} />;
      default:
        return (
          <ScrollView style={styles.textContainer}>
            <Text style={styles.poemText}>{poem.textContent}</Text>
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {poem.title}
          </Text>
          <Text style={styles.author}>{poem.author}</Text>
        </View>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
          <Text style={styles.favoriteIcon}>{isFavorite ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            activeMode === PlaybackMode.TEXT && styles.modeButtonActive,
          ]}
          onPress={() => setActiveMode(PlaybackMode.TEXT)}>
          <Text
            style={[
              styles.modeButtonText,
              activeMode === PlaybackMode.TEXT && styles.modeButtonTextActive,
            ]}>
            Texto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            activeMode === PlaybackMode.VIDEO && styles.modeButtonActive,
          ]}
          onPress={() => setActiveMode(PlaybackMode.VIDEO)}>
          <Text
            style={[
              styles.modeButtonText,
              activeMode === PlaybackMode.VIDEO && styles.modeButtonTextActive,
            ]}>
            Video
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            activeMode === PlaybackMode.MUSIC && styles.modeButtonActive,
          ]}
          onPress={() => setActiveMode(PlaybackMode.MUSIC)}>
          <Text
            style={[
              styles.modeButtonText,
              activeMode === PlaybackMode.MUSIC && styles.modeButtonTextActive,
            ]}>
            Música
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.darkTertiary,
  },
  backButton: {
    padding: spacing.sm,
  },
  backIcon: {
    color: colors.primary.gold,
    fontSize: typography.fontSize['2xl'],
  },
  headerContent: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  title: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fonts.serif,
  },
  author: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  favoriteButton: {
    padding: spacing.sm,
  },
  favoriteIcon: {
    fontSize: typography.fontSize['2xl'],
  },
  modeSelector: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.darkSecondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.primary.gold,
  },
  modeButtonText: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  modeButtonTextActive: {
    color: colors.background.dark,
    fontWeight: typography.fontWeight.bold,
  },
  textContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  poemText: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
    fontFamily: typography.fonts.serif,
  },
});

export default PoemDetailScreen;
