/**
 * Profile Screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@hooks/index';
import { signOut } from '@store/slices/authSlice';
import { Button } from '@components/index';
import { colors, typography, spacing, borderRadius } from '@theme/index';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const handleSignOut = async () => {
    await dispatch(signOut());
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const navigateToAbout = () => {
    navigation.navigate('About' as never);
  };

  const navigateToInvitations = () => {
    navigation.navigate('InvitationAdmin' as never);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.favorites.length || 0}</Text>
          <Text style={styles.statLabel}>Favoritos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.readPoems.length || 0}</Text>
          <Text style={styles.statLabel}>Leídos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.watchedPoems.length || 0}</Text>
          <Text style={styles.statLabel}>Vistos</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={navigateToSettings}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Configuración</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={navigateToAbout}>
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={styles.menuText}>Acerca de</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={navigateToInvitations}>
          <Text style={styles.menuIcon}>🎟️</Text>
          <Text style={styles.menuText}>Reservas de invitaciones</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signOutContainer}>
        <Button title="Cerrar Sesión" onPress={handleSignOut} variant="outline" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: colors.background.darkTertiary,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.background.dark,
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
  },
  name: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  email: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.darkTertiary,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.primary.gold,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.background.darkTertiary,
  },
  menuContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.darkSecondary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  menuIcon: {
    fontSize: typography.fontSize['2xl'],
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize.base,
  },
  menuArrow: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.xl,
  },
  signOutContainer: {
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
});

export default ProfileScreen;
