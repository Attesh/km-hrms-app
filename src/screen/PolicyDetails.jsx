import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { BASE_URL } from '../config';
const PolicyDetails = ({ route, navigation }) => {
  const { policyId } = route.params;
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const fetchPolicyDetails = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        
        const config = {
          method: 'get',
          url: `${BASE_URL}/policies/${policyId}`,
          headers: { 
            'Authorization': `Bearer ${userToken}`
          }
        };

        const response = await axios.request(config);
        setPolicy(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching policy details:', err);
        setError('Failed to load policy details');
        setLoading(false);
      }
    };

    fetchPolicyDetails();
  }, [policyId]);

  const handleDownloadPDF = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      
      const config = {
        method: 'get',
        url: `${BASE_URL}/policies/${policyId}/download`,
        headers: { 
          'Authorization': `Bearer ${userToken}`
        }
      };

      const response = await axios.request(config);
      
      if (response.data.success && response.data.file_url) {
        // Open the PDF URL in browser or download manager
        Linking.openURL(response.data.file_url);
      } else {
        Alert.alert('No Attachment', 'This policy does not have an attached PDF file.');
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      Alert.alert('Error', 'Failed to download PDF. Please try again later.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading policy details...</Text>
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

  if (!policy) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text>Policy not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Policy Details" 
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
      />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Icon name="policy" size={40} color="#007bff" style={styles.icon} />
          <Text style={styles.title}>{policy.title}</Text>
          <Text style={styles.publishedDate}>Published: {policy.published_at}</Text>
        </View>

        {policy.has_attachment && (
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={handleDownloadPDF}
          >
            <Icon name="picture-as-pdf" size={24} color="#fff" />
            <Text style={styles.downloadButtonText}>Download PDF</Text>
          </TouchableOpacity>
        )}

        <View style={styles.contentContainer}>
          <RenderHtml
            contentWidth={width}
            source={{ html: policy.content }}
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
    marginBottom: 5,
  },
  publishedDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  downloadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
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

export default PolicyDetails;