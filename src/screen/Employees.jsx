import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SearchBox from '../components/SearchBox';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ReloadButton = ({ onPress }) => (
  <TouchableOpacity style={styles.reloadButton} onPress={onPress}>
    <Icon name="refresh" size={20} color="#fff" />
    <Text style={styles.reloadButtonText}>Reload</Text>
  </TouchableOpacity>
);

const Employees = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    const fetchEmployees = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${BASE_URL}/employees`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setEmployees(response.data.data);
        } else {
          setError('Failed to fetch employees');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };


    useEffect(() => {
      fetchEmployees();
    }, []);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  const filteredList = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchText.toLowerCase())) ||
      (emp.department && emp.department.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleEmployeePress = (employee) => {
    navigation.navigate('EmployeeDetails', { 
      employeeId: employee.id,
      // You can pass the entire employee object if needed
      // employeeData: employee 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
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
               <ReloadButton onPress={fetchEmployees} />
             </View>
           </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <Header title="Employees" onMenuPress={toggleSidebar} />

      <View style={styles.mainContent}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
        <ScrollView contentContainerStyle={styles.content}>

          <SearchBox
            placeholder="Search employee by name, position or department"
            searchText={searchText}
            setSearchText={setSearchText}
          />

          {filteredList.length === 0 ? (
            <Text style={styles.noResults}>No employees found</Text>
          ) : (
            filteredList.map((employee) => (
              <TouchableOpacity 
                key={employee.id} 
                style={styles.card}
                onPress={() => handleEmployeePress(employee)}
              >
                {employee.profile_image ? (
                  <Image 
                    source={{ uri: employee.profile_image }} 
                    style={styles.profileImage}
                  />
                ) : (
                  <Icon name="person" size={40} color="#007bff" style={styles.icon} />
                )}
                <View style={styles.employeeInfo}>
                  <Text style={styles.name}>{employee.name}</Text>
                  <Text style={styles.position}>{employee.designation}</Text>
                  <Text style={styles.department}>{employee.department}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.detailsIcon}
                  onPress={() => handleEmployeePress(employee)}
                >
                  <Icon name="chevron-right" size={24} color="#007bff" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <Footer />
    </SafeAreaView>
  );
};

export default Employees;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
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
  },
  position: {
    fontSize: 14,
    color: '#555',
  },
  department: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  detailsIcon: {
    padding: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'red',
    padding: 20,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
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