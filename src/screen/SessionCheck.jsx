// components/SessionCheck.js
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';

const SessionCheck = ({ navigation }) => {
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get stored credentials
        const [email, password, role] = await AsyncStorage.multiGet([
          'email', 
          'password', 
          'userRole'
        ]);

        console.log('Attempting Session with:', { 
          role: role[1], 
          email: email[1], 
          password: password[1] ? '***' : null 
        });
        
        if (!email[1] || !password[1] || !role[1]) {
          throw new Error('No stored credentials');
        }

        // Attempt to verify session with credentials
        const response = await axios.post(
          `${BASE_URL}/login`,
          {
            email: email[1],
            password: password[1],
            role: role[1]
          },
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            withCredentials: true // Important for session cookies
          }
        );

        console.log('Login response:', response.data);
      
        const { token, user } = response.data;
      
        // Store token and user data in AsyncStorage
        await AsyncStorage.multiSet([
          ['userToken', token],
          ['userData', JSON.stringify(user)],
          ['userRole', user.role || role[1]], // Use server-provided role if available
          ['email', email[1]],
          // Don't store password again - it's already stored
        ]);

        navigation.replace('Home');
      } catch (error) {
        console.log('Session verification failed:', error.response?.data || error.message);
        
        // Clear all stored data
        await AsyncStorage.multiRemove([
          'userToken',
          'userData',
          'userRole',
          'email',
          'password'
        ]);
        
        navigation.replace('Login', { 
          error: error.response?.data?.message || 'Session expired. Please log in again.'
        });
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigation]); // Added navigation to dependency array

  if (checkingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
};

export default SessionCheck;