// File: src/screens/Training.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SearchBox from '../components/SearchBox'; // ✅ import reusable component

const Training = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);
  const [searchText, setSearchText] = useState('');
  const trainings = [
    {
      id: 1,
      title: 'Workplace Safety',
      date: '2025-08-05',
      trainer: 'Mr. Ahmed Raza',
      status: 'Scheduled',
    },
    {
      id: 2,
      title: 'Team Communication',
      date: '2025-08-10',
      trainer: 'Ms. Sana Khalid',
      status: 'Completed',
    },
    {
      id: 3,
      title: 'Time Management',
      date: '2025-08-15',
      trainer: 'Mr. Faisal Mehmood',
      status: 'Scheduled',
    },
  ];

  const statusColor = (status) => {
    if (status === 'Completed') return '#4caf50';
    if (status === 'Scheduled') return '#ff9800';
    return '#777';
  };

    const filteredList = trainings.filter(
        (data) =>
        data.title.toLowerCase().includes(searchText.toLowerCase()) ||
        data.trainer.toLowerCase().includes(searchText.toLowerCase())
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <Header title="Training" onMenuPress={toggleSidebar} />
      <View style={styles.mainContent}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Training Programs</Text>

                    <SearchBox
            placeholder="Search employee by name or position"
            searchText={searchText}
            setSearchText={setSearchText}
          />
          {filteredList.map((training) => (
            <View key={training.id} style={styles.card}>
              <Icon name="school" size={24} color="#007bff" style={{ marginBottom: 6 }} />
              <Text style={styles.name}>{training.title}</Text>
              <Text style={styles.detail}>Trainer: {training.trainer}</Text>
              <Text style={styles.detail}>Date: {training.date}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(training.status) }]}>
                <Icon name={training.status === 'Completed' ? 'check-circle' : 'event'} size={14} color="#fff" />
                <Text style={styles.badgeText}>{training.status}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      <Footer />
    </SafeAreaView>
  );
};

export default Training;

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContent: { flex: 1, flexDirection: 'row' },
  content: { padding: 16, flexGrow: 1 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#f1f7ff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2d3a',
    marginBottom: 4,
  },
  detail: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
});
