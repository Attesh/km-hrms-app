import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Platform,
  TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

// Create a reusable ReloadButton component
const ReloadButton = ({ onPress }) => (
  <TouchableOpacity style={styles.reloadButton} onPress={onPress}>
    <Icon name="refresh" size={20} color="#fff" />
    <Text style={styles.reloadButtonText}>Reload</Text>
  </TouchableOpacity>
);

const Roster = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rosterData, setRosterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dayFilter, setDayFilter] = useState('All');
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
      fetchRosterData();
    }
  }, [token, statusFilter, dayFilter]);

  const fetchRosterData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (dayFilter !== 'All') params.day = dayFilter;

      const response = await axios.get(`${BASE_URL}/rosters`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        params: Object.keys(params).length ? params : undefined
      });

      if (response.data.success) {
        setRosterData(response.data.data);
      } else {
        setError('Failed to fetch roster data');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch roster data');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoster = rosterData.filter(item =>
    item.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatShiftTime = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const formatTime = (time) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  if (loading && rosterData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loadingText}>Loading roster data...</Text>
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
          <ReloadButton onPress={fetchRosterData} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <Header title="Roster" onMenuPress={toggleSidebar} />

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
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={statusFilter}
                  style={styles.picker}
                  dropdownIconColor="#007bff"
                  mode="dropdown" // Add this for better dropdown appearance
                  onValueChange={(itemValue) => setStatusFilter(itemValue)}>
                  <Picker.Item label="All" value="All" />
                  <Picker.Item label="Onsite" value="Onsite" />
                  <Picker.Item label="Remote" value="Remote" />
                </Picker>
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Day:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={dayFilter}
                  style={styles.picker}
                  dropdownIconColor="#007bff"
                  mode="dropdown" // Add this for better dropdown appearance
                  onValueChange={(itemValue) => setDayFilter(itemValue)}>
                  <Picker.Item label="All" value="All" />
                  <Picker.Item label="Monday" value="monday" />
                  <Picker.Item label="Tuesday" value="tuesday" />
                  <Picker.Item label="Wednesday" value="wednesday" />
                  <Picker.Item label="Thursday" value="thursday" />
                  <Picker.Item label="Friday" value="friday" />
                  <Picker.Item label="Saturday" value="saturday" />
                  <Picker.Item label="Sunday" value="sunday" />
                </Picker>
              </View>
            </View>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search employee..."
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
          />

          {filteredRoster.length > 0 ? (
            filteredRoster.map((item) => (
              <View key={item.id} style={[
                styles.card,
                item.status === 'Onsite' ? styles.onsiteCard : styles.remoteCard
              ]}>
                <Icon
                  name="calendar-today"
                  size={30}
                  color={item.status === 'Onsite' ? '#28a745' : '#6c757d'}
                  style={styles.icon}
                />
                <View style={styles.employeeInfo}>
                  <Text style={styles.name}>{item.employee?.name || 'Unknown'}</Text>
                  <Text style={styles.department}>{item.employee?.department || 'N/A'}</Text>
                  <View style={styles.shiftContainer}>
                    <Text style={styles.day}>{item.day}</Text>
                    <View style={styles.statusContainer}>
                      <Text style={[
                        styles.status,
                        item.status === 'Onsite' ? styles.onsiteStatus : styles.remoteStatus
                      ]}>
                        {item.status}
                      </Text>
                      <Text style={styles.shift}>{formatShiftTime(item.start_time, item.end_time)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noResults}>
              <Icon name="search-off" size={40} color="#6c757d" />
              <Text style={styles.noResultsText}>No matching employees found</Text>
              <ReloadButton onPress={fetchRosterData} />
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
    backgroundColor: '#f8f9fa',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterItem: {
    flex: 1,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50, // Increased height for better visibility
    width: '100%',
    color: '#333',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  onsiteCard: {
    backgroundColor: '#e6ffed',
  },
  remoteCard: {
    backgroundColor: '#f8f9fa',
  },
  icon: {
    marginRight: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  department: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  shiftContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  day: {
    fontSize: 14,
    fontWeight: '500',
    color: '#28a745',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  onsiteStatus: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  remoteStatus: {
    backgroundColor: '#e2e3e5',
    color: '#383d41',
  },
  shift: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
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

export default Roster;