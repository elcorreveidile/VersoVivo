/**
 * Explore Screen - Browse and filter poems
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@hooks/index';
import { fetchFilteredPoems, setFilters } from '@store/slices/poemsSlice';
import { PoemCard, Input } from '@components/index';
import { colors, typography, spacing, borderRadius } from '@theme/index';
import type { Poem, PoemTheme } from '@types/index';

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { filteredPoems } = useAppSelector(state => state.poems);
  const { user } = useAppSelector(state => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<PoemTheme | undefined>();

  const themes: PoemTheme[] = [
    'amor',
    'naturaleza',
    'existencia',
    'melancolía',
    'esperanza',
    'tiempo',
    'soledad',
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    dispatch(setFilters({ searchQuery: query, theme: selectedTheme }));
    dispatch(fetchFilteredPoems({ searchQuery: query, theme: selectedTheme }));
  };

  const handleThemeSelect = (theme: PoemTheme) => {
    const newTheme = theme === selectedTheme ? undefined : theme;
    setSelectedTheme(newTheme);
    dispatch(setFilters({ searchQuery, theme: newTheme }));
    dispatch(fetchFilteredPoems({ searchQuery, theme: newTheme }));
  };

  const handlePoemPress = (poem: Poem) => {
    navigation.navigate('PoemDetail' as never, { poem } as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Buscar poemas..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Temas</Text>
        <View style={styles.themesContainer}>
          {themes.map(theme => (
            <TouchableOpacity
              key={theme}
              style={[
                styles.themeChip,
                selectedTheme === theme && styles.themeChipActive,
              ]}
              onPress={() => handleThemeSelect(theme)}>
              <Text
                style={[
                  styles.themeChipText,
                  selectedTheme === theme && styles.themeChipTextActive,
                ]}>
                {theme}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron poemas</Text>
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
  searchContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filtersTitle: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  themeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.darkSecondary,
    borderRadius: borderRadius.full,
  },
  themeChipActive: {
    backgroundColor: colors.primary.gold,
  },
  themeChipText: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
    textTransform: 'capitalize',
  },
  themeChipTextActive: {
    color: colors.background.dark,
    fontWeight: typography.fontWeight.bold,
  },
  listContent: {
    paddingBottom: spacing.lg,
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

export default ExploreScreen;
