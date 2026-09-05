import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';

import { router } from 'expo-router';
import axios from 'axios';
import { useState } from 'react';
import { API_URL } from '@/config/api';

import {
  ActivityIndicator,
  Alert,
  Image,
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



export default function CreateComplaintScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  const [image, setImage] =
    useState<ImagePicker.ImagePickerAsset | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  // =========================
  // TAKE PHOTO
  // =========================

  const takePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Camera Permission',
          'Camera permission is required to take a photo.'
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }

    } catch (error) {
      console.log(
        'CAMERA ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Could not open camera.'
      );
    }
  };

  // =========================
  // REMOVE PHOTO
  // =========================

  const removePhoto = () => {
    setImage(null);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !category.trim() ||
      !location.trim()
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
        await SecureStore.getItemAsync(
          'token'
        );

      if (!token) {
        Alert.alert(
          'Error',
          'Please login again.'
        );
        return;
      }

      // =========================
      // FORM DATA
      // =========================

      const formData = new FormData();

      formData.append(
        'title',
        title.trim()
      );

      formData.append(
        'description',
        description.trim()
      );

      formData.append(
        'category',
        category.trim()
      );

      formData.append(
        'location',
        location.trim()
      );

      // =========================
      // ADD IMAGE
      // =========================

      if (image) {
        if (Platform.OS === 'web') {
          const response = await fetch(
            image.uri
          );

          const blob =
            await response.blob();

          formData.append(
            'image',
            blob,
            image.fileName ||
              'complaint-photo.jpg'
          );
        } else {
          formData.append(
            'image',
            {
              uri: image.uri,
              name:
                image.fileName ||
                'complaint-photo.jpg',
              type:
                image.mimeType ||
                'image/jpeg',
            } as any
          );
        }
      }

      const response = await axios.post(
        `${API_URL}/api/complaints`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

      console.log(
        'CREATE COMPLAINT:',
        response.data
      );

      Alert.alert(
        'Success',
        'Complaint submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace(
                '/profile' as any
              );
            },
          },
        ]
      );

    } catch (error: any) {
      console.log(
        'CREATE COMPLAINT ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Could not submit complaint'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            router.replace(
              '/profile' as any
            )
          }
        >
          <Text style={styles.back}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Create Complaint
        </Text>

        <View
          style={styles.placeholder}
        />

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
          showsVerticalScrollIndicator={false}
        >

          {/* TITLE */}

          <Text style={styles.label}>
            Title
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter complaint title"
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
            placeholder="Describe the problem"
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
            placeholder="e.g. Pothole, Garbage, Street Light"
            placeholderTextColor="#888"
            value={category}
            onChangeText={setCategory}
          />

          {/* LOCATION */}

          <Text style={styles.label}>
            Location
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Where is the problem?"
            placeholderTextColor="#888"
            value={location}
            onChangeText={setLocation}
          />

          {/* PHOTO */}

          <Text style={styles.label}>
            Photo
          </Text>

          {!image ? (

            <TouchableOpacity
              style={styles.photoButton}
              onPress={takePhoto}
            >
              <Text style={styles.cameraIcon}>
                📷
              </Text>

              <Text style={styles.photoButtonText}>
                Take Photo
              </Text>
            </TouchableOpacity>

          ) : (

            <View
              style={styles.previewContainer}
            >

              <Image
                source={{
                  uri: image.uri,
                }}
                style={styles.preview}
              />

              <View
                style={styles.photoActions}
              >

                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={takePhoto}
                >
                  <Text
                    style={
                      styles.retakeText
                    }
                  >
                    📷 Retake
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={removePhoto}
                >
                  <Text
                    style={
                      styles.removeText
                    }
                  >
                    Remove
                  </Text>
                </TouchableOpacity>

              </View>

            </View>

          )}

          {/* SUBMIT */}

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading &&
                styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >

            {loading ? (
              <ActivityIndicator
                color="#ffffff"
              />
            ) : (
              <Text
                style={styles.submitText}
              >
                Submit Complaint
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
    paddingBottom: 50,
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

  photoButton: {
    height: 110,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 14,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraIcon: {
    fontSize: 30,
    marginBottom: 6,
  },

  photoButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  previewContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dddddd',
  },

  preview: {
    width: '100%',
    height: 220,
  },

  photoActions: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },

  retakeButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#eeeeee',
    justifyContent: 'center',
    alignItems: 'center',
  },

  retakeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },

  removeButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  submitButton: {
    height: 54,
    backgroundColor: '#111111',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.6,
  },

  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

});