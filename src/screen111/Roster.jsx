// File: src/screens/Roster.js

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

const Roster = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  const rosterList = [
    { id: 1, employee: 'Imran Ali', shift: 'Morning (9AM - 5PM)' },
    { id: 2, employee: 'Ayesha Khan', shift: 'Evening (1PM - 9PM)' },
    { id: 3, employee: 'Usman Raza', shift: 'Night (9PM - 5AM)' },
    { id: 4, employee: 'Sana Tariq', shift: 'Morning (9AM - 5PM)' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <Header title="Roster" onMenuPress={toggleSidebar} />

      <View style={styles.mainContent}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Roster Schedule</Text>
          {rosterList.map((item) => (
            <View key={item.id} style={styles.card}>
              <Icon
                name="calendar-today"
                size={30}
                color="#28a745"
                style={styles.icon}
              />
              <View>
                <Text style={styles.name}>{item.employee}</Text>
                <Text style={styles.shift}>{item.shift}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <Footer />
    </SafeAreaView>
  );
};

export default Roster;

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
    backgroundColor: '#e6ffed',
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
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  shift: {
    fontSize: 14,
    color: '#555',
  },
});
