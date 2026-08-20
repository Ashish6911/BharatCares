import * as SecureStore from 'expo-secure-store';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { router, useFocusEffect } from 'expo-router';

import {
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'http://192.168.1.12:5000';

type Complaint = {
  _id: string;
  title: string;
  description: string;
  category: string;
  image: string | null;
  location: string;
  status: string;
  createdBy: {
    _id: string;
    name: string;
    email?: string;
  };
  votes: string[];
  createdAt: string;
};

type Suggestion = {
  _id: string;
  title: string;
  description: string;
  category: string;
  createdBy: {
    _id: string;
    name: string;
  };
  votes: string[];
  createdAt: string;
};

export default function HomeScreen() {
  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const [suggestions, setSuggestions] =
    useState<Suggestion[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  // =========================
  // FETCH COMPLAINTS
  // =========================

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/complaints`
      );

      console.log(
        'COMPLAINTS:',
        response.data
      );

      setComplaints(response.data);
    } catch (error: any) {
      console.log(
        'COMPLAINT FETCH ERROR:',
        error.response?.data ||
          error.message
      );
    }
  };

  // =========================
  // FETCH SUGGESTIONS
  // =========================

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/suggestions`
      );

      console.log(
        'SUGGESTIONS:',
        response.data
      );

      setSuggestions(response.data);
    } catch (error: any) {
      console.log(
        'SUGGESTION FETCH ERROR:',
        error.response?.data ||
          error.message
      );
    }
  };

  // =========================
  // VOTE SUGGESTION
  // =========================

  const voteSuggestion = async (
    suggestionId: string
  ) => {
    try {
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

      const response = await axios.post(
        `${API_URL}/api/suggestions/${suggestionId}/vote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        'VOTE RESPONSE:',
        response.data
      );

      Alert.alert(
        'Success',
        response.data.message ||
          'Vote added successfully'
      );

      await fetchSuggestions();
    } catch (error: any) {
      console.log(
        'VOTE ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Vote',
        error.response?.data?.message ||
          'Something went wrong'
      );
    }
  };

  // =========================
  // VOTE COMPLAINT
  // =========================

  const voteComplaint = async (
    complaintId: string
  ) => {
    try {
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

      const response = await axios.post(
        `${API_URL}/api/complaints/${complaintId}/vote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        'COMPLAINT VOTE RESPONSE:',
        response.data
      );

      Alert.alert(
        'Success',
        response.data.message ||
          'Vote added successfully'
      );

      await fetchComplaints();
    } catch (error: any) {
      console.log(
        'COMPLAINT VOTE ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Vote',
        error.response?.data?.message ||
          'Something went wrong'
      );
    }
  };

  // =========================
  // DELETE COMPLAINT
  // =========================

  const deleteComplaint = async (
    complaintId: string
  ) => {
    try {
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

      const response = await axios.delete(
        `${API_URL}/api/complaints/${complaintId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        'DELETE COMPLAINT:',
        response.data
      );

      Alert.alert(
        'Deleted',
        'Complaint deleted successfully'
      );

      await fetchComplaints();
    } catch (error: any) {
      console.log(
        'DELETE COMPLAINT ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Could not delete complaint'
      );
    }
  };

  // =========================
  // DELETE SUGGESTION
  // =========================

  const deleteSuggestion = async (
    suggestionId: string
  ) => {
    try {
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

      const response = await axios.delete(
        `${API_URL}/api/suggestions/${suggestionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        'DELETE SUGGESTION:',
        response.data
      );

      Alert.alert(
        'Deleted',
        'Suggestion deleted successfully'
      );

      await fetchSuggestions();
    } catch (error: any) {
      console.log(
        'DELETE SUGGESTION ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Could not delete suggestion'
      );
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync(
        'token'
      );

      await SecureStore.deleteItemAsync(
        'user'
      );

      console.log(
        'LOGOUT COMPLETE'
      );

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
  // LOAD CURRENT USER
  // =========================

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user =
          await SecureStore.getItemAsync(
            'user'
          );

        if (user) {
          const parsedUser =
            JSON.parse(user);

          setCurrentUserId(
            parsedUser.id ||
              parsedUser._id ||
              null
          );
        }
      } catch (error) {
        console.log(
          'CURRENT USER ERROR:',
          error
        );
      }
    };

    loadCurrentUser();
  }, []);

  // =========================
  // REFRESH FEED
  // =========================

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadFeed = async () => {
        try {
          await Promise.all([
            fetchComplaints(),
            fetchSuggestions(),
          ]);
        } catch (error) {
          console.log(
            'FEED REFRESH ERROR:',
            error
          );
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadFeed();

      return () => {
        active = false;
      };
    }, [])
  );

  // =========================
  // COMBINE FEED
  // =========================

  const feedItems = [
    ...complaints.map((item) => ({
      ...item,
      type: 'complaint' as const,
    })),

    ...suggestions.map((item) => ({
      ...item,
      type: 'suggestion' as const,
    })),
  ];

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.center}>
          <Text style={styles.loadingText}>
            Loading Bharat Cares...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <Text style={styles.logo}>
          Bharat Cares
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.push(
              '/profile' as any
            )
          }
        >
          <Text style={styles.profileIcon}>
            👤
          </Text>
        </TouchableOpacity>

      </View>

      {/* FEED */}

      <FlatList
        data={feedItems}
        keyExtractor={(item) =>
          `${item.type}-${item._id}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.feed
        }

        ListEmptyComponent={
          <View style={styles.center}>

            <Text style={styles.emptyTitle}>
              Nothing here yet
            </Text>

            <Text style={styles.emptyText}>
              Be the first person to share
              something.
            </Text>

          </View>
        }

        renderItem={({ item }) => {

          // =========================
          // SUGGESTION
          // =========================

          if (
            item.type ===
            'suggestion'
          ) {
            const isOwner =
              item.createdBy?._id ===
              currentUserId;

            return (
              <View style={styles.post}>

                <View
                  style={styles.userRow}
                >

                  <View style={styles.avatar}>
                    <Text
                      style={
                        styles.avatarText
                      }
                    >
                      💡
                    </Text>
                  </View>

                  <View>

                    <Text
                      style={styles.name}
                    >
                      {item.createdBy?.name ||
                        'User'}
                    </Text>

                    <Text
                      style={
                        styles.category
                      }
                    >
                      Suggestion •{' '}
                      {item.category}
                    </Text>

                  </View>

                  {/* DELETE OWN SUGGESTION */}

                  {isOwner && (
                    <TouchableOpacity
                      style={
                        styles.deleteButton
                      }
                      onPress={() => {
                        Alert.alert(
                          'Delete Suggestion',
                          'Are you sure you want to delete this suggestion?',
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                            {
                              text: 'Delete',
                              style:
                                'destructive',
                              onPress: () =>
                                deleteSuggestion(
                                  item._id
                                ),
                            },
                          ]
                        );
                      }}
                    >
                      <Text
                        style={
                          styles.deleteText
                        }
                      >
                        🗑️
                      </Text>
                    </TouchableOpacity>
                  )}

                </View>

                <View
                  style={
                    styles.suggestionContent
                  }
                >

                  <Text
                    style={
                      styles.suggestionLabel
                    }
                  >
                    💡 SUGGESTION
                  </Text>

                  <Text
                    style={styles.title}
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={
                      styles.description
                    }
                  >
                    {item.description}
                  </Text>

                  <View
                    style={styles.actions}
                  >

                    <TouchableOpacity
                      style={styles.action}
                      onPress={() =>
                        voteSuggestion(
                          item._id
                        )
                      }
                    >
                      <Text
                        style={
                          styles.actionText
                        }
                      >
                        👍
                      </Text>

                      <Text
                        style={
                          styles.actionCount
                        }
                      >
                        {item.votes?.length ||
                          0}{' '}
                        Vote
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.action}
                      onPress={() =>
                        router.push(
                          `/comments/${item._id}` as any
                        )
                      }
                    >
                      <Text
                        style={
                          styles.actionText
                        }
                      >
                        💬
                      </Text>

                      <Text
                        style={
                          styles.actionCount
                        }
                      >
                        Comment
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.share}
                    >
                      <Text
                        style={
                          styles.actionText
                        }
                      >
                        ↗
                      </Text>
                    </TouchableOpacity>

                  </View>

                </View>

              </View>
            );
          }

          // =========================
          // COMPLAINT
          // =========================

          const isOwner =
            item.createdBy?._id ===
            currentUserId;

          return (
            <View style={styles.post}>

              <View
                style={styles.userRow}
              >

                <View style={styles.avatar}>
                  <Text
                    style={
                      styles.avatarText
                    }
                  >
                    {item.createdBy?.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      'U'}
                  </Text>
                </View>

                <View>

                  <Text
                    style={styles.name}
                  >
                    {item.createdBy?.name ||
                      'User'}
                  </Text>

                  <Text
                    style={
                      styles.category
                    }
                  >
                    Complaint •{' '}
                    {item.category}
                  </Text>

                </View>

                {/* DELETE OWN COMPLAINT */}

                {isOwner && (
                  <TouchableOpacity
                    style={
                      styles.deleteButton
                    }
                    onPress={() => {
                      Alert.alert(
                        'Delete Complaint',
                        'Are you sure you want to delete this complaint?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Delete',
                            style:
                              'destructive',
                            onPress: () =>
                              deleteComplaint(
                                item._id
                              ),
                          },
                        ]
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.deleteText
                      }
                    >
                      🗑️
                    </Text>
                  </TouchableOpacity>
                )}

              </View>

              {/* IMAGE */}

              {item.image && (
                <TouchableOpacity
                  activeOpacity={0.95}
                  onPress={() =>
                    setSelectedImage(
                      `${API_URL}/${item.image!.replace(
                        /\\/g,
                        '/'
                      )}`
                    )
                  }
                >
                  <Image
                    source={{
                      uri: `${API_URL}/${item.image.replace(
                        /\\/g,
                        '/'
                      )}`,
                    }}
                    style={
                      styles.postImage
                    }
                  />
                </TouchableOpacity>
              )}

              <View
                style={styles.content}
              >

                <Text
                  style={
                    styles.complaintLabel
                  }
                >
                  📸 COMPLAINT
                </Text>

                <Text
                  style={styles.title}
                >
                  {item.title}
                </Text>

                <Text
                  style={
                    styles.description
                  }
                >
                  {item.description}
                </Text>

                <Text
                  style={styles.location}
                >
                  📍 {item.location}
                </Text>

                {/* STATUS */}

                <View
                  style={[
                    styles.statusBadge,

                    item.status ===
                    'Resolved'
                      ? styles.resolved
                      : item.status ===
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
                    {item.status}
                  </Text>
                </View>

                {/* ACTIONS */}

                <View
                  style={styles.actions}
                >

                  <TouchableOpacity
                    style={styles.action}
                    onPress={() =>
                      voteComplaint(
                        item._id
                      )
                    }
                  >
                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      👍
                    </Text>

                    <Text
                      style={
                        styles.actionCount
                      }
                    >
                      {item.votes?.length ||
                        0}{' '}
                      Vote
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.action}
                    onPress={() =>
                      router.push(
                        `/comments/${item._id}` as any
                      )
                    }
                  >
                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      💬
                    </Text>

                    <Text
                      style={
                        styles.actionCount
                      }
                    >
                      Comment
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.share}
                  >
                    <Text
                      style={
                        styles.actionText
                      }
                    >
                      ↗
                    </Text>
                  </TouchableOpacity>

                </View>

              </View>

            </View>
          );
        }}
      />

      {/* ========================= */}
      {/* FULL SCREEN IMAGE */}
      {/* ========================= */}

      <Modal
        visible={
          selectedImage !== null
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setSelectedImage(null)
        }
      >

        <View
          style={styles.imageModal}
        >

          <TouchableOpacity
            style={
              styles.closeButton
            }
            onPress={() =>
              setSelectedImage(null)
            }
          >
            <Text
              style={styles.closeText}
            >
              ×
            </Text>
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{
                uri: selectedImage,
              }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}

        </View>

      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },

  header: {
    height: 64,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
  },

  profileIcon: {
    fontSize: 24,
  },

  feed: {
    paddingBottom: 30,
  },

  post: {
    backgroundColor: '#ffffff',
    marginBottom: 14,
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  category: {
    fontSize: 12,
    color: '#777777',
    marginTop: 2,
  },

  deleteButton: {
    marginLeft: 'auto',
    padding: 8,
  },

  deleteText: {
    fontSize: 18,
  },

  postImage: {
    width: '100%',
    height: 320,
    backgroundColor: '#eeeeee',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  suggestionContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  suggestionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#666666',
    marginBottom: 8,
  },

  complaintLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#666666',
    marginBottom: 8,
  },

  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 5,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
  },

  location: {
    fontSize: 13,
    color: '#555555',
    marginTop: 10,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#222222',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    marginTop: 14,
    paddingVertical: 13,
  },

  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },

  actionText: {
    fontSize: 20,
  },

  actionCount: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
    color: '#444444',
  },

  share: {
    marginLeft: 'auto',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  loadingText: {
    fontSize: 16,
    color: '#666666',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },

  emptyText: {
    fontSize: 14,
    color: '#777777',
    marginTop: 6,
    textAlign: 'center',
  },

  // =========================
  // FULL SCREEN IMAGE
  // =========================

  imageModal: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullImage: {
    width: '100%',
    height: '85%',
  },

  closeButton: {
    position: 'absolute',
    top: 45,
    right: 20,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor:
      'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  closeText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 35,
  },

});