/**
 * Invitation Reservation Screen
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from '@components/index';
import { colors, typography, spacing, borderRadius } from '@theme/index';
import { firestoreService } from '@services/firebase';
import type { InvitationAvailability, InvitationContactType } from '@types';

const DEFAULT_AVAILABILITY: InvitationAvailability = {
  remaining: 10,
  total: 10,
};

const InvitationReserveScreen: React.FC = () => {
  const navigation = useNavigation();
  const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactType, setContactType] = useState<InvitationContactType>('email');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isSoldOut = availability.remaining <= 0;

  const placeholder = useMemo(() => {
    return contactType === 'email' ? 'tu@correo.com' : '+34 600 123 456';
  }, [contactType]);

  const label = contactType === 'email' ? 'Correo electrónico' : 'WhatsApp';

  const loadAvailability = async () => {
    try {
      const availabilityData = await firestoreService.getInvitationAvailability();
      setAvailability(availabilityData);
    } catch (loadError) {
      setError('No pudimos cargar la disponibilidad. Inténtalo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const validate = () => {
    if (!contact.trim()) {
      setError('Necesitamos un correo o WhatsApp para enviarte tu código.');
      return false;
    }

    if (contactType === 'email') {
      const isValidEmail = /\S+@\S+\.\S+/.test(contact.trim());
      if (!isValidEmail) {
        setError('Introduce un correo válido.');
        return false;
      }
    } else {
      const isValidPhone = /^\+?[0-9\s-]{6,}$/.test(contact.trim());
      if (!isValidPhone) {
        setError('Introduce un número válido de WhatsApp.');
        return false;
      }
    }

    return true;
  };

  const handleReserve = async () => {
    if (isSoldOut || isSubmitting) return;

    setError('');
    setSuccessMessage('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await firestoreService.reserveInvitation(contact.trim(), contactType);
      setAvailability({ remaining: result.remaining, total: result.total });
      setContact('');
      setSuccessMessage('¡Reserva confirmada! Te enviaremos tu código pronto.');
    } catch (submitError) {
      setError('Las invitaciones ya se agotaron. ¡Gracias por tu interés!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reserva tu invitación</Text>
          <Text style={styles.subtitle}>
            Tenemos {availability.total} invitaciones disponibles para el
            lanzamiento de VersoVivo.
          </Text>
        </View>

        <View style={styles.availabilityCard}>
          <Text style={styles.availabilityTitle}>Disponibilidad</Text>
          <Text style={styles.availabilityValue}>
            {isLoading ? 'Cargando...' : `${availability.remaining} disponibles`}
          </Text>
          <Text style={styles.availabilityCaption}>
            Cada reserva incluye un código personal.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>¿Dónde prefieres recibir tu código?</Text>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                contactType === 'email' && styles.toggleButtonActive,
              ]}
              onPress={() => setContactType('email')}
              disabled={isSoldOut}>
              <Text
                style={[
                  styles.toggleText,
                  contactType === 'email' && styles.toggleTextActive,
                ]}>
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                contactType === 'whatsapp' && styles.toggleButtonActive,
              ]}
              onPress={() => setContactType('whatsapp')}
              disabled={isSoldOut}>
              <Text
                style={[
                  styles.toggleText,
                  contactType === 'whatsapp' && styles.toggleTextActive,
                ]}>
                WhatsApp
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label={label}
            value={contact}
            onChangeText={setContact}
            placeholder={placeholder}
            keyboardType={contactType === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            editable={!isSoldOut}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

          <Button
            title={isSoldOut ? 'Invitaciones agotadas' : 'Reservar invitación'}
            onPress={handleReserve}
            loading={isSubmitting}
            disabled={isSoldOut}
            style={styles.reserveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  backButtonText: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.primary.gold,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.base,
    lineHeight: 22,
  },
  availabilityCard: {
    backgroundColor: colors.background.darkSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.background.darkTertiary,
  },
  availabilityTitle: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  availabilityValue: {
    color: colors.primary.gold,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  availabilityCaption: {
    color: colors.text.darkTertiary,
    fontSize: typography.fontSize.sm,
  },
  form: {
    backgroundColor: colors.background.darkSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  formTitle: {
    color: colors.text.darkPrimary,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.background.darkTertiary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary.gold,
  },
  toggleText: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  toggleTextActive: {
    color: colors.background.dark,
    fontWeight: typography.fontWeight.bold,
  },
  reserveButton: {
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.semantic.error,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  successText: {
    color: colors.semantic.success,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
});

export default InvitationReserveScreen;
