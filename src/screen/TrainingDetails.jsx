import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { BASE_URL } from '../config';
const TrainingDetails = ({ route, navigation }) => { // Added navigation prop
  const { employeeId } = route.params; // Get employee ID from navigation
  const [trainingData, setTrainingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrainingDetails = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        
        const config = {
          method: 'get',
          url: `${BASE_URL}/training/employee/${employeeId}`,
          headers: { 
            'Authorization': `Bearer ${userToken}`
          }
        };

        const response = await axios.request(config);
        setTrainingData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching training details:', err);
        setError('Failed to load training details');
        setLoading(false);
      }
    };

    fetchTrainingDetails();
  }, [employeeId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading training history...</Text>
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

  if (!trainingData || trainingData.count === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text>No training history found for this employee</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <Header 
        title="Training Details" 
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
      />
      
      <ScrollView style={styles.scrollContainer}>
        {/* Employee Header */}
        <View style={styles.employeeHeader}>
          <Text style={styles.employeeName}>{trainingData.data[0].employee.name}</Text>
          <Text style={styles.employeeId}>ID: {trainingData.employee_id}</Text>
          <Text style={styles.department}>{trainingData.data[0].employee.department}</Text>
        </View>

        {/* Training Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Training Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Trainings:</Text>
            <Text style={styles.summaryValue}>{trainingData.count}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Completed:</Text>
            <Text style={styles.summaryValue}>
              {trainingData.data.filter(t => t.completion_status === 'Completed').length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pending:</Text>
            <Text style={styles.summaryValue}>
              {trainingData.data.filter(t => t.completion_status === 'Pending').length}
            </Text>
          </View>
        </View>

        {/* Training History List */}
        <Text style={styles.historyTitle}>Training History</Text>
        {trainingData.data.map((training, index) => (
          <View key={training.id} style={styles.trainingCard}>
            <Text style={styles.programTitle}>{training.program_title}</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text>{training.training_type}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dates:</Text>
              <Text>{training.start_date} to {training.end_date}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text>{training.duration}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[
                styles.statusText,
                training.completion_status === 'Completed' ? styles.completed : styles.pending
              ]}>
                {training.completion_status}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Supervisor:</Text>
              <Text>{training.supervisor_manager.name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Certification:</Text>
              <Text>{training.certification_received ? 'Received' : 'Not Received'}</Text>
            </View>
            
            {index < trainingData.data.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 16,
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
  employeeHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  employeeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  employeeId: {
    fontSize: 16,
    color: '#7f8c8d',
    marginVertical: 4,
  },
  department: {
    fontSize: 16,
    color: '#34495e',
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  trainingCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2980b9',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 120,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  statusText: {
    fontWeight: 'bold',
  },
  completed: {
    color: '#27ae60',
  },
  pending: {
    color: '#f39c12',
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 12,
  },
});

export default TrainingDetails;