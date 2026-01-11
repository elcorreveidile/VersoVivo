/**
 * Login Screen
 */

import React, { useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '@hooks/index';
import { signIn, signInWithGoogle, clearError } from '@store/slices/authSlice';
import { Button, Input } from '@components/index';
import { colors, typography, spacing } from '@theme/index';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = (): boolean => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    if (!email.trim()) {
      newErrors.email = 'El correo es requerido';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Correo inválido';
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    dispatch(clearError());
    await dispatch(signIn({ email: email.trim(), password }));
  };

  const handleGoogleLogin = async () => {
    dispatch(clearError());
    await dispatch(signInWithGoogle());
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup' as never);
  };

  const navigateToInvitations = () => {
    navigation.navigate('InvitationReserve' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>VersoVivo</Text>
          <Text style={styles.subtitle}>La poesía cobra vida</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continuar con Google"
            onPress={handleGoogleLogin}
            variant="outline"
          />

          <TouchableOpacity onPress={navigateToSignup} style={styles.signupLink}>
            <Text style={styles.signupText}>
              ¿No tienes cuenta? <Text style={styles.signupTextBold}>Regístrate</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={navigateToInvitations} style={styles.invitationLink}>
            <Text style={styles.invitationText}>
              ¿Necesitas una invitación? <Text style={styles.signupTextBold}>Resérvala aquí</Text>
            </Text>
          </TouchableOpacity>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logo: {
    color: colors.primary.gold,
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fonts.serif,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.base,
    fontStyle: 'italic',
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.background.darkTertiary,
  },
  dividerText: {
    color: colors.text.darkTertiary,
    marginHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  signupLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  invitationLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  signupText: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
  },
  invitationText: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
  },
  signupTextBold: {
    color: colors.primary.gold,
    fontWeight: typography.fontWeight.bold,
  },
  errorText: {
    color: colors.semantic.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default LoginScreen;
