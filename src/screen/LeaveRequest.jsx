import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

const { width } = Dimensions.get('window');

const ReloadButton = ({ onPress }) => (
  <TouchableOpacity style={styles.reloadButton} onPress={onPress}>
    <Icon name="refresh" size={20} color="#fff" />
    <Text style={styles.reloadButtonText}>Reload</Text>
  </TouchableOpacity>
);

const LeaveRequest = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('today_only');
  const [token, setToken] = useState('');

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  useEffect(() => {
    const getToken = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          throw new Error('No token found');
        }
        setToken(userToken);
      } catch (err) {
        console.error('Token error:', err);
        setError('Failed to get authentication token: ' + err.message);
        setLoading(false);
      }
    };
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchLeaveRequests();
    }
  }, [token, statusFilter]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${BASE_URL}/leave-requests`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });

      if (response.data.success) {
        setLeaveRequests(response.data.data.data || []);
      } else {
        setError('Failed to fetch leave requests');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = leaveRequests.filter(leave =>
    leave.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = (status) => {
    if (status === 'approved') return '#4CAF50';
    if (status === 'declined') return '#F44336';
    if (status === 'pending') return '#FF9800';
    return '#9E9E9E';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading && leaveRequests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading leave requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={50} color="#F44336" />
          <Text style={styles.errorText}>Error: {error}</Text>
          <Text style={styles.errorSubText}>Please try again later</Text>
          <ReloadButton onPress={fetchLeaveRequests} />
        </View>
      </SafeAreaView>
    );
  }

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

          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#9E9E9E" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by employee name..."
              placeholderTextColor="#9E9E9E"
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
            />
          </View>

          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by Status:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={statusFilter}
                style={styles.picker}
                dropdownIconColor="#757575"
                onValueChange={(itemValue) => setStatusFilter(itemValue)}>
                <Picker.Item label="All Requests" value="all" />
                <Picker.Item label="Today's Leaves" value="today_only" />
                <Picker.Item label="Approved" value="approved" />
                <Picker.Item label="Pending" value="pending" />
                <Picker.Item label="Declined" value="declined" />
              </Picker>
            </View>
          </View>

          {filteredRequests.length > 0 ? (
            filteredRequests.map((leave) => (
              <View key={leave.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Icon name="person" size={20} color="#3F51B5" />
                  <Text style={styles.name}>{leave.employee?.name || 'Unknown'}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(leave.status) }]}>
                    <Icon
                      name={
                        leave.status === 'approved'
                          ? 'check-circle'
                          : leave.status === 'declined'
                          ? 'cancel'
                          : 'hourglass-top'
                      }
                      size={14}
                      color="#fff"
                    />
                    <Text style={styles.badgeText}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="event" size={16} color="#757575" />
                  <Text style={styles.detailText}>
                    {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="calendar-today" size={16} color="#757575" />
                  <Text style={styles.detailText}>{leave.number_of_days} day(s)</Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="work" size={16} color="#757575" />
                  <Text style={styles.detailText}>
                    {leave.leave_type?.name || 'N/A'} ({leave.leave_type?.paid_or_unpaid || 'N/A'})
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noResults}>
              <Icon name="search-off" size={50} color="#BDBDBD" />
              <Text style={styles.noResultsText}>No matching leave requests found</Text>
              <ReloadButton onPress={fetchLeaveRequests} />
            </View>
          )}
        </ScrollView>
      </View>
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  mainContent: { 
    flex: 1, 
    flexDirection: 'row' 
  },
  content: { 
    padding: 20, 
    flexGrow: 1 
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#212121',
    fontFamily: 'sans-serif-medium',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#212121',
    fontSize: 15,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 8,
    fontFamily: 'sans-serif',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#212121',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
    marginLeft: 10,
    flex: 1,
    fontFamily: 'sans-serif-medium',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 10,
    fontFamily: 'sans-serif',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'sans-serif-medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#424242',
    fontFamily: 'sans-serif',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FAFAFA',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#D32F2F',
    textAlign: 'center',
    fontFamily: 'sans-serif-medium',
  },
  errorSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
    fontFamily: 'sans-serif',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    fontFamily: 'sans-serif',
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3F51B5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 20,
    elevation: 2,
  },
  reloadButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
  },
});

export default LeaveRequest;