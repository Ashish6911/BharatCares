import { router } from 'expo-router';
import axios from 'axios';
import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'http://192.168.1.12:5000';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert(
        'Error',
        'Please fill all fields'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/signup`,
        {
          name: name.trim(),
          email: email.trim(),
          password,
        }
      );

      console.log(
        'SIGNUP RESPONSE:',
        response.data
      );

      Alert.alert(
        'Success',
        'Account created successfully. Please login.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/login');
            },
          },
        ]
      );

    } catch (error: any) {
      console.log(
        'SIGNUP ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Signup Failed',
        error.response?.data?.message ||
          'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
        >

          <TouchableOpacity
            onPress={() =>
              router.replace('/login')
            }
          >
            <Text style={styles.back}>
              ← Back
            </Text>
          </TouchableOpacity>

          <View style={styles.form}>

            <Text style={styles.logo}>
              Bharat Cares
            </Text>

            <Text style={styles.title}>
              Create Account
            </Text>

            <Text style={styles.subtitle}>
              Join Bharat Cares and make
              your voice heard.
            </Text>

            {/* NAME */}

            <Text style={styles.label}>
              Name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            {/* EMAIL */}

            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* PASSWORD */}

            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* SIGN UP */}

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={loading}
            >

              {loading ? (
                <ActivityIndicator
                  color="#ffffff"
                />
              ) : (
                <Text
                  style={styles.signupText}
                >
                  Create Account
                </Text>
              )}

            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.replace('/login')
              }
            >
              <Text
                style={styles.loginText}
              >
                Already have an account?
                {' '}Login
              </Text>
            </TouchableOpacity>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  keyboard: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    padding: 24,
  },

  back: {
    fontSize: 16,
    color: '#111111',
    fontWeight: '600',
  },

  form: {
    flex: 1,
    justifyContent: 'center',
  },

  logo: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 7,
    marginTop: 10,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111111',
    backgroundColor: '#f8f8f8',
  },

  signupButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  signupText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  loginText: {
    textAlign: 'center',
    color: '#555555',
    fontSize: 14,
    marginTop: 20,
  },

});