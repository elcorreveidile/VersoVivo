/**
 * Home Screen
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@hooks/index';
import { fetchPoems } from '@store/slices/poemsSlice';
import { PoemCard, LoadingScreen } from '@components/index';
import { colors, typography, spacing } from '@theme/index';
import type { Poem } from '@types';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { filteredPoems, isLoading } = useAppSelector(state => state.poems);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchPoems());
  }, [dispatch]);

  const handlePoemPress = (poem: Poem) => {
    navigation.navigate('PoemDetail' as never, { poem } as never);
  };

  const handleRefresh = () => {
    dispatch(fetchPoems());
  };

  if (isLoading && filteredPoems.length === 0) {
    return <LoadingScreen message="Cargando poemas..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VersoVivo</Text>
        <Text style={styles.greeting}>Hola, {user?.displayName || 'Poeta'}</Text>
      </View>

      <FlatList
        data={filteredPoems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PoemCard
            poem={item}
            onPress={() => handlePoemPress(item)}
            isFavorite={user?.favorites.includes(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary.gold}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay poemas disponibles</Text>
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
  greeting: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.base,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.base,
  },
});

export default HomeScreen;
