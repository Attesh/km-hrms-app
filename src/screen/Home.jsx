import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StatusBar } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

const Home = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    attendance: true,
    tasks: true,
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${BASE_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Get today's date in a readable format
  const getTodayDate = () => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden={true} />
        <Header title="Home" onMenuPress={toggleSidebar} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading dashboard data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden={true} />
        <Header title="Home" onMenuPress={toggleSidebar} />
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={50} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchDashboardData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
            <Icon name="refresh" size={20} color="#fff" style={styles.retryIcon} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <Header title="Home" onMenuPress={toggleSidebar} />
      <View style={styles.content}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007BFF']}
              tintColor="#007BFF"
            />
          }
        >
          {/* Today's Date Display */}
          <View style={styles.dateContainer}>
            <Icon name="calendar-today" size={20} color="#555" style={styles.dateIcon} />
            <Text style={styles.dateText}>{getTodayDate()}</Text>
          </View>

          <View style={styles.statsContainer}>
            <Section
              title="Attendance"
              expanded={expandedSections.attendance}
              toggleSection={() => toggleSection('attendance')}
            >
              <View style={styles.cardsContainer}>
                <Card icon="people" color="#673ab7" label="Active Users" value={dashboardData?.attendance?.total_active_users || 0} />
                <Card icon="event-available" color="#4caf50" label="Present Today" value={dashboardData?.attendance?.total_present_users || 0} />
                <Card icon="login" color="#2196f3" label="Checked In" value={dashboardData?.attendance?.total_checkin_users || 0} />
                <Card icon="watch-later" color="#ff9800" label="Late Arrivals" value={dashboardData?.attendance?.total_late_checkin_users || 0} />
                <Card icon="event-busy" color="#f44336" label="Absent Today" value={dashboardData?.attendance?.total_absent_users || 0} />
                <Card icon="beach-access" color="#9c27b0" label="Leave Requests" value={dashboardData?.attendance?.total_leave_requests || 0} />
              </View>
            </Section>

            <Section
              title="Team Tasks"
              expanded={expandedSections.tasks}
              toggleSection={() => toggleSection('tasks')}
            >
              <View style={styles.cardsContainer}>
                <Card icon="assignment" color="#673ab7" label="Total Today" value={dashboardData?.team_tasks?.total_tasks_today || 0} />
                <Card icon="autorenew" color="#ff5722" label="In Progress" value={dashboardData?.team_tasks?.total_tasks_in_progress || 0} />
                <Card icon="check-circle" color="#4caf50" label="Completed" value={dashboardData?.team_tasks?.total_tasks_completed || 0} />
              </View>
            </Section>
          </View>
        </ScrollView>
      </View>
      <Footer />
    </SafeAreaView>
  );
};

const Section = ({ title, expanded, toggleSection, children }) => (
  <View style={styles.section}>
    <TouchableOpacity onPress={toggleSection} style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Icon name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color="#555" />
    </TouchableOpacity>
    {expanded && <View style={styles.sectionContent}>{children}</View>}
  </View>
);

const Card = ({ icon, color, label, value }) => (
  <View style={[styles.card, { borderLeftColor: color }]}>
    <View style={[styles.cardIcon, { backgroundColor: `${color}22` }]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  // Add these new styles for the date display
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionContent: {
    padding: 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
});

export default Home;