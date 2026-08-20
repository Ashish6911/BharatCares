import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import axios from 'axios';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'http://192.168.1.12:5000';

type Dashboard = {
  totalUsers: number;
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  totalSuggestions: number;
};

type Complaint = {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  createdAt: string;
  createdBy?: {
    _id?: string;
    name?: string;
  };
};

export default function AdminScreen() {
  const [dashboard, setDashboard] =
    useState<Dashboard | null>(null);

  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  // =========================
  // FETCH DASHBOARD
  // =========================

  const fetchDashboard = async () => {
    try {
      const token =
        await SecureStore.getItemAsync('token');

      if (!token) {
        router.replace('/login' as any);
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboard(response.data);

    } catch (error: any) {
      console.log(
        'DASHBOARD ERROR:',
        error.response?.data ||
          error.message
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        await SecureStore.deleteItemAsync(
          'token'
        );

        await SecureStore.deleteItemAsync(
          'user'
        );

        router.replace('/login' as any);
      }
    }
  };

  // =========================
  // FETCH ALL COMPLAINTS
  // =========================

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/complaints`
      );

      console.log(
        'ADMIN COMPLAINTS:',
        response.data
      );

      setComplaints(response.data);

    } catch (error: any) {
      console.log(
        'COMPLAINT FETCH ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Error',
        'Could not load complaints'
      );
    }
  };

  // =========================
  // LOAD EVERYTHING
  // =========================

  const loadData = async () => {
    setLoading(true);

    await Promise.all([
      fetchDashboard(),
      fetchComplaints(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (
    complaintId: string,
    status: string
  ) => {
    try {
      setUpdatingId(complaintId);

      const token =
        await SecureStore.getItemAsync('token');

      if (!token) {
        router.replace('/login' as any);
        return;
      }

      const response = await axios.patch(
        `${API_URL}/api/complaints/${complaintId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        'STATUS UPDATED:',
        response.data
      );

      // Update complaint locally
      setComplaints((current) =>
        current.map((complaint) =>
          complaint._id === complaintId
            ? {
                ...complaint,
                status,
              }
            : complaint
        )
      );

      // Refresh dashboard counts
      await fetchDashboard();

    } catch (error: any) {
      console.log(
        'STATUS UPDATE ERROR:',
        error.response?.data ||
          error.message
      );

      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Could not update status'
      );

    } finally {
      setUpdatingId(null);
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
        'ADMIN LOGOUT COMPLETE'
      );

      router.replace('/login' as any);

    } catch (error) {
      console.log(
        'ADMIN LOGOUT ERROR:',
        error
      );

      Alert.alert(
        'Logout Error',
        'Could not logout'
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <Text style={styles.headerTitle}>
          Admin Dashboard
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>

      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >

        {/* OVERVIEW */}

        <Text style={styles.heading}>
          Overview
        </Text>

        <View style={styles.card}>

          <Text style={styles.cardLabel}>
            Total Users
          </Text>

          <Text style={styles.cardNumber}>
            {dashboard?.totalUsers ?? 0}
          </Text>

        </View>

        {/* COMPLAINT COUNTS */}

        <Text style={styles.sectionTitle}>
          Complaints
        </Text>

        <View style={styles.row}>

          <View style={styles.smallCard}>
            <Text style={styles.smallLabel}>
              Total
            </Text>

            <Text style={styles.smallNumber}>
              {dashboard?.totalComplaints ?? 0}
            </Text>
          </View>

          <View style={styles.smallCard}>
            <Text style={styles.smallLabel}>
              Pending
            </Text>

            <Text style={styles.smallNumber}>
              {dashboard?.pendingComplaints ?? 0}
            </Text>
          </View>

        </View>

        <View style={styles.row}>

          <View style={styles.smallCard}>
            <Text style={styles.smallLabel}>
              In Progress
            </Text>

            <Text style={styles.smallNumber}>
              {dashboard?.inProgressComplaints ?? 0}
            </Text>
          </View>

          <View style={styles.smallCard}>
            <Text style={styles.smallLabel}>
              Resolved
            </Text>

            <Text style={styles.smallNumber}>
              {dashboard?.resolvedComplaints ?? 0}
            </Text>
          </View>

        </View>

        {/* SUGGESTIONS */}

        <Text style={styles.sectionTitle}>
          Suggestions
        </Text>

        <View style={styles.card}>

          <Text style={styles.cardLabel}>
            Total Suggestions
          </Text>

          <Text style={styles.cardNumber}>
            {dashboard?.totalSuggestions ?? 0}
          </Text>

        </View>

        {/* ========================= */}
        {/* ALL COMPLAINTS */}
        {/* ========================= */}

        <Text style={styles.sectionTitle}>
          Manage Complaints
        </Text>

        {complaints.length === 0 ? (

          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No complaints found.
            </Text>
          </View>

        ) : (

          complaints.map((complaint) => (

            <View
              key={complaint._id}
              style={styles.complaintCard}
            >

              <Text style={styles.complaintTitle}>
                {complaint.title}
              </Text>

              <Text style={styles.complaintDescription}>
                {complaint.description}
              </Text>

              <Text style={styles.complaintInfo}>
                Category: {complaint.category}
              </Text>

              <Text style={styles.complaintInfo}>
                Location: {complaint.location}
              </Text>

              <Text style={styles.complaintInfo}>
                User:{' '}
                {complaint.createdBy?.name ||
                  'Unknown'}
              </Text>

              {/* CURRENT STATUS */}

              <View style={styles.statusRow}>

                <Text style={styles.statusLabel}>
                  Status:
                </Text>

                <Text
                  style={[
                    styles.statusText,
                    complaint.status ===
                      'Pending' &&
                      styles.pendingText,
                    complaint.status ===
                      'In Progress' &&
                      styles.progressText,
                    complaint.status ===
                      'Resolved' &&
                      styles.resolvedText,
                  ]}
                >
                  {complaint.status}
                </Text>

              </View>

              {/* STATUS BUTTONS */}

              <View style={styles.actionRow}>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    complaint.status ===
                      'Pending' &&
                      styles.activeButton,
                  ]}
                  disabled={
                    updatingId ===
                      complaint._id ||
                    complaint.status ===
                      'Pending'
                  }
                  onPress={() =>
                    updateStatus(
                      complaint._id,
                      'Pending'
                    )
                  }
                >
                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    Pending
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    complaint.status ===
                      'In Progress' &&
                      styles.activeButton,
                  ]}
                  disabled={
                    updatingId ===
                      complaint._id ||
                    complaint.status ===
                      'In Progress'
                  }
                  onPress={() =>
                    updateStatus(
                      complaint._id,
                      'In Progress'
                    )
                  }
                >
                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    In Progress
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    complaint.status ===
                      'Resolved' &&
                      styles.activeButton,
                  ]}
                  disabled={
                    updatingId ===
                      complaint._id ||
                    complaint.status ===
                      'Resolved'
                  }
                  onPress={() =>
                    updateStatus(
                      complaint._id,
                      'Resolved'
                    )
                  }
                >
                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    Resolved
                  </Text>
                </TouchableOpacity>

              </View>

              {updatingId ===
                complaint._id && (
                <ActivityIndicator
                  size="small"
                  style={styles.loader}
                />
              )}

            </View>

          ))

        )}

        <View style={styles.bottomSpace} />

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f7f7f7',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    width: '100%',
    minHeight: 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111111',
  },

  logoutButton: {
    minWidth: 70,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  scroll: {
    flex: 1,
    width: '100%',
  },

  content: {
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
    marginTop: 25,
    marginBottom: 10,
  },

  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },

  cardLabel: {
    fontSize: 14,
    color: '#777777',
  },

  cardNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
    marginTop: 5,
  },

  row: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  smallCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
  },

  smallLabel: {
    fontSize: 13,
    color: '#777777',
  },

  smallNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
    marginTop: 6,
  },

  complaintCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },

  complaintTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 7,
  },

  complaintDescription: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
    marginBottom: 10,
  },

  complaintInfo: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 4,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444444',
    marginRight: 6,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },

  pendingText: {
    color: '#d97706',
  },

  progressText: {
    color: '#2563eb',
  },

  resolvedText: {
    color: '#16a34a',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  statusButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: '#eeeeee',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },

  activeButton: {
    backgroundColor: '#111111',
  },

  buttonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },

  loader: {
    marginTop: 10,
  },

  emptyCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
  },

  emptyText: {
    color: '#777777',
    fontSize: 14,
  },

  bottomSpace: {
    height: 40,
  },

});