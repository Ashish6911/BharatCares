import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://192.168.1.12:5000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        'Error',
        'Please enter email and password'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email: email.trim(),
          password,
        }
      );

      console.log(
        'LOGIN RESPONSE:',
        response.data
      );

      // Save token
      await SecureStore.setItemAsync(
        'token',
        response.data.token
      );

      // Save user
      await SecureStore.setItemAsync(
        'user',
        JSON.stringify(response.data.user)
      );

      // =========================
      // ROLE BASED NAVIGATION
      // =========================

      if (
        response.data.user.role === 'admin'
      ) {
        console.log(
          'ADMIN LOGIN → ADMIN DASHBOARD'
        );

        router.replace('/admin' as any);
      } else {
        console.log(
          'USER LOGIN → FEED'
        );

        router.replace('/' as any);
      }

    } catch (error: any) {
      console.log(
        'LOGIN ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Login Failed',
        error.response?.data?.message ||
          'Something went wrong'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.content}>

        {/* LOGO */}

        <Text style={styles.logo}>
          Bharat Cares
        </Text>

        <Text style={styles.subtitle}>
          Your voice. Your city.
        </Text>

        {/* EMAIL */}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        {/* PASSWORD */}

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* LOGIN */}

        <TouchableOpacity
          style={[
            styles.loginButton,
            loading &&
              styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginText}>
            {loading
              ? 'Logging in...'
              : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* SIGN UP */}

        <TouchableOpacity
          onPress={() =>
            router.push('/signup' as any)
          }
          disabled={loading}
        >
          <Text style={styles.signupText}>
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: 28,
  },

  logo: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111111',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 40,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: '#f8f8f8',
    color: '#111111',
  },

  loginButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  signupText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555555',
  },

});