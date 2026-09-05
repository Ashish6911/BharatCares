import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/api';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';



type User = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type Complaint = {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  createdAt: string;
};

type Suggestion = {
  _id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
};

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [showComplaints, setShowComplaints] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // =========================
  // LOAD USER
  // =========================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser =
          await SecureStore.getItemAsync('user');

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('PROFILE ERROR:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // =========================
  // MY COMPLAINTS
  // =========================

  const fetchMyComplaints = async () => {
    try {
      setLoadingComplaints(true);

      const token =
        await SecureStore.getItemAsync('token');

      if (!token) {
        Alert.alert(
          'Error',
          'Please login again.'
        );
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/complaints/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        'MY COMPLAINTS:',
        response.data
      );

      setComplaints(response.data);

    } catch (error: any) {
      console.log(
        'MY COMPLAINTS ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Could not load your complaints'
      );
    } finally {
      setLoadingComplaints(false);
    }
  };

  // =========================
  // MY SUGGESTIONS
  // =========================

  const fetchMySuggestions = async () => {
    try {
      setLoadingSuggestions(true);

      const token =
        await SecureStore.getItemAsync('token');

      if (!token) {
        Alert.alert(
          'Error',
          'Please login again.'
        );
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/suggestions/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        'MY SUGGESTIONS:',
        response.data
      );

      setSuggestions(response.data);

    } catch (error: any) {
      console.log(
        'MY SUGGESTIONS ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Could not load your suggestions'
      );
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // =========================
  // COMPLAINT BUTTON
  // =========================

  const handleMyComplaints = async () => {
    if (showComplaints) {
      setShowComplaints(false);
      return;
    }

    setShowComplaints(true);
    await fetchMyComplaints();
  };

  // =========================
  // SUGGESTION BUTTON
  // =========================

  const handleMySuggestions = async () => {
    if (showSuggestions) {
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    await fetchMySuggestions();
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');

      console.log('LOGOUT COMPLETE');

      router.replace('/login');
    } catch (error) {
      console.log(
        'LOGOUT ERROR:',
        error
      );

      Alert.alert(
        'Logout Error',
        String(error)
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            router.replace(
              '/(tabs)' as any
            )
          }
        >
          <Text style={styles.back}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Profile
        </Text>

        <View
          style={styles.headerPlaceholder}
        />

      </View>

      {/* CONTENT */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        <View style={styles.content}>

          {/* AVATAR */}

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || 'U'}
            </Text>
          </View>

          {/* NAME */}

          <Text style={styles.name}>
            {user?.name || 'User'}
          </Text>

          {/* EMAIL */}

          <Text style={styles.email}>
            {user?.email ||
              'No email available'}
          </Text>

          {/* ROLE */}

          {user?.role && (
            <View
              style={styles.roleBadge}
            >
              <Text
                style={styles.roleText}
              >
                {user.role}
              </Text>
            </View>
          )}
          {/* CREATE COMPLAINT */}

<TouchableOpacity
  style={styles.option}
  onPress={() =>
    router.push('/create-complaint' as any)
  }
>
  <Text style={styles.optionIcon}>
    ➕
  </Text>

  <View style={styles.optionContent}>
    <Text style={styles.optionTitle}>
      Create Complaint
    </Text>

    <Text style={styles.optionSubtitle}>
      Report a problem in your area
    </Text>
  </View>
</TouchableOpacity>
{/* CREATE SUGGESTION */}

<TouchableOpacity
  style={styles.option}
  onPress={() =>
    router.push('/create-suggestion' as any)
  }
>
  <Text style={styles.optionIcon}>
    💡
  </Text>

  <View style={styles.optionContent}>
    <Text style={styles.optionTitle}>
      Create Suggestion
    </Text>

    <Text style={styles.optionSubtitle}>
      Share an idea to improve your city
    </Text>
  </View>
</TouchableOpacity>

          {/* MY COMPLAINTS */}

          <TouchableOpacity
            style={styles.option}
            onPress={handleMyComplaints}
          >

            <Text style={styles.optionIcon}>
              📝
            </Text>

            <View
              style={styles.optionContent}
            >
              <Text
                style={styles.optionTitle}
              >
                My Complaints
              </Text>

              <Text
                style={styles.optionSubtitle}
              >
                View complaints submitted
                by you
              </Text>
            </View>

            <Text style={styles.arrow}>
              {showComplaints
                ? '▲'
                : '▼'}
            </Text>

          </TouchableOpacity>

          {/* COMPLAINTS */}

          {showComplaints && (
            <View
              style={styles.listContainer}
            >

              {loadingComplaints ? (

                <ActivityIndicator
                  size="small"
                  style={styles.loader}
                />

              ) : complaints.length === 0 ? (

                <Text style={styles.noData}>
                  You haven't submitted any
                  complaints yet.
                </Text>

              ) : (

                complaints.map(
                  (complaint) => (

                    <View
                      key={complaint._id}
                      style={styles.card}
                    >

                      <Text
                        style={styles.cardTitle}
                      >
                        {complaint.title}
                      </Text>

                      <Text
                        style={
                          styles.cardDescription
                        }
                      >
                        {complaint.description}
                      </Text>

                      <Text
                        style={
                          styles.cardCategory
                        }
                      >
                        Category:{' '}
                        {complaint.category}
                      </Text>

                      <Text
                        style={
                          styles.cardLocation
                        }
                      >
                        📍{' '}
                        {complaint.location}
                      </Text>

                      <View
                        style={[
                          styles.statusBadge,
                          complaint.status ===
                            'Resolved'
                            ? styles.resolved
                            : complaint.status ===
                              'In Progress'
                            ? styles.progress
                            : styles.pending,
                        ]}
                      >

                        <Text
                          style={
                            styles.statusText
                          }
                        >
                          {complaint.status}
                        </Text>

                      </View>

                    </View>

                  )
                )

              )}

            </View>
          )}

          {/* MY SUGGESTIONS */}

          <TouchableOpacity
            style={styles.option}
            onPress={handleMySuggestions}
          >

            <Text style={styles.optionIcon}>
              💡
            </Text>

            <View
              style={styles.optionContent}
            >
              <Text
                style={styles.optionTitle}
              >
                My Suggestions
              </Text>

              <Text
                style={styles.optionSubtitle}
              >
                View suggestions submitted
                by you
              </Text>
            </View>

            <Text style={styles.arrow}>
              {showSuggestions
                ? '▲'
                : '▼'}
            </Text>

          </TouchableOpacity>

          {/* SUGGESTIONS */}

          {showSuggestions && (
            <View
              style={styles.listContainer}
            >

              {loadingSuggestions ? (

                <ActivityIndicator
                  size="small"
                  style={styles.loader}
                />

              ) : suggestions.length === 0 ? (

                <Text style={styles.noData}>
                  You haven't submitted any
                  suggestions yet.
                </Text>

              ) : (

                suggestions.map(
                  (suggestion) => (

                    <View
                      key={suggestion._id}
                      style={styles.card}
                    >

                      <Text
                        style={styles.cardTitle}
                      >
                        {suggestion.title}
                      </Text>

                      <Text
                        style={
                          styles.cardDescription
                        }
                      >
                        {suggestion.description}
                      </Text>

                      <Text
                        style={
                          styles.cardCategory
                        }
                      >
                        Category:{' '}
                        {suggestion.category}
                      </Text>

                    </View>

                  )
                )

              )}

            </View>
          )}

          {/* LOGOUT */}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text
              style={styles.logoutText}
            >
              Logout
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    paddingBottom: 40,
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

  headerPlaceholder: {
    width: 28,
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  avatarText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
  },

  email: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
  },

  roleBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e8e8e8',
  },

  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444444',
    textTransform: 'capitalize',
  },

  option: {
    width: '100%',
    minHeight: 70,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginTop: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionIcon: {
    fontSize: 24,
    marginRight: 14,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },

  optionSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
  },

  arrow: {
    fontSize: 14,
    color: '#555555',
  },

  listContainer: {
    width: '100%',
  },

  loader: {
    marginTop: 15,
  },

  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 15,
    marginTop: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
  },

  cardDescription: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    marginTop: 5,
  },

  cardCategory: {
    fontSize: 12,
    color: '#777777',
    marginTop: 8,
  },

  cardLocation: {
    fontSize: 13,
    color: '#555555',
    marginTop: 7,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 10,
  },

  resolved: {
    backgroundColor: '#dff6e7',
  },

  progress: {
    backgroundColor: '#dcecff',
  },

  pending: {
    backgroundColor: '#fff0c2',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#222222',
  },

  noData: {
    width: '100%',
    textAlign: 'center',
    color: '#777777',
    fontSize: 13,
    paddingVertical: 20,
  },

  logoutButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

});