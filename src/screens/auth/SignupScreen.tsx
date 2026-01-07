/**
 * Signup Screen
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
import { signUp, clearError } from '@store/slices/authSlice';
import { Button, Input } from '@components/index';
import { colors, typography, spacing } from '@theme/index';

const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validate = (): boolean => {
    let valid = true;
    const newErrors = { displayName: '', email: '', password: '', confirmPassword: '' };

    if (!displayName.trim()) {
      newErrors.displayName = 'El nombre es requerido';
      valid = false;
    }

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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    dispatch(clearError());
    await dispatch(
      signUp({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      })
    );
  };

  const navigateToLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>VersoVivo</Text>
          <Text style={styles.subtitle}>Crea tu cuenta</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nombre completo"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Juan Pérez"
            error={errors.displayName}
          />

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

          <Input
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
            error={errors.confirmPassword}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Crear Cuenta"
            onPress={handleSignup}
            loading={isLoading}
            style={styles.signupButton}
          />

          <TouchableOpacity onPress={navigateToLogin} style={styles.loginLink}>
            <Text style={styles.loginText}>
              ¿Ya tienes cuenta? <Text style={styles.loginTextBold}>Inicia sesión</Text>
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
    marginBottom: spacing['2xl'],
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
    fontSize: typography.fontSize.lg,
  },
  form: {
    width: '100%',
  },
  signupButton: {
    marginTop: spacing.md,
  },
  loginLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  loginText: {
    color: colors.text.darkSecondary,
    fontSize: typography.fontSize.sm,
  },
  loginTextBold: {
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

export default SignupScreen;
