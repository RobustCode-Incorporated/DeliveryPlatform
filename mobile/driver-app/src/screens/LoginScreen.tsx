import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface LoginScreenProps {
  email: string;
  password: string;
  errorMessage: string | null;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export function LoginScreen({
  email,
  password,
  errorMessage,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Driver mobile</Text>
      <Text style={styles.title}>Connexion chauffeur</Text>
      <Text style={styles.subtitle}>Authentifiez-vous avec votre compte backend.</Text>

      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor="#64748b"
        style={styles.input}
        value={email}
        onChangeText={onEmailChange}
      />
      <TextInput
        placeholder="Mot de passe"
        placeholderTextColor="#64748b"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={onPasswordChange}
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Pressable
        accessibilityRole="button"
        style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
        disabled={isSubmitting}
        onPress={onSubmit}
      >
        <Text style={styles.primaryButtonText}>{isSubmitting ? 'Connexion...' : 'Se connecter'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#0f766e',
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});