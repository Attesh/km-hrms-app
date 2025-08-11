import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SearchBox from '../components/SearchBox';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';


const ReloadButton = ({ onPress }) => (
  <TouchableOpacity style={styles.reloadButton} onPress={onPress}>
    <Icon name="refresh" size={20} color="#fff" />
    <Text style={styles.reloadButtonText}>Reload</Text>
  </TouchableOpacity>
);

const Training = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  // Navigation to details page
  const navigateToDetails = (training) => {
    navigation.navigate('TrainingDetails', { 
      employeeId: training.employee?.employee_id 
    });
  };

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
      fetchTrainings();
    }
  }, [token, statusFilter]);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${BASE_URL}/training`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });

      if (response.data.success) {
        setTrainings(response.data.data.data || []);
      } else {
        setError('Failed to fetch trainings');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch trainings');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchTrainings();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTrainings = trainings.filter(training =>
    training.program_title?.toLowerCase().includes(searchText.toLowerCase()) ||
    training.employee?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    training.training_type?.toLowerCase().includes(searchText.toLowerCase())
  );

  const statusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#4caf50';
      case 'Approved':
        return '#2196f3';
      case 'Pending':
        return '#ff9800';
      case 'Rejected':
        return '#f44336';
      default:
        return '#777';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading && trainings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loadingText}>Loading trainings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={50} color="#dc3545" />
          <Text style={styles.errorText}>Error: {error}</Text>
          <Text style={styles.errorSubText}>Please try again later</Text>
          <ReloadButton onPress={fetchTrainings} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <Header title="Training" onMenuPress={toggleSidebar} />
      <View style={styles.mainContent}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />

        <ScrollView contentContainerStyle={styles.content}>

          <View style={styles.filterContainer}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Status:</Text>
              <Picker
                selectedValue={statusFilter}
                style={styles.picker}
                onValueChange={(itemValue) => setStatusFilter(itemValue)}
              >
                <Picker.Item label="All Statuses" value="all" />
                {/* <Picker.Item label="Approved" value="Approved" /> */}
                <Picker.Item label="Pending" value="Pending" />
                <Picker.Item label="Completed" value="Completed" />
                {/* <Picker.Item label="Rejected" value="Rejected" /> */}
              </Picker>
            </View>
          </View>

          <SearchBox
            placeholder="Search by program, employee or type"
            searchText={searchText}
            setSearchText={setSearchText}
          />

          {filteredTrainings.length > 0 ? (
            filteredTrainings.map((training) => (
              <TouchableOpacity 
                key={training.id} 
                style={styles.card}
                onPress={() => navigateToDetails(training)}
              >
                <View style={styles.cardHeader}>
                  <Icon name="school" size={24} color="#007bff" />
                  <Text style={styles.name}>{training.program_title}</Text>
                  <Icon 
                    name="chevron-right" 
                    size={24} 
                    color="#007bff" 
                    style={styles.detailsIcon}
                  />
                </View>
                <Text style={styles.detail}>Employee: {training.employee?.name || 'N/A'}</Text>
                <Text style={styles.detail}>Department: {training.employee?.department || 'N/A'}</Text>
                <Text style={styles.detail}>Type: {training.training_type}</Text>
                <Text style={styles.detail}>Dates: {formatDate(training.start_date)} to {formatDate(training.end_date)}</Text>
                <Text style={styles.detail}>Duration: {training.duration}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(training.approval_status) }]}>
                    <Icon 
                      name={
                        training.approval_status === 'Approved' ? 'check-circle' :
                        training.approval_status === 'Pending' ? 'schedule' :
                        training.approval_status === 'Rejected' ? 'cancel' : 'help'
                      } 
                      size={14} 
                      color="#fff" 
                    />
                    <Text style={styles.badgeText}>Approval: {training.approval_status}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(training.completion_status) }]}>
                    <Icon 
                      name={
                        training.completion_status === 'Completed' ? 'check-circle' :
                        training.completion_status === 'Pending' ? 'schedule' : 'help'
                      } 
                      size={14} 
                      color="#fff" 
                    />
                    <Text style={styles.badgeText}>Completion: {training.completion_status}</Text>
                  </View>
                </View>
                {training.certification_received && (
                  <View style={[styles.statusBadge, { backgroundColor: '#4caf50', alignSelf: 'flex-start', marginTop: 4 }]}>
                    <Icon name="verified" size={14} color="#fff" />
                    <Text style={styles.badgeText}>Certified</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noResults}>
              <Icon name="search-off" size={40} color="#6c757d" />
              <Text style={styles.noResultsText}>No matching trainings found</Text>
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
    backgroundColor: '#f8f9fa'
  },
  mainContent: { 
    flex: 1, 
    flexDirection: 'row' 
  },
  content: { 
    padding: 16, 
    flexGrow: 1 
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2d3a',
    marginLeft: 8,
    flex: 1,
  },
  detailsIcon: {
    marginLeft: 'auto',
  },
  detail: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
  },
  errorSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6c757d',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
     reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 16,
  },
  reloadButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default Training;