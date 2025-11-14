import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

type Status = 'loading' | 'success' | 'error';

export default function ConfirmacaoEmail() {
  const { token } = useSearchParams<{ token?: string }>(); // token é opcional
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const confirmarEmail = async () => {
      try {
        const response = await fetch('https://solaire-z8mw.onrender.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    confirmarEmail();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Text style={styles.text}>Confirmando seu email...</Text>
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
          </>
        );
      case 'success':
        return (
          <>
            <Text style={styles.textSuccess}>Email confirmado com sucesso!</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.replace('/auth')}>
              <Text style={styles.buttonText}>Ir para Login</Text>
            </TouchableOpacity>
          </>
        );
      case 'error':
        return (
          <>
            <Text style={styles.textError}>Token inválido ou expirado</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.replace('/auth')}>
              <Text style={styles.buttonText}>Voltar ao Login</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  text: { fontSize: 18, color: '#333', textAlign: 'center' },
  textSuccess: { fontSize: 18, color: 'green', textAlign: 'center' },
  textError: { fontSize: 18, color: 'red', textAlign: 'center' },
  button: {
    marginTop: 20,
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
