import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LeaveRequest = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  const leaveRequests = [
    {
      id: 1,
      employee: 'Ali Raza',
      type: 'Sick Leave',
      from: '2025-08-01',
      to: '2025-08-03',
      status: 'Pending',
    },
    {
      id: 2,
      employee: 'Sana Tariq',
      type: 'Annual Leave',
      from: '2025-08-05',
      to: '2025-08-10',
      status: 'Approved',
    },
    {
      id: 3,
      employee: 'Usman Javed',
      type: 'Casual Leave',
      from: '2025-08-02',
      to: '2025-08-02',
      status: 'Rejected',
    },
    {
      id: 4,
      employee: 'Ayesha Khan',
      type: 'Annual Leave',
      from: '2025-08-07',
      to: '2025-08-09',
      status: 'Pending',
    },
  ];

  const statusColor = (status) => {
    if (status === 'Approved') return '#4caf50';
    if (status === 'Rejected') return '#f44336';
    if (status === 'Pending') return '#ff9800';
    return '#777';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Leave Requests" onMenuPress={toggleSidebar} />
      <View style={styles.mainContent}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Leave Requests</Text>
          {leaveRequests.map((leave) => (
            <View key={leave.id} style={styles.card}>
              <Icon name="event-note" size={24} color="#007bff" style={{ marginBottom: 6 }} />
              <Text style={styles.name}>{leave.employee}</Text>
              <Text style={styles.detail}>Type: {leave.type}</Text>
              <Text style={styles.detail}>From: {leave.from}</Text>
              <Text style={styles.detail}>To: {leave.to}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(leave.status) }]}>
                <Icon name={
                  leave.status === 'Approved'
                    ? 'check-circle'
                    : leave.status === 'Rejected'
                    ? 'cancel'
                    : 'hourglass-top'
                } size={14} color="#fff" />
                <Text style={styles.badgeText}>{leave.status}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      <Footer />
    </SafeAreaView>
  );
};

export default LeaveRequest;

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContent: { flex: 1, flexDirection: 'row' },
  content: { padding: 16, flexGrow: 1 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#f1f7ff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2d3a',
    marginBottom: 4,
  },
  detail: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
});
