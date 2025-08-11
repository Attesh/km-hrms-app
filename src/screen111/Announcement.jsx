// File: src/screens/Announcement.js

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

const Announcement = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  // Static announcements
  const announcements = [
    { id: 1, title: 'New HR Policy Update', date: '2025-07-30' },
    { id: 2, title: 'Office Will Be Closed on 14th August', date: '2025-07-29' },
    { id: 3, title: 'Quarterly Meeting on 5th August', date: '2025-07-28' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <Header title="Announcements" onMenuPress={toggleSidebar} />
      <View style={styles.mainContent}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Announcements</Text>
          {announcements.map((item) => (
            <View key={item.id} style={styles.card}>
              <Icon name="campaign" size={30} color="#007bff" style={styles.icon} />
              <View>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                <Text style={styles.date}>Date: {item.date}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      <Footer />
    </SafeAreaView>
  );
};

export default Announcement;

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
    backgroundColor: '#fff0f5',
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
  announcementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  date: {
    fontSize: 14,
    color: '#555',
  },
});
