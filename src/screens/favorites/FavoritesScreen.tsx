/**
 * Favorites Screen
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@hooks/index';
import { fetchFavorites } from '@store/slices/poemsSlice';
import { PoemCard, LoadingScreen } from '@components/index';
import { colors, typography, spacing } from '@theme/index';
import type { Poem } from '@types/index';

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { favorites, isLoading } = useAppSelector(state => state.poems);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites(user.uid));
    }
  }, [dispatch, user]);

  const handlePoemPress = (poem: Poem) => {
    navigation.navigate('PoemDetail' as never, { poem } as never);
  };

  if (isLoading) {
    return <LoadingScreen message="Cargando favoritos..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        <Text style={styles.subtitle}>{favorites.length} poemas guardados</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PoemCard poem={item} onPress={() => handlePoemPress(item)} isFavorite />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyText}>No tienes poemas favoritos</Text>
            <Text style={styles.emptySubtext}>
              Explora y marca tus poemas preferidos
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.darkTertiary,
  },
  title: {
    color: colors.primary.gold,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fonts.serif,
  },
  subtitle: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
  },
});

export default FavoritesScreen;
