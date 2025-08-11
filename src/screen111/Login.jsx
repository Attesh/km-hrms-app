import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';



const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('hr');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { role, email, password }); // Debug log
      
      const response = await axios.post(`${BASE_URL}/login`, {
        role,
        email,
        password
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Login response:', response.data); // Debug log
      
      const { token, user } = response.data;
      
      // Store token and user data in AsyncStorage
      await AsyncStorage.multiSet([
        ['userToken', token],
        ['userData', JSON.stringify(user)],
        ['userRole', role]
      ]);

      navigation.navigate('Home');
    } catch (error) {
      // console.error('Full error object:', JSON.stringify(error, null, 2)); // Detailed error log
      
      let errorMessage = 'Login failed. Please try again.';
      let serverMessage = '';
      
      if (axios.isAxiosError(error)) {
        // Axios-specific error handling
        if (error.response) {
          // Server responded with a status code outside 2xx range
          console.log('Error response data:', error.response.data);
          console.log('Error status:', error.response.status);
          console.log('Error headers:', error.response.headers);
          
          serverMessage = error.response.data?.message || error.response.data?.error || '';
          
          switch (error.response.status) {
            case 400:
              errorMessage = serverMessage || 'Invalid request. Please check your inputs.';
              break;
            case 401:
              errorMessage = serverMessage || 'Invalid credentials. Please try again.';
              break;
            case 403:
              errorMessage = serverMessage || 'Access denied. Please contact support.';
              break;
            case 404:
              errorMessage = serverMessage || 'Resource not found. Please try again later.';
              break;
            case 500:
              errorMessage = serverMessage || 'Server error. Our team has been notified. Please try again later.';
              break;
            default:
              errorMessage = serverMessage || 'An unexpected error occurred.';
          }
        } else if (error.request) {
          // Request was made but no response received
          console.log('Error request:', error.request);
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          // Something happened in setting up the request
          console.log('Error config:', error.config);
          errorMessage = 'Request setup error. Please try again.';
        }
      } else {
        // Non-Axios error
        console.log('Non-Axios error:', error);
        errorMessage = 'An unexpected error occurred.';
      }
      
      Alert.alert(
        'Login Failed',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => console.log('User acknowledged login error'),
          },
          error.response?.status === 500 ? {
            text: 'Report Issue',
            onPress: () => {
              // Here you could implement error reporting
              console.log('User wants to report the 500 error');
              // navigation.navigate('ReportIssue', { errorDetails: error.response?.data });
            }
          } : null,
        ].filter(Boolean) // Remove null items
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Icon name="person-pin" size={70} color="#ffffff" style={{ marginBottom: 10 }} />
        <Text style={styles.title}>Welcome to HRMS</Text>
        <Text style={styles.subtitle}>Please sign in to continue</Text>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'hr' && styles.selectedRole]}
            onPress={() => setRole('hr')}
          >
            <Text style={styles.roleText}>HR</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'admin' && styles.selectedRole]}
            onPress={() => setRole('admin')}
          >
            <Text style={styles.roleText}>Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Icon name="person" size={22} color="#777" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#ccc"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Icon name="lock" size={22} color="#777" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#ccc"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>LOGIN</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3c72',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#2a5298',
    padding: 30,
    borderRadius: 20,
    elevation: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#dfe9f3',
    marginBottom: 25,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  roleButton: {
    backgroundColor: '#ffffff11',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff44',
  },
  selectedRole: {
    backgroundColor: '#50d89044',
    borderColor: '#50d890',
  },
  roleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ffffff44',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff11',
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#fff',
  },
  button: {
    backgroundColor: '#50d890',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default LoginScreen;