/**
 * Invitation Admin Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Button } from '@components/index';
import { colors, typography, spacing, borderRadius } from '@theme/index';
import { firestoreService } from '@services/firebase';
import type { InvitationAvailability, InvitationReservation } from '@types';

const DEFAULT_AVAILABILITY: InvitationAvailability = {
  remaining: 10,
  total: 10,
};

const InvitationAdminScreen: React.FC = () => {
  const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY);
  const [reservations, setReservations] = useState<InvitationReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [availabilityData, reservationData] = await Promise.all([
        firestoreService.getInvitationAvailability(),
        firestoreService.getInvitationReservations(),
      ]);
      setAvailability(availabilityData);
      setReservations(reservationData);
    } catch (loadError) {
      setError('No pudimos cargar las reservas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const reservedCount = availability.total - availability.remaining;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservas de invitaciones</Text>
        <Text style={styles.subtitle}>
          {reservedCount} reservadas · {availability.remaining} disponibles
        </Text>
        <Button
          title="Actualizar"
          variant="outline"
          onPress={loadData}
          style={styles.refreshButton}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <FlatList
        data={reservations}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadData}
            tintColor={colors.primary.gold}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Aún no hay reservas registradas.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.contact}>{item.contact}</Text>
            <Text style={styles.meta}>
              {item.contactType === 'email' ? 'Correo' : 'WhatsApp'}
            </Text>
            <Text style={styles.date}>
              {item.createdAt
                ? item.createdAt.toLocaleString('es-ES')
                : 'Sin fecha'}
            </Text>
          </View>
        )}
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
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  errorText: {
    marginTop: spacing.sm,
    color: colors.semantic.error,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.background.darkSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.background.darkTertiary,
  },
  contact: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  meta: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
  },
  date: {
    color: colors.text.darkTertiary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  emptyState: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.darkSecondary,
  },
});

export default InvitationAdminScreen;
