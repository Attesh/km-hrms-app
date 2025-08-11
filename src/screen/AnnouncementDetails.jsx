import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Linking
} from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { BASE_URL } from '../config';
const AnnouncementDetails = ({ route, navigation }) => {
  const { announcementId } = route.params;
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const fetchAnnouncementDetails = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        
        const config = {
          method: 'get',
          url: `${BASE_URL}/announcements/${announcementId}`,
          headers: { 
            'Authorization': `Bearer ${userToken}`
          }
        };

        const response = await axios.request(config);
        setAnnouncement(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching announcement details:', err);
        setError('Failed to load announcement details');
        setLoading(false);
      }
    };

    fetchAnnouncementDetails();
  }, [announcementId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading announcement details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!announcement) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text>Announcement not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <Header 
        title="Announcement Details" 
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
      />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Icon name="campaign" size={40} color="#007bff" style={styles.icon} />
          <Text style={styles.title}>{announcement.title}</Text>
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Icon name="category" size={20} color="#666" />
            <Text style={styles.metaText}>{announcement.category}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="people" size={20} color="#666" />
            <Text style={styles.metaText}>{announcement.target_team}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="date-range" size={20} color="#666" />
            <Text style={styles.metaText}>{announcement.published_at}</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <RenderHtml
            contentWidth={width}
            source={{ html: announcement.content }}
            baseStyle={styles.htmlContent}
          />
        </View>
      </ScrollView>
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  htmlContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export default AnnouncementDetails;