import * as SecureStore from 'expo-secure-store';
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

export default function CreateSuggestionScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !category.trim()
    ) {
      Alert.alert(
        'Error',
        'Please fill all fields'
      );
      return;
    }

    try {
      setLoading(true);

      const token =
        await SecureStore.getItemAsync('token');

      if (!token) {
        Alert.alert(
          'Error',
          'Please login again.'
        );
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/suggestions`,
        {
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        'CREATE SUGGESTION:',
        response.data
      );

      Alert.alert(
        'Success',
        'Suggestion submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/profile');
            },
          },
        ]
      );

    } catch (error: any) {
      console.log(
        'CREATE SUGGESTION ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Could not submit suggestion'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            router.replace('/profile')
          }
        >
          <Text style={styles.back}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Create Suggestion
        </Text>

        <View style={styles.placeholder} />

      </View>

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

          {/* TITLE */}

          <Text style={styles.label}>
            Title
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter suggestion title"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />

          {/* DESCRIPTION */}

          <Text style={styles.label}>
            Description
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
            ]}
            placeholder="Describe your suggestion"
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          {/* CATEGORY */}

          <Text style={styles.label}>
            Category
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Cleanliness, Transport, Safety"
            placeholderTextColor="#888"
            value={category}
            onChangeText={setCategory}
          />

          {/* SUBMIT */}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >

            {loading ? (
              <ActivityIndicator
                color="#ffffff"
              />
            ) : (
              <Text style={styles.submitText}>
                Submit Suggestion
              </Text>
            )}

          </TouchableOpacity>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },

  keyboard: {
    flex: 1,
  },

  header: {
    height: 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  back: {
    fontSize: 28,
    color: '#111111',
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111111',
  },

  placeholder: {
    width: 28,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 7,
    marginTop: 10,
  },

  input: {
    minHeight: 52,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#111111',
  },

  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },

  submitButton: {
    height: 54,
    backgroundColor: '#111111',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },

  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

});