import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
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

const ReloadButton = ({ onPress }) => (
  <TouchableOpacity style={styles.reloadButton} onPress={onPress}>
    <Icon name="refresh" size={20} color="#fff" />
    <Text style={styles.reloadButtonText}>Reload</Text>
  </TouchableOpacity>
);

const TeamTasks = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskType, setTaskType] = useState('daily');
  const [statusFilter, setStatusFilter] = useState('in_progress');
  const [token, setToken] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        setInitialLoading(false);
      }
    };
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchInitialTasks();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      handleFilterChange();
    }
  }, [taskType, statusFilter]);

  const fetchInitialTasks = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      
      const endpoint = taskType === 'daily' ? 'daily' : 'overall';
      
      const response = await axios.get(`${BASE_URL}/team-tasks/${endpoint}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        params: {
          status: statusFilter,
          page: 1
        }
      });

      if (response.data.success) {
        setTasks(response.data.data || []);
        setHasMore(response.data.has_more || false);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tasks');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFilterChange = async () => {
    try {
      setFilterLoading(true);
      setError(null);
      setPage(1);
      
      const endpoint = taskType === 'daily' ? 'daily' : 'overall';
      
      const response = await axios.get(`${BASE_URL}/team-tasks/${endpoint}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        params: {
          status: statusFilter,
          page: 1
        }
      });

      if (response.data.success) {
        setTasks(response.data.data || []);
        setHasMore(response.data.has_more || false);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tasks');
    } finally {
      setFilterLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || refreshing) return;
    
    try {
      setRefreshing(true);
      
      const endpoint = taskType === 'daily' ? 'daily' : 'overall';
      
      const response = await axios.get(`${BASE_URL}/team-tasks/${endpoint}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        params: {
          status: statusFilter,
          page: page + 1
        }
      });

      if (response.data.success) {
        setTasks(prev => [...prev, ...(response.data.data || [])]);
        setHasMore(response.data.has_more || false);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load more tasks');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const searchLower = searchQuery.toLowerCase();
    return (
      task.title?.toLowerCase().includes(searchLower) ||
      task.assigned_to?.name?.toLowerCase().includes(searchLower) ||
      task.date?.includes(searchQuery)
    );
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return { icon: 'check-circle', color: '#4CAF50' };
      case 'in_progress':
        return { icon: 'autorenew', color: '#FF9800' };
      case 'not_started':
        return { icon: 'pending', color: '#9E9E9E' };
      default:
        return { icon: 'help-outline', color: '#607D8B' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FFC107';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  if (initialLoading && tasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
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
          <ReloadButton onPress={fetchInitialTasks} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Team Tasks" onMenuPress={toggleSidebar} />
      <View style={styles.mainContent}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
        <ScrollView 
  contentContainerStyle={styles.content}
  onScroll={({nativeEvent}) => {
    if (isCloseToBottom(nativeEvent)) {
      handleLoadMore();
    }
  }}
  scrollEventThrottle={400}
>

          <View style={styles.filterContainer}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Task Type:</Text>
              <Picker
                selectedValue={taskType}
                style={styles.picker}
                onValueChange={(itemValue) => setTaskType(itemValue)}>
                <Picker.Item label="Daily Tasks" value="daily" />
                <Picker.Item label="All Tasks" value="overall" />
              </Picker>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Status:</Text>
              <Picker
                selectedValue={statusFilter}
                style={styles.picker}
                onValueChange={(itemValue) => setStatusFilter(itemValue)}>
                  <Picker.Item label="In Progress" value="in_progress" />
                <Picker.Item label="Completed" value="completed" />
                
                <Picker.Item label="Not Started" value="not_started" />
              </Picker>
            </View>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by task, employee or date (YYYY-MM-DD)..."
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
          />

          {filterLoading ? (
            <View style={styles.filterLoadingContainer}>
              <ActivityIndicator size="large" color="#28a745" />
              <Text style={styles.filterLoadingText}>Updating tasks...</Text>
            </View>
          ) : filteredTasks.length > 0 ? (
            <>
              {filteredTasks.map((task) => {
                const { icon, color } = getStatusIcon(task.status);
                return (
                 <TouchableOpacity 
                    key={task.id} 
                    style={styles.card}
                    onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
                  >
                    <Icon name={icon} size={30} color={color} style={styles.icon} />
                    <View style={styles.taskDetails}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <Text style={styles.details}>Assigned to: {task.assigned_to?.name || 'Unassigned'}</Text>
                      <Text style={styles.details}>Department: {task.assigned_to?.department || 'N/A'}</Text>
                      <Text style={styles.details}>Date: {formatDate(task.date)}</Text>
                      <View style={styles.statusRow}>
                        <Text style={styles.details}>Status: {task.status.replace('_', ' ')}</Text>
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                          <Text style={styles.priorityText}>{task.priority}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
              
              {hasMore && (
                <TouchableOpacity 
                  style={styles.loadMoreButton} 
                  onPress={handleLoadMore}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.loadMoreText}>Load More</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.noResults}>
              <Icon name="search-off" size={40} color="#6c757d" />
              <Text style={styles.noResultsText}>No matching tasks found</Text>
            </View>
          )}
        </ScrollView>
      </View>
      <Footer />
    </SafeAreaView>
  );
};

const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 20;
  return layoutMeasurement.height + contentOffset.y >=contentSize.height - paddingToBottom;
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
  picker: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
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
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  loadMoreButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: 'bold',
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
  filterLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterLoadingText: {
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

export default TeamTasks;