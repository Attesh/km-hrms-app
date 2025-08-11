import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Header = ({ title, onMenuPress, showBackButton }) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['userToken', 'userData', 'userRole']);
              navigation.navigate('Login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout properly');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.header}>
      {/* Conditional rendering for back button or menu icon */}
      {showBackButton ? (
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.iconContainer}
        >
          <Icon name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onMenuPress} style={styles.iconContainer}>
          <Icon name="menu" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Title */}
      <Text style={styles.headerText}>{title}</Text>

      {/* Logout Icon */}
      <TouchableOpacity onPress={handleLogout} style={styles.iconContainer}>
        <Icon name="power-settings-new" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  iconContainer: {
    marginHorizontal: 10,
  },
});

export default Header;