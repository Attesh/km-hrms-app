import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

const Announcement = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  const fetchAnnouncements = async () => {
    try {
      setError(null);
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      
      const config = {
        method: 'get',
        url: `${BASE_URL}/announcements`,
        headers: { 
          'Authorization': `Bearer ${userToken}`
        }
      };

      const response = await axios.request(config);
      setAnnouncements(response.data.data);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err.response?.data?.message || 'Failed to load announcements. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const filteredAnnouncements = announcements.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToDetails = (announcement) => {
    navigation.navigate('AnnouncementDetails', { 
      announcementId: announcement.id 
    });
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading announcements...</Text>
      </SafeAreaView>
    );
  }

  if (error && !loading) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.reloadButton}
          onPress={fetchAnnouncements}
        >
          <Icon name="refresh" size={20} color="#fff" />
          <Text style={styles.reloadButtonText}>Reload</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <Header title="Announcements" onMenuPress={toggleSidebar} />
      <View style={styles.mainContent}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
        <ScrollView 
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >

          <TextInput
            placeholder="Search announcements..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />

          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card}
                onPress={() => navigateToDetails(item)}
              >
                <Icon name="campaign" size={30} color="#007bff" style={styles.icon} />
                <View style={styles.cardContent}>
                  <Text style={styles.announcementTitle}>{item.title}</Text>
                  <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                      <Icon name="category" size={16} color="#666" />
                      <Text style={styles.metaText}>{item.category}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="people" size={16} color="#666" />
                      <Text style={styles.metaText}>{item.target_team}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="date-range" size={16} color="#666" />
                      <Text style={styles.metaText}>{item.published_at}</Text>
                    </View>
                  </View>
                </View>
                <Icon name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResults}>
                {searchQuery ? 'No matching announcements found' : 'No announcements available'}
              </Text>
              <TouchableOpacity 
                style={styles.reloadButton}
                onPress={fetchAnnouncements}
              >
                <Icon name="refresh" size={20} color="#fff" />
                <Text style={styles.reloadButtonText}>Reload</Text>
              </TouchableOpacity>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
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
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  icon: {
    marginRight: 12,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResults: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  reloadButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default Announcement;