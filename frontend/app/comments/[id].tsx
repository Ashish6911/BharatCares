import * as SecureStore from 'expo-secure-store';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_URL } from '@/config/api';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


type Comment = {
  _id: string;
  text: string;
  createdAt: string;
  createdBy?: {
    _id?: string;
    name?: string;
  };
};

export default function CommentsScreen() {
  const { id } = useLocalSearchParams();

  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // =========================
  // FETCH COMMENTS
  // =========================

  const fetchComments = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/comments/complaint/${id}`
      );

      console.log(
        'COMMENTS:',
        response.data
      );

      setComments(response.data);

    } catch (error: any) {
      console.log(
        'FETCH COMMENTS ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Error',
        'Could not load comments'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD COMMENTS
  // =========================

  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [id]);

  // =========================
  // POST COMMENT
  // =========================

  const handlePostComment = async () => {
    if (!comment.trim()) {
      Alert.alert(
        'Comment',
        'Please write a comment first.'
      );
      return;
    }

    try {
      setPosting(true);

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
        `${API_URL}/api/comments`,
        {
          text: comment.trim(),
          complaint: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        'COMMENT POST RESPONSE:',
        response.data
      );

      setComment('');

      // Refresh comments
      await fetchComments();

    } catch (error: any) {
      console.log(
        'POST COMMENT ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Comment',
        error.response?.data?.message ||
          'Could not post comment'
      );
    } finally {
      setPosting(false);
    }
  };

  // =========================
  // COMMENT CARD
  // =========================

  const renderComment = ({
    item,
  }: {
    item: Comment;
  }) => {
    return (
      <View style={styles.commentCard}>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.createdBy?.name
              ?.charAt(0)
              ?.toUpperCase() || 'U'}
          </Text>
        </View>

        <View style={styles.commentContent}>

          <Text style={styles.userName}>
            {item.createdBy?.name ||
              'User'}
          </Text>

          <Text style={styles.commentText}>
            {item.text}
          </Text>

          <Text style={styles.date}>
            {new Date(
              item.createdAt
            ).toLocaleDateString()}
          </Text>

        </View>

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text style={styles.back}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Comments
        </Text>

        <View
          style={styles.placeholder}
        />

      </View>

      {/* COMMENTS */}

      <KeyboardAvoidingView
        style={styles.main}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        keyboardVerticalOffset={0}
      >

        {loading ? (

          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
            />
          </View>

        ) : comments.length === 0 ? (

          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No comments yet.
            </Text>

            <Text style={styles.emptySubText}>
              Be the first to comment.
            </Text>
          </View>

        ) : (

          <FlatList
            data={comments}
            keyExtractor={(item) =>
              item._id
            }
            renderItem={renderComment}
            contentContainerStyle={
              styles.commentList
            }
            showsVerticalScrollIndicator={
              false
            }
          />

        )}

        {/* INPUT */}

        <View
          style={styles.inputContainer}
        >

          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor="#888"
            value={comment}
            onChangeText={setComment}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.postButton,
              posting &&
                styles.disabledButton,
            ]}
            onPress={handlePostComment}
            disabled={posting}
          >

            {posting ? (
              <ActivityIndicator
                color="#ffffff"
                size="small"
              />
            ) : (
              <Text style={styles.postText}>
                Post
              </Text>
            )}

          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  main: {
    flex: 1,
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    backgroundColor: '#ffffff',
  },

  back: {
    fontSize: 28,
    color: '#111111',
  },

  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111111',
  },

  placeholder: {
    width: 28,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555555',
  },

  emptySubText: {
    fontSize: 13,
    color: '#888888',
    marginTop: 5,
  },

  commentList: {
    padding: 15,
    paddingBottom: 20,
  },

  commentCard: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },

  commentContent: {
    flex: 1,
  },

  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
  },

  commentText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginTop: 3,
  },

  date: {
    fontSize: 10,
    color: '#999999',
    marginTop: 5,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    backgroundColor: '#ffffff',
  },

  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#f4f4f4',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111111',
  },

  postButton: {
    marginLeft: 10,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  postText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

});