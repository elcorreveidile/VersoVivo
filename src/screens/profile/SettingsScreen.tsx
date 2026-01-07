/**
 * Settings Screen - Placeholder
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '@theme/index';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>Configuración próximamente...</Text>
      </View>
    </View>
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
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.darkTertiary,
  },
  backIcon: {
    color: colors.primary.gold,
    fontSize: typography.fontSize['2xl'],
    marginRight: spacing.md,
  },
  title: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.base,
  },
});

export default SettingsScreen;
