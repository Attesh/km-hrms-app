import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
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
import SearchBox from '../components/SearchBox';

const Policies = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  const fetchPolicies = async () => {
    try {
      setError(null);
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      
      const config = {
        method: 'get',
        url: `${BASE_URL}/policies`,
        headers: { 
          'Authorization': `Bearer ${userToken}`
        }
      };

      const response = await axios.request(config);
      setPolicies(response.data.data || []);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError(err.response?.data?.message || 'Failed to load policies. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPolicies();
  };

  const navigateToDetails = (policy) => {
    navigation.navigate('PolicyDetails', { 
      policyId: policy.id 
    });
  };

  const filteredList = policies.filter(policy =>
    policy.title.toLowerCase().includes(searchText.toLowerCase()) ||
    (policy.published_at && policy.published_at.toLowerCase().includes(searchText.toLowerCase()))
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading policies...</Text>
      </SafeAreaView>
    );
  }

  if (error && !loading) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="error-outline" size={40} color="#dc3545" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.reloadButton}
          onPress={fetchPolicies}
        >
          <Icon name="refresh" size={20} color="#fff" />
          <Text style={styles.reloadButtonText}>Reload</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Policies" onMenuPress={toggleSidebar} />
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
              colors={['#007bff']}
              tintColor="#007bff"
            />
          }
        >
          
          <SearchBox
            placeholder="Search policies by title or date"
            searchText={searchText}
            setSearchText={setSearchText}
          />
          
          {filteredList.length > 0 ? (
            filteredList.map((policy) => (
              <TouchableOpacity 
                key={policy.id} 
                style={styles.card}
                onPress={() => navigateToDetails(policy)}
              >
                <Icon name="policy" size={28} color="#007bff" style={styles.icon} />
                <View style={styles.textContainer}>
                  <Text style={styles.name}>{policy.title}</Text>
                  <Text style={styles.date}>Published: {policy.published_at}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Icon name="search-off" size={40} color="#6c757d" />
              <Text style={styles.noResults}>
                {searchText ? 'No matching policies found' : 'No policies available'}
              </Text>
              <TouchableOpacity 
                style={styles.reloadButton}
                onPress={fetchPolicies}
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 20,
    marginTop: 10,
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
    color: '#343a40',
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
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  date: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResults: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 10,
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

export default Policies;