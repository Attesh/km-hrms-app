import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  Linking,
  Share,
  StatusBar
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, parseISO } from 'date-fns';
import Markdown from 'react-native-markdown-display';

const TaskDetails = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const getToken = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        setToken(userToken);
      } catch (err) {
        setError('Failed to get authentication token');
      }
    };
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchTaskDetails();
    }
  }, [token, taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/team-tasks/${taskId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setTask(response.data.data);
      } else {
        setError('Failed to fetch task details');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Task: ${task.title}\n\nDetails: ${task.details}\n\nAssigned to: ${task.assigned_to.name}\n\nStatus: ${task.status}`,
        title: 'Share Task Details'
      });
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };

  const handleDeadlinePress = () => {
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${format(deadlineDate, 'yyyyMMdd')}/${format(deadlineDate, 'yyyyMMdd')}&details=${encodeURIComponent(task.details)}`;
      Linking.openURL(calendarUrl).catch(err => console.error('Error opening calendar:', err));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'MMM dd, yyyy');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'MMM dd, yyyy - hh:mm a');
  };

  const getPriorityColor = () => {
    switch (task?.priority) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffbb33';
      case 'low':
        return '#00C851';
      default:
        return '#33b5e5';
    }
  };

  const getStatusColor = () => {
    switch (task?.status) {
      case 'completed':
        return '#00C851';
      case 'in_progress':
        return '#ffbb33';
      case 'not_started':
        return '#ff4444';
      default:
        return '#33b5e5';
    }
  };

  const getStatusIcon = () => {
    switch (task?.status) {
      case 'completed':
        return { icon: 'check-circle', color: '#00C851' };
      case 'in_progress':
        return { icon: 'autorenew', color: '#ffbb33' };
      case 'not_started':
        return { icon: 'pending', color: '#ff4444' };
      default:
        return { icon: 'help-outline', color: '#33b5e5' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={50} color="#ff4444" />
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTaskDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={50} color="#ff4444" />
        <Text style={styles.errorText}>Task not found</Text>
      </View>
    );
  }

  const statusIcon = getStatusIcon();

return (
    <View style={styles.container}>
       <StatusBar hidden={true} />
      <Header 
        title="Tasks Details" 
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
      />
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Task Title and Description Header */}
        <View style={styles.headerSolid}>
          <View style={styles.titleContainer}>
            <Icon name={statusIcon.icon} size={28} color={statusIcon.color} />
            <Text style={styles.taskTitle}>{task.title}</Text>
          </View>
          <Text style={styles.taskSubtitle}>{task.assigned_to.department}</Text>
          
          {/* Description Section */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description:</Text>
            <Text style={styles.descriptionText}>{task.details}</Text>
          </View>
        </View>

        {/* Task Meta Information */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="person" size={20} color="#6200ee" />
              <Text style={styles.metaText}>{task.assigned_to.name}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="assignment-ind" size={20} color="#6200ee" />
              <Text style={styles.metaText}>ID: {task.assigned_to.employee_id}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="event" size={20} color="#6200ee" />
              <Text style={styles.metaText}>{formatDate(task.date)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.metaItem} 
              onPress={handleDeadlinePress}
            >
              <IconCommunity name="clock-alert-outline" size={20} color="#6200ee" />
              <Text style={[styles.metaText, task.deadline && styles.deadlineText]}>
                {formatDateTime(task.deadline)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status and Priority Badges */}
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.badgeText}>{task.status.replace('_', ' ')}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getPriorityColor() }]}>
            <Text style={styles.badgeText}>{task.priority} priority</Text>
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="create" size={20} color="#757575" />
              <Text style={styles.infoLabel}>Created:</Text>
              <Text style={styles.infoValue}>{formatDateTime(task.created_at)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="update" size={20} color="#757575" />
              <Text style={styles.infoLabel}>Last Updated:</Text>
              <Text style={styles.infoValue}>{formatDateTime(task.updated_at)}</Text>
            </View>
            {task.remarks && (
              <View style={styles.infoRow}>
                <Icon name="comment" size={20} color="#757575" />
                <Text style={styles.infoLabel}>Remarks:</Text>
                <Text style={styles.infoValue}>{task.remarks}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

     
      

      <Footer />
    </View>
  );
};

const markdownStyles = {
  body: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginVertical: 10,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    marginVertical: 8,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  bullet_list: {
    marginVertical: 5,
  },
  ordered_list: {
    marginVertical: 5,
  },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  link: {
    color: '#6200ee',
    textDecorationLine: 'underline',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6200ee',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#ff4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6200ee',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  headerSolid: {
    backgroundColor: '#6200ee',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    flexShrink: 1,
  },
  taskSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 38,
  },
  metaContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  deadlineText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 10,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#757575',
    width: 100,
  },
  infoValue: {
    flex: 1,
    color: '#333',
    marginLeft: 10,
  },
  
   descriptionContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
});

export default TaskDetails;