/**
 * About Screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '@theme/index';

const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Acerca de</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.logo}>VersoVivo</Text>
        <Text style={styles.version}>Versión 0.1.0</Text>

        <Text style={styles.sectionTitle}>Sobre la App</Text>
        <Text style={styles.description}>
          VersoVivo es una experiencia inmersiva de videopoemas que combina texto, recitación
          y música generada por IA. La poesía cobra vida en la era digital.
        </Text>

        <Text style={styles.sectionTitle}>Creador</Text>
        <Text style={styles.description}>Javier Benítez Láinez</Text>
        <Text style={styles.link}>poedronomo.com</Text>

        <Text style={styles.sectionTitle}>Contacto</Text>
        <Text style={styles.link}>informa@blablaele.com</Text>

        <Text style={styles.copyright}>
          © 2026 VersoVivo. Todos los derechos reservados.
        </Text>
      </ScrollView>
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
    padding: spacing.lg,
  },
  logo: {
    color: colors.primary.gold,
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fonts.serif,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  version: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    color: colors.primary.gold,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  description: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.md,
  },
  link: {
    color: colors.primary.gold,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.sm,
  },
  copyright: {
    color: colors.text.darkTertiary,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: spacing['3xl'],
    marginBottom: spacing['2xl'],
  },
});

export default AboutScreen;
